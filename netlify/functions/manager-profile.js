const {SUPABASE_URL,json,context,response,assertSameOrigin,resolveBranch}=require("./lib/manager-auth");
const branchFields=["brand_name","logo_url","primary_color","city","address","phone","whatsapp"];
const settingFields=["hero_badge_text","hero_description","instagram_url","tiktok_url","gmaps_url","softlens_catalog_url","rewards_url","meta_title","meta_description"];
exports.handler=async(event)=>{
 let ctx;
 try{
  ctx=await context(event);
  const requested=event.queryStringParameters?.branch_id;
  const branchId=await resolveBranch(ctx,requested);
  if(event.httpMethod==="GET"){
   const [br,sr]=await Promise.all([
    fetch(SUPABASE_URL+"/rest/v1/branches?select=id,slug,brand_name,logo_url,primary_color,city,address,phone,whatsapp&id=eq."+encodeURIComponent(branchId),{headers:ctx.headers}),
    fetch(SUPABASE_URL+"/rest/v1/branch_settings?select=branch_id,hero_badge_text,hero_description,instagram_url,tiktok_url,gmaps_url,softlens_catalog_url,rewards_url,meta_title,meta_description,updated_at&branch_id=eq."+encodeURIComponent(branchId),{headers:ctx.headers})
   ]);
   const [b,s]=await Promise.all([br.json(),sr.json()]);
   if(!br.ok||!sr.ok)throw Object.assign(new Error("Gagal memuat profil toko."),{statusCode:502});
   let branches=[];
   if(ctx.member.role==="owner"){
    const list=await fetch(SUPABASE_URL+"/rest/v1/branches?select=id,brand_name,slug,is_active&order=brand_name.asc",{headers:ctx.headers});
    branches=await list.json();if(!list.ok)throw Object.assign(new Error("Gagal memuat daftar cabang."),{statusCode:502});
   }
   return response(200,{branch:b[0]||null,settings:s[0]||{},branches,role:ctx.member.role},ctx);
  }
  if(event.httpMethod==="PATCH"){
   assertSameOrigin(event);
   let body;try{body=JSON.parse(event.body||"{}")}catch{throw Object.assign(new Error("Format data tidak valid."),{statusCode:400})}
   const branch={},settings={branch_id:branchId};
   for(const k of branchFields)if(Object.hasOwn(body,k))branch[k]=String(body[k]??"").trim();
   for(const k of settingFields)if(Object.hasOwn(body,k))settings[k]=String(body[k]??"").trim();
   if(!Object.keys(branch).length&&!Object.keys(settings).length)throw Object.assign(new Error("Tidak ada perubahan untuk disimpan."),{statusCode:400});
   if(Object.keys(branch).length){
    branch.updated_at=new Date().toISOString();
    const r=await fetch(SUPABASE_URL+"/rest/v1/branches?id=eq."+encodeURIComponent(branchId),{method:"PATCH",headers:{...ctx.headers,Prefer:"return=representation"},body:JSON.stringify(branch)});
    const data=await r.json();if(!r.ok)throw Object.assign(new Error(data.message||"Gagal menyimpan data toko."),{statusCode:400});
   }
   if(Object.keys(settings).length>1){
    settings.updated_at=new Date().toISOString();
    const r=await fetch(SUPABASE_URL+"/rest/v1/branch_settings?on_conflict=branch_id",{method:"POST",headers:{...ctx.headers,Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(settings)});
    const data=await r.json();if(!r.ok)throw Object.assign(new Error(data.message||"Gagal menyimpan pengaturan website."),{statusCode:400});
   }
   return response(200,{ok:true,message:"Profil toko berhasil disimpan."},ctx);
  }
  return response(405,{error:"Metode tidak diizinkan."},ctx);
 }catch(e){return response(e.statusCode||500,{error:e.message||"Terjadi kesalahan."},e.clearCookie?{clearCookie:true}:ctx)}
};