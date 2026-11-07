const {SUPABASE_URL,context,response,assertSameOrigin,resolveBranch}=require("./lib/manager-auth");
const base=()=>SUPABASE_URL+"/rest/v1/";
const validContent=value=>value&&typeof value==="object"&&!Array.isArray(value)&&value.version===1&&value.elements&&typeof value.elements==="object"&&Array.isArray(value.sections)&&JSON.stringify(value).length<=600000;
exports.handler=async event=>{let ctx;try{
 ctx=await context(event);const branchId=await resolveBranch(ctx,event.queryStringParameters?.branch_id);const pageKey=String(event.queryStringParameters?.page||"home").replace(/[^a-z0-9_-]/gi,"").slice(0,40)||"home";
 if(event.httpMethod==="GET"){
  const [draftRes,pubRes,revRes]=await Promise.all([
   fetch(base()+"site_page_drafts?select=id,title,content,updated_at&branch_id=eq."+encodeURIComponent(branchId)+"&page_key=eq."+encodeURIComponent(pageKey)+"&limit=1",{headers:ctx.headers}),
   fetch(base()+"site_pages?select=id,title,published_content,published_at,is_published&branch_id=eq."+encodeURIComponent(branchId)+"&page_key=eq."+encodeURIComponent(pageKey)+"&limit=1",{headers:ctx.headers}),
   fetch(base()+"site_page_revisions?select=id,created_at&branch_id=eq."+encodeURIComponent(branchId)+"&page_key=eq."+encodeURIComponent(pageKey)+"&order=created_at.desc&limit=20",{headers:ctx.headers})
  ]);
  const [draft,published,revisions]=await Promise.all([draftRes.json(),pubRes.json(),revRes.json()]);
  if(!draftRes.ok||!pubRes.ok||!revRes.ok)throw Object.assign(new Error("Gagal memuat data editor."),{statusCode:502});
  return response(200,{branch_id:branchId,page_key:pageKey,draft:draft[0]||null,published:published[0]||null,revisions},ctx);
 }
 if(!["PUT","POST"].includes(event.httpMethod))return response(405,{error:"Metode tidak diizinkan."},ctx);
 assertSameOrigin(event);let body;try{body=JSON.parse(event.body||"{}")}catch{throw Object.assign(new Error("Format data tidak valid."),{statusCode:400})}
 if(event.httpMethod==="PUT"){
  if(!validContent(body.content))throw Object.assign(new Error("Struktur draft tidak valid atau terlalu besar."),{statusCode:400});
  const payload={branch_id:branchId,page_key:pageKey,title:String(body.title||"Beranda").slice(0,120),content:body.content,updated_by:ctx.user?.id||null,updated_at:new Date().toISOString()};
  const r=await fetch(base()+"site_page_drafts?on_conflict=branch_id,page_key",{method:"POST",headers:{...ctx.headers,Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(payload)});
  const rows=await r.json();if(!r.ok)throw Object.assign(new Error(rows.message||"Gagal menyimpan draft."),{statusCode:400});
  return response(200,{ok:true,draft:rows[0],message:"Draft editor berhasil disimpan."},ctx);
 }
 if(body.action==="publish"){
  const dr=await fetch(base()+"site_page_drafts?select=title,content&branch_id=eq."+encodeURIComponent(branchId)+"&page_key=eq."+encodeURIComponent(pageKey)+"&limit=1",{headers:ctx.headers});
  const drafts=await dr.json();if(!dr.ok||!drafts.length)throw Object.assign(new Error("Simpan draft sebelum memublikasikan."),{statusCode:400});
  const old=await fetch(base()+"site_pages?select=published_content&branch_id=eq."+encodeURIComponent(branchId)+"&page_key=eq."+encodeURIComponent(pageKey)+"&limit=1",{headers:ctx.headers});
  const oldRows=await old.json();if(oldRows[0]?.published_content){await fetch(base()+"site_page_revisions",{method:"POST",headers:{...ctx.headers,Prefer:"return=minimal"},body:JSON.stringify({branch_id:branchId,page_key:pageKey,content:oldRows[0].published_content,created_by:ctx.user?.id||null})});}
  const p={branch_id:branchId,page_key:pageKey,title:drafts[0].title,published_content:drafts[0].content,is_published:true,published_at:new Date().toISOString(),updated_at:new Date().toISOString()};
  const r=await fetch(base()+"site_pages?on_conflict=branch_id,page_key",{method:"POST",headers:{...ctx.headers,Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(p)});
  const rows=await r.json();if(!r.ok)throw Object.assign(new Error(rows.message||"Gagal memublikasikan halaman."),{statusCode:400});
  await fetch(base()+"site_page_revisions",{method:"POST",headers:{...ctx.headers,Prefer:"return=minimal"},body:JSON.stringify({branch_id:branchId,page_key:pageKey,content:drafts[0].content,created_by:ctx.user?.id||null})});
  return response(200,{ok:true,published_at:p.published_at,message:"Halaman berhasil dipublikasikan."},ctx);
 }
 if(body.action==="restore"&&body.revision_id){
  const rr=await fetch(base()+"site_page_revisions?select=content&id=eq."+encodeURIComponent(body.revision_id)+"&branch_id=eq."+encodeURIComponent(branchId)+"&page_key=eq."+encodeURIComponent(pageKey)+"&limit=1",{headers:ctx.headers});
  const rows=await rr.json();if(!rr.ok||!rows.length)throw Object.assign(new Error("Versi tidak ditemukan."),{statusCode:404});
  const payload={branch_id:branchId,page_key:pageKey,title:"Beranda",content:rows[0].content,updated_by:ctx.user?.id||null,updated_at:new Date().toISOString()};
  const r=await fetch(base()+"site_page_drafts?on_conflict=branch_id,page_key",{method:"POST",headers:{...ctx.headers,Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(payload)});
  const out=await r.json();if(!r.ok)throw Object.assign(new Error("Gagal memulihkan versi."),{statusCode:400});
  return response(200,{ok:true,draft:out[0],message:"Versi dipulihkan ke draft. Periksa lalu publikasikan."},ctx);
 }
 throw Object.assign(new Error("Aksi editor tidak dikenal."),{statusCode:400});
}catch(e){return response(e.statusCode||500,{error:e.message||"Terjadi kesalahan."},e.clearCookie?{clearCookie:true}:ctx)}};