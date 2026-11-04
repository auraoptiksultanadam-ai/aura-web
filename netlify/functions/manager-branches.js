const {SUPABASE_URL,context,response,assertSameOrigin}=require("./lib/manager-auth");
const base=()=>SUPABASE_URL+"/rest/v1/";
exports.handler=async event=>{let ctx;try{ctx=await context(event);if(ctx.member.role!=="owner")throw Object.assign(new Error("Hanya Owner yang dapat mengelola cabang."),{statusCode:403});
if(event.httpMethod==="GET"){
 const [br,dr,ur]=await Promise.all([
 fetch(base()+"branches?select=id,slug,brand_name,logo_url,primary_color,city,address,phone,whatsapp,is_active,created_at,updated_at&order=brand_name.asc",{headers:ctx.headers}),
 fetch(base()+"branch_domains?select=id,branch_id,hostname,is_primary,is_active,created_at&order=hostname.asc",{headers:ctx.headers}),
 fetch(base()+"branch_users?select=id,user_id,branch_id,role,is_active,created_at&order=created_at.desc",{headers:ctx.headers})
 ]);
 const [branches,domains,users]=await Promise.all([br.json(),dr.json(),ur.json()]);
 if(!br.ok||!dr.ok||!ur.ok)throw Object.assign(new Error("Gagal memuat data cabang."),{statusCode:502});
 return response(200,{branches,domains,users},ctx);
}
if(!["POST","PATCH","DELETE"].includes(event.httpMethod))return response(405,{error:"Metode tidak diizinkan."},ctx);assertSameOrigin(event);
const type=event.queryStringParameters?.type,id=event.queryStringParameters?.id;
const tables={branches:["slug","brand_name","logo_url","primary_color","city","address","phone","whatsapp","is_active"],domains:["branch_id","hostname","is_primary","is_active"],users:["user_id","branch_id","role","is_active"]};
if(!tables[type])throw Object.assign(new Error("Jenis data tidak valid."),{statusCode:400});
const table=type==="branches"?"branches":type==="domains"?"branch_domains":"branch_users";
if(event.httpMethod==="DELETE"){if(!id)throw Object.assign(new Error("ID data tidak ditemukan."),{statusCode:400});if(type==="branches"){const count=await fetch(base()+"branches?select=id&id=eq."+encodeURIComponent(id),{headers:ctx.headers});const rows=await count.json();if(rows.length===1&&rows[0].id===id)throw Object.assign(new Error("Cabang tidak dihapus permanen dari panel ini. Nonaktifkan cabang untuk menjaga histori."),{statusCode:400});}
const r=await fetch(base()+table+"?id=eq."+encodeURIComponent(id),{method:"DELETE",headers:{...ctx.headers,Prefer:"return=minimal"}});if(!r.ok)throw Object.assign(new Error("Gagal menghapus data."),{statusCode:400});return response(200,{ok:true,message:"Data berhasil dihapus."},ctx);}
let body;try{body=JSON.parse(event.body||"{}")}catch{throw Object.assign(new Error("Format data tidak valid."),{statusCode:400})}
const data={};for(const k of tables[type])if(Object.hasOwn(body,k))data[k]=body[k];
if(type==="branches"){if(!data.slug||!data.brand_name)throw Object.assign(new Error("Slug dan nama cabang wajib diisi."),{statusCode:400});data.slug=String(data.slug).toLowerCase().trim().replace(/[^a-z0-9-]/g,"-");data.brand_name=String(data.brand_name).trim();data.updated_at=new Date().toISOString();}
if(type==="domains"){if(!data.branch_id||!data.hostname)throw Object.assign(new Error("Cabang dan hostname wajib diisi."),{statusCode:400});data.hostname=String(data.hostname).toLowerCase().trim().replace(/^https?:\/\//,"").replace(/\/$/,"");}
if(type==="users"){if(!data.user_id||!data.role||!["owner","branch_manager"].includes(data.role))throw Object.assign(new Error("User ID dan role yang valid wajib diisi."),{statusCode:400});if(data.role==="branch_manager"&&!data.branch_id)throw Object.assign(new Error("Pengelola harus ditautkan ke cabang."),{statusCode:400});}
const url=event.httpMethod==="PATCH"?(id?base()+table+"?id=eq."+encodeURIComponent(id):null):base()+table;if(!url)throw Object.assign(new Error("ID data tidak ditemukan."),{statusCode:400});
const r=await fetch(url,{method:event.httpMethod,headers:{...ctx.headers,Prefer:"return=representation"},body:JSON.stringify(data)});const result=await r.json();if(!r.ok)throw Object.assign(new Error(result.message||"Gagal menyimpan data."),{statusCode:400});return response(200,{ok:true,item:result[0],message:"Data cabang berhasil disimpan."},ctx);
}catch(e){return response(e.statusCode||500,{error:e.message||"Terjadi kesalahan."},e.clearCookie?{clearCookie:true}:ctx)}};