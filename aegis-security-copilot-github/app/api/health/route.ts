import { env } from 'cloudflare:workers';

export async function GET(){
 try{await env.DB.prepare('SELECT 1 AS ok').first();return Response.json({ok:true,service:'aegis-web',database:'ready'})}
 catch{return Response.json({ok:false,service:'aegis-web',database:'unavailable'},{status:503})}
}
