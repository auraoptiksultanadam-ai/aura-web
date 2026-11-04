const {SUPABASE_URL,context,response,assertSameOrigin,resolveBranch}=require("./lib/manager-auth");
const types=["frame","lens","softlens"];
const allowed={categories:["name","product_type","sort_order","is_active"],products:["category_id","product_type","name","brand","badge","description","image_url","wa_text","sort_order","is_active"]};
exports.handler=async(event)=>{
 let ctx;
 try{
  ctx=await context(event);
  const branchId=await resolveBranch(ctx,event.queryStringParameters?.branch_id);
  const base=SUPABASE_URL+"/rest/v1/";
  if(event.httpMethod==="GET"){
   const [cr,pr]=await Promise.all([
    fetch(base+"product_categories?select=id,branch_id,name,product_type,sort_order,is_active&branch_id=eq."+encodeURIComponent(branchId)+"&order=sort_order.asc,name.asc",{headers:ctx.headers}),
    fetch(base+"products?select=id,branch_id,category_id,product_type,name,brand,badge,description,image_url,wa_text,sort_order,is_active,created_at,updated_at&branch_id=eq."+encodeURIComponent(branchId)+"&order=sort_order.asc,created_at.desc",{headers:ctx.headers})
   ]);
   const [categories,products]=await Promise.all([cr.json(),pr.json()]);
   if(!cr.ok||!pr.ok)throw Object.assign(new Error("Gagal memuat katalog produk."),{statusCode:502});
   return response(200,{categories,products,branch_id:branchId},ctx);
  }
  if(!["POST","PATCH","DELETE"].includes(event.httpMethod))return response(405,{error:"Metode tidak diizinkan."},ctx);
  assertSameOrigin(event);
  const type=event.queryStringParameters?.type;
  if(!["categories","products"].includes(type))throw Object.assign(new Error("Jenis data tidak valid."),{statusCode:400});
  const table=type==="categories"?"product_categories":"products";
  const id=event.queryStringParameters?.id;
  if(event.httpMethod==="DELETE"){
   if(!id)throw Object.assign(new Error("ID data tidak ditemukan."),{statusCode:400});
   const r=await fetch(base+table+"?id=eq."+encodeURIComponent(id)+"&branch_id=eq."+encodeURIComponent(branchId),{method:"DELETE",headers:{...ctx.headers,Prefer:"return=minimal"}});
   if(!r.ok){const d=await r.json();throw Object.assign(new Error(d.message||"Gagal menghapus data."),{statusCode:400});}
   return response(200,{ok:true,message:type==="categories"?"Kategori berhasil dihapus.":"Produk berhasil dihapus."},ctx);
  }
  let body;try{body=JSON.parse(event.body||"{}")}catch{throw Object.assign(new Error("Format data tidak valid."),{statusCode:400})}
  const data={branch_id:branchId};
  for(const key of allowed[type])if(Object.hasOwn(body,key))data[key]=body[key];
  if(type==="categories"){
   if(!String(data.name||"").trim())throw Object.assign(new Error("Nama kategori wajib diisi."),{statusCode:400});
   if(!types.includes(data.product_type))throw Object.assign(new Error("Jenis kategori tidak valid."),{statusCode:400});
   data.name=String(data.name).trim();data.sort_order=Number(data.sort_order)||0;data.is_active=data.is_active!==false;
  }else{
   if(!String(data.name||"").trim())throw Object.assign(new Error("Nama produk wajib diisi."),{statusCode:400});
   if(!types.includes(data.product_type))throw Object.assign(new Error("Jenis produk tidak valid."),{statusCode:400});
   data.name=String(data.name).trim();data.sort_order=Number(data.sort_order)||0;data.is_active=data.is_active!==false;
   for(const k of ["brand","badge","description","image_url","wa_text"])if(k in data)data[k]=String(data[k]??"").trim();
   if(data.category_id==="")data.category_id=null;
   if(data.category_id){
    const check=await fetch(base+"product_categories?select=id&id=eq."+encodeURIComponent(data.category_id)+"&branch_id=eq."+encodeURIComponent(branchId),{headers:ctx.headers});
    const rows=await check.json();if(!check.ok||!rows.length)throw Object.assign(new Error("Kategori tidak ditemukan pada cabang ini."),{statusCode:400});
   }
   data.updated_at=new Date().toISOString();
  }
  const url=event.httpMethod==="PATCH"?(id?base+table+"?id=eq."+encodeURIComponent(id)+"&branch_id=eq."+encodeURIComponent(branchId):null):base+table;
  if(!url)throw Object.assign(new Error("ID data tidak ditemukan."),{statusCode:400});
  const r=await fetch(url,{method:event.httpMethod,headers:{...ctx.headers,Prefer:"return=representation"},body:JSON.stringify(data)});
  const result=await r.json();if(!r.ok)throw Object.assign(new Error(result.message||"Gagal menyimpan data."),{statusCode:400});
  return response(200,{ok:true,item:Array.isArray(result)?result[0]:result,message:type==="categories"?"Kategori berhasil disimpan.":"Produk berhasil disimpan."},ctx);
 }catch(e){return response(e.statusCode||500,{error:e.message||"Terjadi kesalahan."},e.clearCookie?{clearCookie:true}:ctx)}
};