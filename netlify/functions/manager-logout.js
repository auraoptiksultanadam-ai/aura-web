const SUPABASE_URL=process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY=process.env.SUPABASE_ANON_KEY;
exports.handler=async(event)=>{
  if(event.httpMethod!=="POST")return {statusCode:405,headers:{"Allow":"POST"},body:""};
  const raw=event.headers.cookie||event.headers.Cookie||"";
  const value=raw.split(";").map(v=>v.trim()).find(v=>v.startsWith("aura_manager_session="))?.slice("aura_manager_session=".length);
  if(value&&SUPABASE_URL&&SUPABASE_ANON_KEY){
    try{const s=JSON.parse(Buffer.from(decodeURIComponent(value),"base64url").toString("utf8"));if(s.access_token)await fetch(SUPABASE_URL+"/auth/v1/logout",{method:"POST",headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+s.access_token}})}catch{}
  }
  return {statusCode:200,headers:{"Content-Type":"application/json","Cache-Control":"no-store","Set-Cookie":"aura_manager_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"},body:JSON.stringify({ok:true})};
};