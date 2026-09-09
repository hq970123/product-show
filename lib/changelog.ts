import {clean,read} from './web-content';
import {publicUrl} from './product';
import type {Release} from './catalog';
const keyword=/changelog|release[\s_/-]*notes|what.?s[\s_-]*new|更新日志|版本更新|发行说明|更新记录/i;
export function parseReleases(html:string,sourceUrl:string):Release[]{
const body=html.replace(/<(script|style|nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
const headings=[...body.matchAll(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(m=>({text:clean(m[2]),level:Number(m[1]),index:m.index!,end:m.index!+m[0].length}));
const version=/(?:\bv?\d+\.\d+(?:\.\d+)*(?:[-\w.]*)\b)|(?:\bversion\s+\d+\b)|(?:版本\s*\d+)|(?:\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2})|(?:\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4})/i;
const results:Release[]=[];
for(let i=0;i<headings.length;i++){const h=headings[i];if(!version.test(h.text)||h.text.length>160)continue;let end=body.length;for(let j=i+1;j<headings.length;j++){if(headings[j].level<=h.level){end=headings[j].index;break}}const segment=body.slice(h.end,end);const content=segment.replace(/<(?:br|\/p|\/li|\/h[1-6]|\/div)\s*\/?>/gi,'\n').split('\n').map(clean).filter(Boolean).join('\n').slice(0,4000);if(!content)continue;const date=segment.match(/<time\b[^>]*datetime=["']([^"']+)["']/i)?.[1]?.slice(0,10)||h.text.match(/\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2}/)?.[0]||'';results.push({version:h.text,date,content,sourceUrl,manual:false});if(results.length===30)break}
return results;
}
export function findChangelogLinks(html:string,base:string){const urls:string[]=[];for(const m of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){if(!keyword.test(clean(m[2])+' '+m[1]))continue;try{const u=publicUrl(new URL(m[1].replace(/&amp;/g,'&'),base).href);if(u.href!==publicUrl(base).href&&!urls.includes(u.href))urls.push(u.href)}catch{}}return urls.slice(0,2)}
export async function collectChangelog(url:string,provided?:string,homepage?:string){let candidates:string[];if(provided)candidates=[publicUrl(provided).href];else{const html=homepage??await read(url);candidates=findChangelogLinks(html,url)}if(!candidates.length)return {releases:[],changelogUrl:'',message:'官网未找到更新日志入口，可粘贴日志页面链接或手动添加版本。'};const attempts=await Promise.allSettled(candidates.map(async link=>({link,releases:parseReleases(await read(link),link)})));for(const attempt of attempts){if(attempt.status==='fulfilled'&&attempt.value.releases.length)return {releases:attempt.value.releases,changelogUrl:attempt.value.link,message:'已提取公开页面中可识别的版本（最多 30 条），保存前请核对。'}}return {releases:[],changelogUrl:candidates[0],message:'已找到日志链接，但未识别到版本正文；可能需要登录、动态加载或逐篇查看，请手动补充。'};
}
