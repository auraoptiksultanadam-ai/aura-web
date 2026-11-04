const form=document.querySelector("#login-form");
const button=document.querySelector("#submit");
const message=document.querySelector("#message");
form?.addEventListener("submit",async(event)=>{
  event.preventDefault();message.textContent="";button.disabled=true;button.textContent="Memeriksa akun…";
  const data=new FormData(form);
  try{
    const response=await fetch("/.netlify/functions/manager-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:data.get("email"),password:data.get("password")})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||"Login belum berhasil.");
    window.location.assign("./dashboard.html");
  }catch(error){message.textContent=error.message||"Terjadi kesalahan. Silakan coba lagi."}
  finally{button.disabled=false;button.textContent="Masuk ke Manager"}
});