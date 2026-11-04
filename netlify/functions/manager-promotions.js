const {SUPABASE_URL,context,response,assertSameOrigin,resolveBranch}=require("./lib/manager-auth");
const base=()=>SUPABASE_URL+"/rest/v1/promotions";
const allowed=["category","title","description","image_url","cta_label","cta_link","status","starts_at","ends_at","sort_order"];
exports.handler=async event=>{let ctx;try{ctx=await context(event);const branchId=await resolveBranch(ctx,event.queryStringParameters?.branch_id);
if(event.httpMethod==="GET"){const r=await fetch(base()+"?select=id,branch_id,category,title,description,image_url,cta_label,cta_link,status,starts_at,ends_at,sort_order,created_at,updated_at&branch_id=eq."+encodeURIComponent(branchId)+"&order=sort_order.asc,created_at.desc",{headers:ctx.headers});const rows=await r.json();if(!r.ok)throw Object.assign(new Error("Gagal memuat promosi."),{statusCode:502});return response(200,{promotions:rows,branch_id:branchId},ctx);}
if(!["POST","PATCH","DELETE"].includes(event.httpMethod))return response(405,{error:"Metode tidak diizinkan."},ctx);assertSameOrigin(event);
const id=event.queryStringParameters?.id;
if(event.httpMethod==="DELETE"){if(!id)throw Object.assign(new Error("ID promosi tidak ditemukan."),{statusCode:400});const r=await fetch(base()+"?id=eq."+encodeURIComponent(id)+"&branch_id=eq."+encodeURIComponent(branchId),{method:"DELETE",headers:{...ctx.headers,Prefer:"return=minimal"}});if(!r.ok)throw Object.assign(new Error("Gagal menghapus promosi."),{statusCode:400});return response(200,{ok:true,message:"Promosi dihapus."},ctx);}
let body;try{body=JSON.parse(event.body||"{}")}catch{throw Object.assign(new Error("Format data tidak valid."),{statusCode:400})}
const data={branch_id:branchId};for(const k of allowed)if(Object.hasOwn(body,k))data[k]=body[k];
if(!String(data.title||"").trim())throw Object.assign(new Error("Judul promosi wajib diisi."),{statusCode:400});
if(!["promo","event","announcement"].includes(data.category||"promo"))throw Object.assign(new Error("Kategori promosi tidak valid."),{statusCode:400});
if(!["draft","published","archived"].includes(data.status||"draft"))throw Object.assign(new Error("Status promosi tidak valid."),{statusCode:400});
data.title=String(data.title).trim();data.updated_at=new Date().toISOString();if(data.starts_at==="")data.starts_at=null;if(data.ends_at==="")data.ends_at=null;
const url=event.httpMethod==="PATCH"?(id?base()+"?id=eq."+encodeURIComponent(id)+"&branch_id=eq."+encodeURIComponent(branchId):null):base();if(!url)throw Object.assign(new Error("ID promosi tidak ditemukan."),{statusCode:400});
const r=await fetch(url,{method:event.httpMethod,headers:{...ctx.headers,Prefer:"return=representation"},body:JSON.stringify(data)});const result=await r.json();if(!r.ok)throw Object.assign(new Error(result.message||"Gagal menyimpan promosi."),{statusCode:400});return response(200,{ok:true,item:result[0],message:"Promosi berhasil disimpan."},ctx);
}catch(e){return response(e.statusCode||500,{error:e.message||"Terjadi kesalahan."},e.clearCookie?{clearCookie:true}:ctx)}};