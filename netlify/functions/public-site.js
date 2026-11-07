const URL=process.env.SUPABASE_URL,KEY=process.env.SUPABASE_ANON_KEY;
const json=(statusCode,body)=>({statusCode,headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=60, s-maxage=120","Access-Control-Allow-Origin":"*"},body:JSON.stringify(body)});
exports.handler=async event=>{try{if(!URL||!KEY)return json(500,{error:"Public API belum dikonfigurasi."});
const host=(event.headers.host||event.headers.Host||"").split(":")[0].toLowerCase();
const h={apikey:KEY,Authorization:"Bearer "+KEY};
let id=event.queryStringParameters?.branch_id||null;
if(!id){const dr=await fetch(URL+"/rest/v1/branch_domains?select=branch_id&hostname=eq."+encodeURIComponent(host)+"&is_active=eq.true",{headers:h});let domains=await dr.json();if(!dr.ok)return json(502,{error:"Gagal membaca pemetaan domain."});if(!domains.length&&host.endsWith("--aura-optikal.netlify.app")){const fallback=await fetch(URL+"/rest/v1/branch_domains?select=branch_id&hostname=eq.aura-optikal.netlify.app&is_active=eq.true",{headers:h});domains=await fallback.json();}if(!domains.length)return json(404,{error:"Domain cabang tidak terdaftar."});id=domains[0].branch_id;}
const [br,sr,hr,cr,pr,gr,por]=await Promise.all([
fetch(URL+"/rest/v1/branches?select=id,slug,brand_name,logo_url,primary_color,city,address,phone,whatsapp&id=eq."+encodeURIComponent(id)+"&is_active=eq.true",{headers:h}),
fetch(URL+"/rest/v1/branch_settings?select=hero_badge_text,hero_description,instagram_url,tiktok_url,gmaps_url,softlens_catalog_url,rewards_url,meta_title,meta_description&branch_id=eq."+encodeURIComponent(id),{headers:h}),
fetch(URL+"/rest/v1/operating_hours?select=day_of_week,open_time,close_time,is_closed,notes&branch_id=eq."+encodeURIComponent(id)+"&order=day_of_week.asc",{headers:h}),
fetch(URL+"/rest/v1/product_categories?select=id,name,product_type,sort_order&branch_id=eq."+encodeURIComponent(id)+"&is_active=eq.true&order=sort_order.asc",{headers:h}),
fetch(URL+"/rest/v1/products?select=id,category_id,product_type,name,brand,badge,description,image_url,wa_text,sort_order&branch_id=eq."+encodeURIComponent(id)+"&is_active=eq.true&order=sort_order.asc",{headers:h}),
fetch(URL+"/rest/v1/store_galleries?select=id,title,description,image_url,category,sort_order&branch_id=eq."+encodeURIComponent(id)+"&is_visible=eq.true&order=sort_order.asc",{headers:h}),
fetch(URL+"/rest/v1/promotions?select=id,category,title,description,image_url,cta_label,cta_link,status,starts_at,ends_at,sort_order&branch_id=eq."+encodeURIComponent(id)+"&status=eq.published&order=sort_order.asc",{headers:h})
]);
const results=await Promise.all([br,sr,hr,cr,pr,gr,por].map(x=>x.json()));
if([br,sr,hr,cr,pr,gr,por].some(x=>!x.ok))return json(502,{error:"Gagal memuat konten website."});
const [b,s,hours,categories,products,gallery,promotions]=results;
if(!b.length)return json(404,{error:"Cabang tidak aktif."});
return json(200,{branch:b[0],settings:s[0]||{},hours,categories,products,gallery,promotions});
}catch(e){return json(502,{error:"Konten website sementara tidak tersedia."})}};