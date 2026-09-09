import {collectChangelog} from '@/lib/changelog';
import {publicUrl} from '@/lib/product';
export async function POST(req:Request){try{const {url,changelogUrl}=await req.json();return Response.json(await collectChangelog(publicUrl(String(url)).href,changelogUrl?publicUrl(String(changelogUrl)).href:undefined))}catch{return Response.json({error:'暂时无法读取更新日志，请检查链接或手动补充。'},{status:502})}}
