const form=document.querySelector("#login-form"),button=document.querySelector("#submit"),message=document.querySelector("#message");
async function readResponse(response){
 const raw=await response.text();
 let data={};
 try{data=raw?JSON.parse(raw):{};}catch{}
 if(!response.ok)throw new Error(data.error||data.message||("Login gagal (HTTP "+response.status+"). Coba muat ulang halaman."));
 if(!data||typeof data!=="object")throw new Error("Respons login tidak dikenali. Muat ulang halaman lalu coba lagi.");
 return data;
}
form?.addEventListener("submit",async event=>{
 event.preventDefault();
 message.textContent="";
 button.disabled=true;
 button.textContent="Memeriksa akun…";
 const data=new FormData(form);
 try{
  const response=await fetch("/.netlify/functions/manager-login",{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"Accept":"application/json","Content-Type":"application/json"},body:JSON.stringify({username:data.get("username"),password:data.get("password")})});
  const result=await readResponse(response);
  if(!result.ok)throw new Error("Server belum mengonfirmasi login. Silakan coba lagi.");
  window.location.replace(result.must_change_password?"./change-password.html":"./dashboard.html");
 }catch(error){
  message.textContent=error.message||"Terjadi kesalahan. Silakan coba lagi.";
  button.disabled=false;
  button.textContent="Masuk ke Manager";
 }
});