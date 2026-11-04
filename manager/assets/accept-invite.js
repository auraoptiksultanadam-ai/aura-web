const form=document.querySelector("#invite-form"),message=document.querySelector("#message"),button=document.querySelector("#submit");
form.addEventListener("submit",async e=>{
 e.preventDefault();message.textContent="";
 const password=document.querySelector("#password").value,confirm=document.querySelector("#confirm").value;
 if(password.length<8){message.textContent="Password minimal 8 karakter.";return;}
 if(password!==confirm){message.textContent="Konfirmasi password belum sama.";return;}
 const hash=new URLSearchParams(location.hash.slice(1)),token=hash.get("access_token"),type=hash.get("type");
 if(!token||!["invite","recovery","magiclink","signup"].includes(type)){message.textContent="Link undangan tidak valid atau sudah kedaluwarsa. Minta Owner mengirim undangan baru.";return;}
 button.disabled=true;button.textContent="Mengaktifkan akun…";
 try{
  const cfg=await fetch("/.netlify/functions/manager-invite-config").then(r=>r.json());
  const r=await fetch(cfg.supabase_url+"/auth/v1/user",{method:"PUT",headers:{apikey:cfg.publishable_key,Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({password})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.msg||d.message||"Gagal mengaktifkan akun.");
  message.textContent="Akun aktif. Mengarahkan ke halaman login…";history.replaceState(null,"",location.pathname);setTimeout(()=>location.assign("./"),1000);
 }catch(err){message.textContent=err.message;}
 finally{button.disabled=false;button.textContent="Aktifkan Akun";}
});