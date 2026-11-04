const SUPABASE_URL=process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY=process.env.SUPABASE_ANON_KEY;
const json=(statusCode,body,extra={})=>({statusCode,headers:{"Content-Type":"application/json","Cache-Control":"no-store",...extra},body:JSON.stringify(body)});
const readSession=(event)=>{const raw=event.headers.cookie||event.headers.Cookie||"";const value=raw.split(";").map(v=>v.trim()).find(v=>v.startsWith("aura_manager_session="))?.slice("aura_manager_session=".length);if(!value)return null;try{return JSON.parse(Buffer.from(decodeURIComponent(value),"base64url").toString("utf8"))}catch{return null}};
const sessionCookie=(s)=>"aura_manager_session="+Buffer.from(JSON.stringify({access_token:s.access_token,refresh_token:s.refresh_token})).toString("base64url")+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000";
exports.handler=async(event)=>{
  if(event.httpMethod!=="GET")return json(405,{error:"Method tidak diizinkan."},{Allow:"GET"});
  if(!SUPABASE_URL||!SUPABASE_ANON_KEY)return json(500,{error:"Konfigurasi autentikasi server belum lengkap."});
  let session=readSession(event);
  if(!session?.access_token||!session?.refresh_token)return json(401,{error:"Sesi tidak ditemukan."});
  const headers={"apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+session.access_token};
  try{
    let userRes=await fetch(SUPABASE_URL+"/auth/v1/user",{headers});
    let refreshed=false;
    if(!userRes.ok){
      const refreshRes=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_ANON_KEY},body:JSON.stringify({refresh_token:session.refresh_token})});
      const next=await refreshRes.json();
      if(!refreshRes.ok||!next.access_token||!next.refresh_token)return json(401,{error:"Sesi berakhir. Silakan login kembali."},{ "Set-Cookie":"aura_manager_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" });
      session=next;refreshed=true;
      userRes=await fetch(SUPABASE_URL+"/auth/v1/user",{headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+session.access_token}});
    }
    if(!userRes.ok)return json(401,{error:"Sesi tidak valid."});
    const user=await userRes.json();
    const authHeaders={"apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+session.access_token};
    const mRes=await fetch(SUPABASE_URL+"/rest/v1/branch_users?select=role,branch_id,is_active&user_id=eq."+encodeURIComponent(user.id)+"&is_active=eq.true",{headers:authHeaders});
    const rows=await mRes.json();
    if(!mRes.ok||!Array.isArray(rows))return json(502,{error:"Gagal memeriksa hak akses."});
    const member=rows.find(row=>row.role==="owner"||row.role==="branch_manager");
    if(!member)return json(403,{error:"Akun tidak memiliki akses aktif."});
    let branch_name=null;
    if(member.branch_id){const b=await fetch(SUPABASE_URL+"/rest/v1/branches?select=brand_name&id=eq."+encodeURIComponent(member.branch_id),{headers:authHeaders});const data=await b.json();branch_name=Array.isArray(data)?data[0]?.brand_name||null:null;}
    return json(200,{role:member.role,branch_id:member.branch_id,branch_name},refreshed?{"Set-Cookie":sessionCookie(session)}:{});
  }catch{return json(502,{error:"Gagal memeriksa sesi."})}
};