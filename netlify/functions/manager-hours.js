const {SUPABASE_URL,context,response,assertSameOrigin,resolveBranch}=require("./lib/manager-auth");
exports.handler=async(event)=>{
 let ctx;
 try{
  ctx=await context(event);
  const branchId=await resolveBranch(ctx,event.queryStringParameters?.branch_id);
  if(event.httpMethod==="GET"){
   const r=await fetch(SUPABASE_URL+"/rest/v1/operating_hours?select=branch_id,day_of_week,open_time,close_time,is_closed,notes&branch_id=eq."+encodeURIComponent(branchId)+"&order=day_of_week.asc",{headers:ctx.headers});
   const rows=await r.json();if(!r.ok)throw Object.assign(new Error("Gagal memuat jam operasional."),{statusCode:502});
   return response(200,{hours:rows,branch_id:branchId},ctx);
  }
  if(event.httpMethod==="PUT"){
   assertSameOrigin(event);
   let body;try{body=JSON.parse(event.body||"{}")}catch{throw Object.assign(new Error("Format data tidak valid."),{statusCode:400})}
   if(!Array.isArray(body.hours)||body.hours.length!==7)throw Object.assign(new Error("Data harus berisi jadwal untuk 7 hari."),{statusCode:400});
   const seen=new Set();
   const rows=body.hours.map(x=>{
    const day=Number(x.day_of_week);
    if(!Number.isInteger(day)||day<0||day>6||seen.has(day))throw Object.assign(new Error("Urutan hari tidak valid."),{statusCode:400});
    seen.add(day);
    const closed=Boolean(x.is_closed);
    const open=String(x.open_time||"").slice(0,5),close=String(x.close_time||"").slice(0,5);
    if(!closed&&(!/^([01]\d|2[0-3]):[0-5]\d$/.test(open)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(close)||open===close))throw Object.assign(new Error("Jam buka dan tutup harus diisi dengan benar."),{statusCode:400});
    return {branch_id:branchId,day_of_week:day,open_time:closed?null:open,close_time:closed?null:close,is_closed:closed,notes:String(x.notes||"").trim()};
   });
   const r=await fetch(SUPABASE_URL+"/rest/v1/operating_hours?on_conflict=branch_id,day_of_week",{method:"POST",headers:{...ctx.headers,Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(rows)});
   const data=await r.json();if(!r.ok)throw Object.assign(new Error(data.message||"Gagal menyimpan jam operasional."),{statusCode:400});
   return response(200,{ok:true,hours:data,message:"Jam operasional berhasil disimpan."},ctx);
  }
  return response(405,{error:"Metode tidak diizinkan."},ctx);
 }catch(e){return response(e.statusCode||500,{error:e.message||"Terjadi kesalahan."},e.clearCookie?{clearCookie:true}:ctx)}
};