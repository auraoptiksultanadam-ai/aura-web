// AURA WEB CONTROL CENTER — local-only Node.js server
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=__dirname,HOST='127.0.0.1',PORT=Number(process.env.PORT||3000);
const BASE=path.join(ROOT,'content','site.json'),DRAFT=path.join(ROOT,'content','local-draft.json');
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
function send(res,status,data,type='application/json; charset=utf-8'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(type.startsWith('application/json')?JSON.stringify(data):data)}
function body(req){return new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>1048576){reject(Error('Data melebihi 1 MB'));req.destroy()}});req.on('end',()=>{try{resolve(JSON.parse(s||'{}'))}catch{reject(Error('JSON tidak valid'))}});req.on('error',reject)})}
function write(file,value){const tmp=file+'.'+crypto.randomBytes(5).toString('hex')+'.tmp';fs.writeFileSync(tmp,JSON.stringify(value,null,2)+'\n');fs.renameSync(tmp,file)}
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://'+HOST+':'+PORT);
 if(url.pathname.startsWith('/__local/api/')){try{
  if(req.method==='GET'&&url.pathname==='/__local/api/content')return send(res,200,{content:read(fs.existsSync(DRAFT)?DRAFT:BASE),hasDraft:fs.existsSync(DRAFT)});
  if(req.method==='POST'&&url.pathname==='/__local/api/content'){const b=await body(req);if(!b.content||typeof b.content!=='object'||Array.isArray(b.content))return send(res,400,{error:'Konten tidak valid'});write(DRAFT,b.content);return send(res,200,{ok:true,message:'Draft lokal berhasil disimpan.'})}
  if(req.method==='POST'&&url.pathname==='/__local/api/reset'){if(fs.existsSync(DRAFT))fs.unlinkSync(DRAFT);return send(res,200,{ok:true,content:read(BASE),message:'Draft dihapus. Kembali ke konten awal.'})}
  if(req.method==='GET'&&url.pathname==='/__local/api/status')return send(res,200,{ok:true,hasDraft:fs.existsSync(DRAFT)});
  return send(res,404,{error:'Endpoint tidak ditemukan'});
 }catch(e){return send(res,400,{error:e.message||'Terjadi kesalahan'})}}
 let pathname=decodeURIComponent(url.pathname);if(pathname==='/')pathname='/index.html';
 const target=path.resolve(ROOT,'.'+pathname);if(!target.startsWith(ROOT+path.sep))return send(res,403,'Forbidden','text/plain; charset=utf-8');
 fs.stat(target,(err,st)=>{if(err||!st.isFile())return send(res,404,'File tidak ditemukan','text/plain; charset=utf-8');res.writeHead(200,{'Content-Type':MIME[path.extname(target).toLowerCase()]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});fs.createReadStream(target).pipe(res)});
});
server.listen(PORT,HOST,()=>{process.stdout.write('\nAURA WEB CONTROL CENTER siap.\nWebsite: http://'+HOST+':'+PORT+'/\nDashboard: http://'+HOST+':'+PORT+'/admin/\nHanya komputer ini yang dapat mengakses. Tekan Ctrl+C untuk berhenti.\n\n')});
