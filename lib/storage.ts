import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw Error('数据服务暂不可用');return env.DB}
export function bucket(){const b=(env as unknown as {BUCKET?:R2Bucket}).BUCKET;if(!b)throw Error('视频存储暂不可用');return b}
