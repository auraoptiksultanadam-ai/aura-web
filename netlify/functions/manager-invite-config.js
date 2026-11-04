const {SUPABASE_URL,json}=require("./lib/manager-auth");
const SUPABASE_ANON_KEY=process.env.SUPABASE_ANON_KEY;
exports.handler=async()=>json(200,{supabase_url:SUPABASE_URL,publishable_key:SUPABASE_ANON_KEY},{"Access-Control-Allow-Origin":"*"});