import {z} from 'zod';
import {publicUrl} from './product';
const url=z.string().max(3000).refine(v=>{try{publicUrl(v);return true}catch{return false}},'请输入有效的公开链接');
export const videoSchema=z.object({id:z.string().uuid(),name:z.string().max(200),size:z.number().int().nonnegative(),type:z.enum(['video/mp4','video/webm'])});
export const trafficSchema=z.object({month:z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),visits:z.number().finite().nonnegative().max(1e15),source:z.string().min(1).max(100),sourceUrl:url,updatedAt:z.string(),method:z.enum(['manual','api']),history:z.array(z.object({month:z.string(),visits:z.number().finite().nonnegative()})).max(12).optional()});
export const releaseSchema=z.object({version:z.string().trim().min(1).max(160),date:z.string().max(40).default(''),content:z.string().trim().min(1).max(4000),sourceUrl:url.or(z.literal('')).default(''),manual:z.boolean().default(false)});
export type Release=z.infer<typeof releaseSchema>;
export const productSchema=z.object({id:z.string().uuid().or(z.literal('')).optional(),url,name:z.string().trim().min(1).max(120),description:z.string().max(5000).default(''),features:z.array(z.string().trim().min(1).max(500)).max(12).default([]),audience:z.array(z.string().trim().min(1).max(200)).max(12).default([]),image:url.or(z.literal('')).default(''),tags:z.array(z.string().trim().min(1).max(30)).max(12).default([]),sources:z.array(z.object({title:z.string().max(200),url})).max(6).default([]),videos:z.array(videoSchema).max(5).default([]),traffic:trafficSchema.nullable().optional(),releases:z.array(releaseSchema).max(30).default([]),changelogUrl:url.or(z.literal('')).default(''),createdAt:z.string().optional()});
export type Video=z.infer<typeof videoSchema>;
export type Traffic=z.infer<typeof trafficSchema>;
export type Product=Omit<z.infer<typeof productSchema>,'id'|'traffic'>&{id:string;traffic:Traffic|null;note?:string};
export function normalizeProduct(p:any):Product{return {...p,releases:p.releases??[],changelogUrl:p.changelogUrl??'',features:p.features??[],audience:p.audience??[],videos:p.videos??[],traffic:p.traffic??null};}
export function summarizeSections(html:string,clean:(s:string)=>string){
const body=html.replace(/<(script|style|nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
const blocks=[...body.matchAll(/<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(m=>({level:Number(m[1]),text:clean(m[2]),index:m.index??0,end:(m.index??0)+m[0].length}));
const featureTitle=/features?|capabilities|what you can|功能|特性|特点|亮点/i;
const audienceTitle=/who.*for|built for|designed for|for teams|适用|适合|面向|人群|使用者/i;
function section(rx:RegExp){const found:string[]=[];for(let i=0;i<blocks.length;i++){const b=blocks[i];if(!rx.test(b.text))continue;const end=blocks[i+1]?.index??Math.min(body.length,b.end+1800);const content=body.slice(b.end,end);const list=[...content.matchAll(/<(?:li|p)\b[^>]*>([\s\S]*?)<\/(?:li|p)>/gi)].map(m=>clean(m[1])).filter(t=>t.length>3&&t.length<=500);if(list.length)found.push(...list);else if(b.text.length>8&&b.text.length<150)found.push(b.text);for(let j=i+1;j<Math.min(blocks.length,i+7);j++){if(blocks[j].level<=b.level)break;const text=blocks[j].text;if(text.length>3&&text.length<150)found.push(text)}}return [...new Set(found)].slice(0,6)}
return {features:section(featureTitle),audience:section(audienceTitle).map(x=>x.slice(0,200))};
}
