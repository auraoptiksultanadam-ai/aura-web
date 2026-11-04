const SUPABASE_URL=process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY=process.env.SUPABASE_ANON_KEY;
const json=(statusCode,body)=>({statusCode,headers:{"Content-Type":"application/json","Cache-Control":"no-store"},body:JSON.stringify(body)});
exports.handler=async(event)=>{
  const raw=event.headers.cookie||event.headers.Cookie||"";
  const value=raw.split(";").map(v=>v.trim()).find(v=>v.startsWith("aura_manager_session="))?.slice("aura_manager_session=".length);
  if(!value||!SUPABASE_URL||!SUPABASE_ANON_KEY)return json(401,{error:"Sesi tidak ditemukan."});
  const token=decodeURIComponent(value);
  try{
    const userRes=await fetch(SUPABASE_URL+"/auth/v1/user",{headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+token}});
    if(!userRes.ok)return json(401,{error:"Sesi tidak valid atau sudah berakhir."});
    const user=await userRes.json();
    const mRes=await fetch(SUPABASE_URL+"/rest/v1/branch_users?select=role,branch_id,is_active&user_id=eq."+encodeURIComponent(user.id)+"&is_active=eq.true",{headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+token}});
    const rows=await mRes.json();
    if(!mRes.ok||!Array.isArray(rows))return json(502,{error:"Gagal memeriksa hak akses."});
    const member=rows.find(row=>row.role==="owner"||row.role==="branch_manager");
    if(!member)return json(403,{error:"Akun tidak memiliki akses aktif."});
    let branch_name=null;
    if(member.branch_id){const b=await fetch(SUPABASE_URL+"/rest/v1/branches?select=brand_name&id=eq."+encodeURIComponent(member.branch_id),{headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+token}});const data=await b.json();branch_name=Array.isArray(data)?data[0]?.brand_name||null:null;}
    return json(200,{role:member.role,branch_id:member.branch_id,branch_name});
  }catch{return json(502,{error:"Gagal memeriksa sesi."})}
};