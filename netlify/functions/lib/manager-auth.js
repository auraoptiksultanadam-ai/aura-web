const SUPABASE_URL=process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY=process.env.SUPABASE_ANON_KEY;
const json=(statusCode,body,extra={})=>({statusCode,headers:{"Content-Type":"application/json","Cache-Control":"no-store",...extra},body:JSON.stringify(body)});
function readSession(event){
 const raw=event.headers.cookie||event.headers.Cookie||"";
 const value=raw.split(";").map(v=>v.trim()).find(v=>v.startsWith("aura_manager_session="))?.slice("aura_manager_session=".length);
 if(!value)return null;
 try{return JSON.parse(Buffer.from(decodeURIComponent(value),"base64url").toString("utf8"))}catch{return null}
}
function cookie(session){
 return "aura_manager_session="+Buffer.from(JSON.stringify({access_token:session.access_token,refresh_token:session.refresh_token})).toString("base64url")+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000";
}
async function context(event){
 if(!SUPABASE_URL||!SUPABASE_ANON_KEY)throw Object.assign(new Error("Konfigurasi server belum lengkap."),{statusCode:500});
 let session=readSession(event);
 if(!session?.access_token||!session?.refresh_token)throw Object.assign(new Error("Sesi tidak ditemukan. Silakan login kembali."),{statusCode:401});
 let userRes=await fetch(SUPABASE_URL+"/auth/v1/user",{headers:{apikey:SUPABASE_ANON_KEY,Authorization:"Bearer "+session.access_token}});
 let refreshed=false;
 if(!userRes.ok){
  const rr=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{apikey:SUPABASE_ANON_KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:session.refresh_token})});
  const next=await rr.json();
  if(!rr.ok||!next.access_token||!next.refresh_token)throw Object.assign(new Error("Sesi berakhir. Silakan login kembali."),{statusCode:401,clearCookie:true});
  session=next;refreshed=true;
  userRes=await fetch(SUPABASE_URL+"/auth/v1/user",{headers:{apikey:SUPABASE_ANON_KEY,Authorization:"Bearer "+session.access_token}});
 }
 if(!userRes.ok)throw Object.assign(new Error("Sesi tidak valid."),{statusCode:401});
 const user=await userRes.json();
 const headers={apikey:SUPABASE_ANON_KEY,Authorization:"Bearer "+session.access_token,"Content-Type":"application/json"};
 const mr=await fetch(SUPABASE_URL+"/rest/v1/branch_users?select=role,branch_id,is_active&user_id=eq."+encodeURIComponent(user.id)+"&is_active=eq.true",{headers});
 const members=await mr.json();
 if(!mr.ok||!Array.isArray(members))throw Object.assign(new Error("Gagal memeriksa hak akses."),{statusCode:502});
 const member=members.find(x=>x.role==="owner"||x.role==="branch_manager");
 if(!member)throw Object.assign(new Error("Akun tidak memiliki akses aktif."),{statusCode:403});
 return {session,refreshed,member,headers,user};
}
function response(statusCode,body,ctx){
 const extra={};
 if(ctx?.refreshed)extra["Set-Cookie"]=cookie(ctx.session);
 if(ctx?.clearCookie)extra["Set-Cookie"]="aura_manager_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
 return json(statusCode,body,extra);
}
function assertSameOrigin(event){
 const origin=event.headers.origin||event.headers.Origin;
 const host=event.headers.host||event.headers.Host;
 if(!origin||!host)throw Object.assign(new Error("Permintaan tidak valid."),{statusCode:403});
 try{const u=new URL(origin);if(u.protocol!=="https:"||u.host!==host)throw new Error()}catch{throw Object.assign(new Error("Asal permintaan tidak diizinkan."),{statusCode:403})}
}
async function resolveBranch(ctx,requested){
 if(ctx.member.role==="branch_manager"){
  if(!ctx.member.branch_id)throw Object.assign(new Error("Cabang akun tidak ditemukan."),{statusCode:403});
  return ctx.member.branch_id;
 }
 if(requested){
  const r=await fetch(SUPABASE_URL+"/rest/v1/branches?select=id&id=eq."+encodeURIComponent(requested),{headers:ctx.headers});
  const rows=await r.json();if(!r.ok||!rows.length)throw Object.assign(new Error("Cabang tidak ditemukan atau tidak dapat diakses."),{statusCode:404});
  return requested;
 }
 const r=await fetch(SUPABASE_URL+"/rest/v1/branches?select=id&is_active=eq.true&order=brand_name.asc&limit=1",{headers:ctx.headers});
 const rows=await r.json();if(!r.ok||!rows.length)throw Object.assign(new Error("Belum ada cabang aktif."),{statusCode:404});
 return rows[0].id;
}
module.exports={SUPABASE_URL,json,context,response,assertSameOrigin,resolveBranch};