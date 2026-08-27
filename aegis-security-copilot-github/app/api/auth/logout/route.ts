import { env } from 'cloudflare:workers';
import { clearSessionCookie,hashValue,SESSION_COOKIE } from '../../../business-auth';
export async function POST(request:Request){const cookie=request.headers.get('cookie')??'';const token=cookie.split(';').map(item=>item.trim()).find(item=>item.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length+1);if(token)await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await hashValue(token)).run();return Response.json({ok:true},{headers:{'set-cookie':clearSessionCookie(request.url)}})}
