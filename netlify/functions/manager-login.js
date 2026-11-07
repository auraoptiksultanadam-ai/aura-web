const SUPABASE_URL=process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY=process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
const json=(statusCode,body,extra={})=>({statusCode,headers:{"Content-Type":"application/json","Cache-Control":"no-store",...extra},body:JSON.stringify(body)});
const sessionCookie=session=>"aura_manager_session="+Buffer.from(JSON.stringify({access_token:session.access_token,refresh_token:session.refresh_token})).toString("base64url")+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000";
exports.handler=async event=>{
 if(event.httpMethod!=="POST")return json(405,{error:"Metode tidak diizinkan."},{Allow:"POST"});
 if(!SUPABASE_URL||!SUPABASE_ANON_KEY||!SUPABASE_SERVICE_ROLE_KEY)return json(500,{error:"Konfigurasi autentikasi server belum lengkap."});
 let input;try{input=JSON.parse(event.body||"{}")}catch{return json(400,{error:"Permintaan tidak valid."})}
 const identifier=String(input.username||input.email||"").trim().toLowerCase(),password=String(input.password||"");
 if(!identifier||!password)return json(400,{error:"Username dan password wajib diisi."});
 const adminHeaders={apikey:SUPABASE_SERVICE_ROLE_KEY,Authorization:"Bearer "+SUPABASE_SERVICE_ROLE_KEY};
 try{
  let email=identifier,account=null;
  if(!identifier.includes("@")){
   const lookup=await fetch(SUPABASE_URL+"/rest/v1/manager_accounts?select=user_id,username,must_change_password&username=eq."+encodeURIComponent(identifier),{headers:adminHeaders});
   const accounts=await lookup.json();
   if(!lookup.ok)return json(502,{error:"Gagal memeriksa username."});
   if(!accounts.length)return json(401,{error:"Username atau password tidak sesuai."});
   account=accounts[0];
   const authUser=await fetch(SUPABASE_URL+"/auth/v1/admin/users/"+encodeURIComponent(account.user_id),{headers:adminHeaders});
   const authData=await authUser.json();
   if(!authUser.ok||!authData.email)return json(401,{error:"Username atau password tidak sesuai."});
   email=authData.email;
  }
  const auth=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_ANON_KEY},body:JSON.stringify({email,password})});
  const session=await auth.json();
  if(!auth.ok||!session.access_token||!session.refresh_token)return json(401,{error:"Username/email atau password tidak sesuai."});
  const membership=await fetch(SUPABASE_URL+"/rest/v1/branch_users?select=role,branch_id,is_active&user_id=eq."+encodeURIComponent(session.user.id)+"&is_active=eq.true",{headers:{apikey:SUPABASE_ANON_KEY,Authorization:"Bearer "+session.access_token}});
  const rows=await membership.json();
  if(!membership.ok||!Array.isArray(rows))return json(502,{error:"Gagal memeriksa hak akses akun."});
  const member=rows.find(row=>row.role==="owner"||row.role==="branch_manager");
  if(!member)return json(403,{error:"Akun belum memiliki akses Manager aktif."});
  if(!account){
   const lookup=await fetch(SUPABASE_URL+"/rest/v1/manager_accounts?select=username,must_change_password&user_id=eq."+encodeURIComponent(session.user.id),{headers:adminHeaders});
   const rows=await lookup.json();if(lookup.ok&&rows[0])account=rows[0];
  }
  return json(200,{ok:true,must_change_password:!!account?.must_change_password,username:account?.username||null},{ "Set-Cookie":sessionCookie(session) });
 }catch(e){return json(502,{error:"Layanan login sementara tidak dapat dihubungi."})}
};