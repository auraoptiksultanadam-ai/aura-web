const {SUPABASE_URL,context,response,assertSameOrigin}=require("./lib/manager-auth");
const SUPABASE_ANON_KEY=process.env.SUPABASE_ANON_KEY;
const NETLIFY_API="https://api.netlify.com/api/v1";
const REPO="auraoptiksultanadam-ai/aura-web";
const DEPLOY_BRANCH="aura-manager-dev";
const base=()=>SUPABASE_URL+"/rest/v1/";
const fail=(message,statusCode=400)=>Object.assign(new Error(message),{statusCode});
const netlifyHeaders=()=>({Authorization:"Bearer "+process.env.NETLIFY_AUTH_TOKEN,"Content-Type":"application/json"});
async function netlify(path,options={}){
 const r=await fetch(NETLIFY_API+path,{...options,headers:{...netlifyHeaders(),...(options.headers||{})}});
 const raw=await r.text();let data={};try{data=raw?JSON.parse(raw):{}}catch{}
 if(!r.ok){const detail=data.message||data.error_description||data.error||data.errors||raw.slice(0,300);throw fail("Netlify API gagal ("+r.status+"): "+(typeof detail==="string"?detail:JSON.stringify(detail)),r.status===401?503:r.status===422?422:400);}
 return data;
}
function cleanName(value){
 const name=String(value||"").toLowerCase().trim().replace(/\.netlify\.app$/,"");
 if(!/^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(name))throw fail("Gunakan nama URL 2–63 karakter: huruf kecil, angka, dan tanda hubung. Jangan sertakan https:// atau .netlify.app.");
 return name;
}
async function checkName(name,ctx){
 const anchor=await netlify("/sites/aura-optikal.netlify.app");
 const accountSlug=anchor.account_slug;
 const [remote,teamSites,local]=await Promise.all([
  netlify("/sites?name="+encodeURIComponent(name)),
  accountSlug?netlify("/"+encodeURIComponent(accountSlug)+"/sites?name="+encodeURIComponent(name)):Promise.resolve([]),
  fetch(base()+"branches?select=id,slug,brand_name&slug=eq."+encodeURIComponent(name),{headers:ctx.headers}).then(r=>r.json())
 ]);
 const candidates=[...(Array.isArray(remote)?remote:[]),...(Array.isArray(teamSites)?teamSites:[])];
 const taken=candidates.some(s=>String(s.name||"").toLowerCase()===name||String(s.custom_domain||"").toLowerCase()===name+".netlify.app"||String(s.ssl_url||"").toLowerCase().includes(name+".netlify.app"));
 return {available:!taken&&!local.length,hostname:name+".netlify.app",reason:taken?"Subdomain sudah terdaftar sebagai Site di Netlify. Gunakan nama lain atau periksa Site lama yang memakai nama ini.":local.length?"Nama sudah terdaftar sebagai cabang Aura.":"",note:"Netlify memeriksa keunikan subdomain secara global saat Site dibuat."};
}
async function createNetlifySite(requestedName,ctx,accountSlug){
 const baseName=requestedName;
 
 for(let attempt=0;attempt<21;attempt++){
  const candidate=attempt===0?baseName:baseName+"-aura"+(attempt===1?"":String(attempt));
  if(candidate.length>63)continue;
  const availability=await checkName(candidate,ctx);
  if(!availability.available)continue;
  try{
   const site=await netlify("/"+encodeURIComponent(accountSlug)+"/sites",{method:"POST",body:JSON.stringify({name:candidate})});
   return {site,name:candidate,autoAdjusted:attempt>0,requestedName:baseName};
  }catch(error){
   if(error.statusCode===422&&/subdomain|must be unique/i.test(error.message)){continue;}
   throw error;
  }
 }
 throw fail("Subdomain "+baseName+".netlify.app tidak tersedia. Sistem juga sudah mencoba 20 nama alternatif dengan akhiran -aura, tetapi semuanya tidak dapat digunakan. Masukkan nama URL lain lalu coba lagi.",422);
}
async function createBranchManager(username,password,branchId,brandName){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!key)throw fail("Secret SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi.",503);
 const internalEmail=username+"@manager.aura.internal";
 const r=await fetch(SUPABASE_URL+"/auth/v1/admin/users",{method:"POST",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({email:internalEmail,password,email_confirm:true,user_metadata:{username,brand_name:brandName}})});
 const data=await r.json().catch(()=>({}));
 if(!r.ok||!data.id){
  const detail=data.msg||data.message||data.error_description||data.error||"";
  throw fail("Akun pengelola gagal dibuat: "+(detail||"periksa konfigurasi Supabase Auth."),r.status===422?422:400);
 }
 const uid=data.id;
 try{
  const membership=await fetch(base()+"branch_users",{method:"POST",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({user_id:uid,branch_id:branchId,role:"branch_manager",is_active:true})});
  if(!membership.ok)throw fail("Akun dibuat tetapi hak akses cabang gagal disimpan: "+(await membership.text()).slice(0,180),500);
  const account=await fetch(base()+"manager_accounts",{method:"POST",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({user_id:uid,username,must_change_password:true})});
  if(!account.ok)throw fail("Akun dibuat tetapi username gagal disimpan: "+(await account.text()).slice(0,180),500);
  return {id:uid,username};
 }catch(error){
  await fetch(SUPABASE_URL+"/auth/v1/admin/users/"+encodeURIComponent(uid),{method:"DELETE",headers:{apikey:key,Authorization:"Bearer "+key}}).catch(()=>{});
  throw error;
 }
}
async function saveBranchAndDomain(ctx,name,brandName,site){
 let branchId=null;
 try{
  const branchRes=await fetch(base()+"branches",{method:"POST",headers:{...ctx.headers,Prefer:"return=representation"},body:JSON.stringify({slug:name,brand_name:brandName,primary_color:"#001734",is_active:true})});
  const branchRows=await branchRes.json();
  if(!branchRes.ok||!branchRows[0]?.id)throw fail(branchRows.message||"Gagal menyimpan data cabang.");
  const branch=branchRows[0];branchId=branch.id;
  const domainRes=await fetch(base()+"branch_domains",{method:"POST",headers:{...ctx.headers,Prefer:"return=representation"},body:JSON.stringify({branch_id:branchId,hostname:name+".netlify.app",is_primary:true,is_active:true})});
  if(!domainRes.ok)throw fail("Gagal menyimpan domain cabang.");
  const settingsRes=await fetch(base()+"branch_settings",{method:"POST",headers:{...ctx.headers,Prefer:"return=minimal"},body:JSON.stringify({branch_id:branchId,hero_badge_text:"Selamat datang di "+brandName,hero_description:"Informasi toko sedang disiapkan oleh pengelola cabang.",meta_title:brandName+" | Website Resmi"})});
  if(!settingsRes.ok)throw fail("Gagal menyiapkan profil awal cabang.");
  const hours=Array.from({length:7},(_,day_of_week)=>({branch_id:branchId,day_of_week,open_time:"08:00",close_time:"22:00",is_closed:true,notes:"Atur jam operasional cabang"}));
  const hoursRes=await fetch(base()+"operating_hours",{method:"POST",headers:{...ctx.headers,Prefer:"return=minimal"},body:JSON.stringify(hours)});
  if(!hoursRes.ok)throw fail("Gagal menyiapkan jam operasional awal cabang.");
  return branch;
 }catch(error){
  if(branchId){
   for(const table of ["operating_hours","branch_settings","branch_domains","branches"]){
    try{const key=table==="branches"?"id":"branch_id";await fetch(base()+table+"?"+key+"=eq."+encodeURIComponent(branchId),{method:"DELETE",headers:ctx.headers});}catch{}
   }
  }
  throw error;
 }
}
exports.handler=async event=>{
 let ctx;
 try{
  ctx=await context(event);
  if(ctx.member.role!=="owner")throw fail("Hanya Owner yang dapat mengelola cabang.",403);
  if(event.httpMethod==="GET"){
   if(event.queryStringParameters?.action==="check"){
    if(!process.env.NETLIFY_AUTH_TOKEN)throw fail("Token Netlify belum tersedia pada deploy branch ini. Periksa environment variable NETLIFY_AUTH_TOKEN.",503);
    const name=cleanName(event.queryStringParameters.name);
    return response(200,await checkName(name,ctx),ctx);
   }
   const [br,dr,ur]=await Promise.all([
    fetch(base()+"branches?select=id,slug,brand_name,logo_url,primary_color,city,address,phone,whatsapp,is_active,created_at,updated_at&order=brand_name.asc",{headers:ctx.headers}),
    fetch(base()+"branch_domains?select=id,branch_id,hostname,is_primary,is_active,created_at&order=hostname.asc",{headers:ctx.headers}),
    fetch(base()+"branch_users?select=id,user_id,branch_id,role,is_active,created_at&order=created_at.desc",{headers:ctx.headers})
   ]);
   const [branches,domains,users]=await Promise.all([br.json(),dr.json(),ur.json()]);
   if(!br.ok||!dr.ok||!ur.ok)throw fail("Gagal memuat data cabang.",502);
   let accounts=[];const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;if(serviceKey){const ar=await fetch(base()+"manager_accounts?select=user_id,username,must_change_password",{headers:{apikey:serviceKey,Authorization:"Bearer "+serviceKey}});if(ar.ok)accounts=await ar.json();}
   const accountMap=new Map(accounts.map(a=>[a.user_id,a]));const enrichedUsers=users.map(u=>({...u,username:accountMap.get(u.user_id)?.username||null,must_change_password:accountMap.get(u.user_id)?.must_change_password??false}));
   return response(200,{branches,domains,users:enrichedUsers},ctx);
  }
  if(!["POST","PATCH","DELETE"].includes(event.httpMethod))return response(405,{error:"Metode tidak diizinkan."},ctx);
  assertSameOrigin(event);
  const type=event.queryStringParameters?.type,id=event.queryStringParameters?.id;
  const tables={branches:["slug","brand_name","logo_url","primary_color","city","address","phone","whatsapp","is_active"],domains:["branch_id","hostname","is_primary","is_active"],users:["user_id","branch_id","role","is_active"]};
  if(!tables[type])throw fail("Jenis data tidak valid.");
  const table=type==="branches"?"branches":type==="domains"?"branch_domains":"branch_users";
  if(event.httpMethod==="DELETE"){
   if(!id)throw fail("ID data tidak ditemukan.");
   if(type==="branches"){const count=await fetch(base()+"branches?select=id&id=eq."+encodeURIComponent(id),{headers:ctx.headers});const rows=await count.json();if(rows.length===1&&rows[0].id===id)throw fail("Cabang tidak dihapus permanen dari panel ini. Nonaktifkan cabang untuk menjaga histori.");}
   const r=await fetch(base()+table+"?id=eq."+encodeURIComponent(id),{method:"DELETE",headers:{...ctx.headers,Prefer:"return=minimal"}});
   if(!r.ok)throw fail("Gagal menghapus data.");
   return response(200,{ok:true,message:"Data berhasil dihapus."},ctx);
  }
  let body;try{body=JSON.parse(event.body||"{}")}catch{throw fail("Format data tidak valid.");}
  if(type==="branches"&&event.httpMethod==="POST"){
   if(!process.env.NETLIFY_AUTH_TOKEN)throw fail("Token Netlify belum tersedia pada deploy branch ini. Periksa environment variable NETLIFY_AUTH_TOKEN.",503);
   const brandName=String(body.brand_name||"").trim();
   const managerUsername=String(body.manager_username||"").trim().toLowerCase();
   const managerPassword=String(body.manager_password||"");
   let name=cleanName(body.netlify_name||body.slug);
   if(!brandName)throw fail("Nama cabang wajib diisi.");
   if(brandName.length>120)throw fail("Nama cabang maksimal 120 karakter.");
   if(!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(managerUsername))throw fail("Username pengelola harus 3–32 karakter dan hanya memakai huruf kecil, angka, titik, garis bawah, atau tanda hubung.");
   if(managerPassword.length<10||managerPassword.length>72)throw fail("Password awal pengelola harus 10–72 karakter.");
   if(!process.env.SUPABASE_SERVICE_ROLE_KEY)throw fail("Secret SUPABASE_SERVICE_ROLE_KEY belum dipasang pada Netlify branch deploy.",503);
   const anchorSite=await netlify("/sites/aura-optikal.netlify.app");
   const accountSlug=anchorSite.account_slug;
   const accountId=anchorSite.account_id||accountSlug;
   if(!accountSlug||!accountId)throw fail("Tidak dapat membaca workspace Netlify dari Site Aura Optikal.",503);
   const provisioned=await createNetlifySite(name,ctx,accountSlug);
   const site=provisioned.site;
   name=provisioned.name;
   let createdBranchId=null;
   let createdManagerUserId=null;
   try{
    const envUrl="/accounts/"+encodeURIComponent(accountId)+"/env?site_id="+encodeURIComponent(site.id);
    // Netlify Free does not support per-variable scopes. Set only public config through API;
    // secret keys must be added manually in the Site UI with Functions scope.
    const envs=[
     {key:"SUPABASE_URL",values:[{value:SUPABASE_URL,context:"all"}]},
     {key:"SUPABASE_ANON_KEY",values:[{value:SUPABASE_ANON_KEY,context:"all"}]}
    ];
    const envRes=await fetch(NETLIFY_API+envUrl,{method:"POST",headers:netlifyHeaders(),body:JSON.stringify(envs)});
    if(!envRes.ok){const msg=await envRes.text();throw fail("Site Netlify dibuat, tetapi konfigurasi dasar Supabase gagal: "+msg.slice(0,220));}
    const branch=await saveBranchAndDomain(ctx,name,brandName,site);
    createdBranchId=branch.id;
    const repo={provider:"github",repo:REPO,repo_path:REPO,repo_url:"https://github.com/"+REPO,repo_branch:DEPLOY_BRANCH,dir:".",functions_dir:"netlify/functions",public_repo:true,cmd:""};
    const installationId=anchorSite.build_settings?.installation_id||anchorSite.repo?.installation_id;
    if(installationId)repo.installation_id=installationId;
    await netlify("/sites/"+encodeURIComponent(site.id),{method:"PUT",body:JSON.stringify({repo})});
    await netlify("/sites/"+encodeURIComponent(site.id)+"/metadata",{method:"PUT",body:JSON.stringify({aura_branch_id:branch.id,aura_branch_slug:name,managed_by:"AURA WEBSITE MANAGER"})});
    const manager=await createBranchManager(managerUsername,managerPassword,branch.id,brandName);
    createdManagerUserId=manager.id;
    return response(201,{ok:true,item:branch,site:{id:site.id,name:site.name,hostname:name+".netlify.app",url:site.ssl_url||site.url,admin_url:site.admin_url},manager:{username:manager.username},message:(provisioned.autoAdjusted?"Nama URL yang diminta sudah digunakan, jadi sistem memilih URL alternatif yang tersedia. ":"")+"Cabang dan akun pengelola berhasil dibuat. Sebelum login Manager berfungsi, tambahkan secret SUPABASE_SERVICE_ROLE_KEY dan NETLIFY_AUTH_TOKEN pada Site baru di Netlify dengan scope Functions. Pengelola wajib mengganti password saat login pertama.",requested_hostname:provisioned.requestedName+".netlify.app",auto_adjusted:provisioned.autoAdjusted},ctx);
   }catch(error){
    if(createdManagerUserId&&process.env.SUPABASE_SERVICE_ROLE_KEY){try{const key=process.env.SUPABASE_SERVICE_ROLE_KEY;await fetch(SUPABASE_URL+"/auth/v1/admin/users/"+encodeURIComponent(createdManagerUserId),{method:"DELETE",headers:{apikey:key,Authorization:"Bearer "+key}});}catch{}}
    if(createdBranchId){
     for(const table of ["operating_hours","branch_settings","branch_domains","branches"]){
      try{const key=table==="branches"?"id":"branch_id";await fetch(base()+table+"?"+key+"=eq."+encodeURIComponent(createdBranchId),{method:"DELETE",headers:ctx.headers});}catch{}
     }
    }
    try{await netlify("/sites/"+encodeURIComponent(site.id),{method:"DELETE"});}catch{}
    throw error;
   }
  }
  const data={};for(const k of tables[type])if(Object.hasOwn(body,k))data[k]=body[k];
  if(type==="branches"){if(!data.slug||!data.brand_name)throw fail("Slug dan nama cabang wajib diisi.");data.slug=String(data.slug).toLowerCase().trim().replace(/[^a-z0-9-]/g,"-");data.brand_name=String(data.brand_name).trim();data.updated_at=new Date().toISOString();}
  if(type==="domains"){if(!data.branch_id||!data.hostname)throw fail("Cabang dan hostname wajib diisi.");data.hostname=String(data.hostname).toLowerCase().trim().replace(/^https?:\/\//,"").replace(/\/$/,"");}
  if(type==="users"){if(!data.user_id||!data.role||!["owner","branch_manager"].includes(data.role))throw fail("User ID dan role yang valid wajib diisi.");if(data.role==="branch_manager"&&!data.branch_id)throw fail("Pengelola harus ditautkan ke cabang.");}
  const url=event.httpMethod==="PATCH"?(id?base()+table+"?id=eq."+encodeURIComponent(id):null):base()+table;
  if(!url)throw fail("ID data tidak ditemukan.");
  const r=await fetch(url,{method:event.httpMethod,headers:{...ctx.headers,Prefer:"return=representation"},body:JSON.stringify(data)});
  const result=await r.json();if(!r.ok)throw fail(result.message||"Gagal menyimpan data.");
  return response(200,{ok:true,item:result[0],message:"Data cabang berhasil disimpan."},ctx);
 }catch(e){return response(e.statusCode||500,{error:e.message||"Terjadi kesalahan."},e.clearCookie?{clearCookie:true}:ctx);}
};