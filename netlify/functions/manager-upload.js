const {SUPABASE_URL,context,response,assertSameOrigin,resolveBranch}=require("./lib/manager-auth");
exports.handler=async event=>{let ctx;try{ctx=await context(event);if(event.httpMethod!=="POST")return response(405,{error:"Metode tidak diizinkan."},ctx);assertSameOrigin(event);
const branchId=await resolveBranch(ctx,event.queryStringParameters?.branch_id);
let body;try{body=JSON.parse(event.body||"{}")}catch{throw Object.assign(new Error("Format unggahan tidak valid."),{statusCode:400})}
const mime=String(body.mime_type||"").toLowerCase(),name=String(body.filename||"image").replace(/[^a-zA-Z0-9._-]/g,"_");
if(!["image/jpeg","image/png","image/webp"].includes(mime))throw Object.assign(new Error("Format gambar harus JPG, PNG, atau WebP."),{statusCode:400});
const raw=String(body.base64||"").replace(/^data:[^,]+,/, "");
if(!raw||raw.length>Math.ceil(4*1024*1024*4/3))throw Object.assign(new Error("Ukuran gambar maksimal 4 MB."),{statusCode:413});
const bytes=Buffer.from(raw,"base64");if(bytes.length>4*1024*1024)throw Object.assign(new Error("Ukuran gambar maksimal 4 MB."),{statusCode:413});
const ext=mime==="image/jpeg"?"jpg":mime==="image/png"?"png":"webp",safeName=Date.now()+"-"+name.replace(/\.[^.]+$/,"")+"."+ext;
const path=branchId+"/"+safeName;
const upload=await fetch(SUPABASE_URL+"/storage/v1/object/branch-media/"+path.split("/").map(encodeURIComponent).join("/"),{method:"POST",headers:{apikey:process.env.SUPABASE_ANON_KEY,Authorization:"Bearer "+ctx.session.access_token,"Content-Type":mime,"x-upsert":"false"},body:bytes});
const result=await upload.json();if(!upload.ok)throw Object.assign(new Error(result.message||"Gagal mengunggah gambar. Periksa hak akses Storage."),{statusCode:400});
return response(200,{ok:true,path,public_url:SUPABASE_URL+"/storage/v1/object/public/branch-media/"+path.split("/").map(encodeURIComponent).join("/")},ctx);
}catch(e){return response(e.statusCode||500,{error:e.message||"Unggahan gagal."},e.clearCookie?{clearCookie:true}:ctx)}};