// AURA WEB CONTROL CENTER — local-only Node.js server
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=__dirname,HOST='127.0.0.1',PORT=Number(process.env.PORT||3000);
const BASE=path.join(ROOT,'content','site.json'),DRAFT=path.join(ROOT,'content','local-draft.json'),UPLOADS=path.join(ROOT,'assets','images','uploads');\nif(!fs.existsSync(UPLOADS))fs.mkdirSync(UPLOADS,{recursive:true});
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
function send(res,status,data,type='application/json; charset=utf-8'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(type.startsWith('application/json')?JSON.stringify(data):data)}
function body(req,limit=12*1024*1024){return new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>limit){reject(Error('Ukuran data terlalu besar'));req.destroy()}});req.on('end',()=>{try{resolve(JSON.parse(s||'{}'))}catch{reject(Error('JSON tidak valid'))}});req.on('error',reject)})}
function write(file,value){const tmp=file+'.'+crypto.randomBytes(5).toString('hex')+'.tmp';fs.writeFileSync(tmp,JSON.stringify(value,null,2)+'\n');fs.renameSync(tmp,file)}
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://'+HOST+':'+PORT);
 if(url.pathname.startsWith('/__local/api/')){try{
    if(req.method==='GET'&&url.pathname==='/__local/api/media'){const files=fs.readdirSync(UPLOADS).filter(n=>/^[a-f0-9-]+\.(jpg|png|webp)$/.test(n)).map(name=>({name,url:'/assets/images/uploads/'+name}));return send(res,200,{files})}
  if(req.method==='POST'&&url.pathname==='/__local/api/media'){const b=await body(req,12*1024*1024);const match=/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(b.data||'');if(!match)return send(res,400,{error:'Format gambar harus JPG, PNG, atau WEBP'});const bytes=Buffer.from(match[2],'base64');if(bytes.length>8*1024*1024)return send(res,400,{error:'Ukuran gambar maksimal 8 MB'});const ext=match[1]==='jpeg'?'jpg':match[1];const name=crypto.randomUUID()+'.'+ext;fs.writeFileSync(path.join(UPLOADS,name),bytes,{flag:'wx'});return send(res,201,{ok:true,file:{name,url:'/assets/images/uploads/'+name}})}
  if(req.method==='DELETE'&&url.pathname.startsWith('/__local/api/media/')){const name=path.basename(url.pathname.slice('/__local/api/media/'.length));if(!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(name))return send(res,400,{error:'Nama file tidak valid'});const file=path.join(UPLOADS,name);if(fs.existsSync(file))fs.unlinkSync(file);return send(res,200,{ok:true})}
  if(req.method==='GET'&&url.pathname==='/__local/api/content')return send(res,200,{content:read(fs.existsSync(DRAFT)?DRAFT:BASE),hasDraft:fs.existsSync(DRAFT)});
  if(req.method==='POST'&&url.pathname==='/__local/api/content'){const b=await body(req);if(!b.content||typeof b.content!=='object'||Array.isArray(b.content))return send(res,400,{error:'Konten tidak valid'});write(DRAFT,b.content);return send(res,200,{ok:true,message:'Draft lokal berhasil disimpan.'})}
  if(req.method==='POST'&&url.pathname==='/__local/api/reset'){if(fs.existsSync(DRAFT))fs.unlinkSync(DRAFT);return send(res,200,{ok:true,content:read(BASE),message:'Draft dihapus. Kembali ke konten awal.'})}
  if(req.method==='GET'&&url.pathname==='/__local/api/status')return send(res,200,{ok:true,hasDraft:fs.existsSync(DRAFT)});
  return send(res,404,{error:'Endpoint tidak ditemukan'});
 }catch(e){return send(res,400,{error:e.message||'Terjadi kesalahan'})}}
 let pathname=decodeURIComponent(url.pathname);if(pathname==='/')pathname='/index.html';
 let target=path.resolve(ROOT,'.'+pathname);if(!target.startsWith(ROOT+path.sep))return send(res,403,'Forbidden','text/plain; charset=utf-8');
 fs.stat(target,(err,st)=>{if(!err&&st.isDirectory()){target=path.join(target,'index.html');if(!target.startsWith(ROOT+path.sep))return send(res,403,'Forbidden','text/plain; charset=utf-8');return fs.stat(target,(e,file)=>serveFile(e,file,target,res));}serveFile(err,st,target,res)});
 function serveFile(err,st,file,res){if(err||!st||!st.isFile())return send(res,404,'File tidak ditemukan','text/plain; charset=utf-8');res.writeHead(200,{'Content-Type':MIME[path.extname(file).toLowerCase()]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});fs.createReadStream(file).pipe(res)}
});
server.listen(PORT,HOST,()=>{process.stdout.write('\nAURA WEB CONTROL CENTER siap.\nWebsite: http://'+HOST+':'+PORT+'/\nDashboard: http://'+HOST+':'+PORT+'/admin/\nHanya komputer ini yang dapat mengakses. Tekan Ctrl+C untuk berhenti.\n\n')});
