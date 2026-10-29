const FALLBACK_ORIGIN='https://larpdungeon.onrender.com';
export function publicOrigin(env=process.env){
 for(const candidate of [env.PUBLIC_SITE_URL,env.RENDER_EXTERNAL_URL,FALLBACK_ORIGIN]){
  try{const url=new URL(candidate);if(url.protocol==='https:'&&!url.username&&!url.password)return url.origin}catch{}
 }
 return FALLBACK_ORIGIN;
}
export function renderSeo(html,origin=publicOrigin()){return html.replaceAll('__SITE_ORIGIN__',origin)}
export function robotsText(origin=publicOrigin()){return `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /health\nSitemap: ${origin}/sitemap.xml\n`}
export function sitemapXml(origin=publicOrigin()){return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`}

export function legacyRedirect(host,pathname,search='',env=process.env){
 if(String(host).toLowerCase().split(':')[0]!=='dungeon-multiplayer.onrender.com'||!['/','/index.html','/robots.txt','/sitemap.xml'].includes(pathname))return null;
 const origin=publicOrigin({...env,RENDER_EXTERNAL_URL:undefined});
 if(origin==='https://dungeon-multiplayer.onrender.com')return null;
 return origin+(pathname==='/index.html'?'/':pathname)+search;
}
