import { env } from 'cloudflare:workers';
import { getAegisUser } from '../../business-auth';

async function sha256(value:string){const bytes=new TextEncoder().encode(value);const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('')}
function safeName(value:unknown){if(typeof value!=='string')return null;const name=value.trim().replace(/\s+/g,' ');return name.length>=2&&name.length<=80?name:null}

export async function GET(){
 const user=await getAegisUser();if(!user)return Response.json({error:'Authentication required'},{status:401});
 const endpoints=await env.DB.prepare(`SELECT e.id, e.display_name AS displayName, e.hostname, e.platform, e.os_version AS osVersion, e.agent_version AS agentVersion, e.firewall_enabled AS firewallEnabled, e.disk_encryption AS diskEncryption, e.auto_updates AS autoUpdates, e.last_seen_at AS lastSeenAt, e.created_at AS createdAt, (SELECT COUNT(*) FROM endpoint_events v WHERE v.endpoint_id = e.id AND v.status = 'open') AS openEvents FROM endpoints e WHERE e.user_id = ? ORDER BY COALESCE(e.last_seen_at,e.created_at) DESC`).bind(user.userId).all();
 const events=await env.DB.prepare(`SELECT v.id, v.endpoint_id AS endpointId, v.severity, v.event_type AS eventType, v.title, v.detail, v.status, v.observed_at AS observedAt, e.display_name AS endpointName FROM endpoint_events v JOIN endpoints e ON e.id = v.endpoint_id WHERE e.user_id = ? ORDER BY v.observed_at DESC LIMIT 20`).bind(user.userId).all();
 return Response.json({endpoints:endpoints.results,events:events.results});
}

export async function POST(request:Request){
 const user=await getAegisUser();if(!user)return Response.json({error:'Authentication required'},{status:401});
 const body=await request.json() as {displayName?:unknown};const displayName=safeName(body.displayName);if(!displayName)return Response.json({error:'Enter a device name between 2 and 80 characters'},{status:400});
 const id=crypto.randomUUID();const secret=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');const tokenHash=await sha256(secret);const createdAt=new Date().toISOString();
 await env.DB.prepare('INSERT INTO endpoints (id, user_id, display_name, token_hash, created_at) VALUES (?, ?, ?, ?, ?)').bind(id,user.userId,displayName,tokenHash,createdAt).run();
 return Response.json({endpoint:{id,displayName,hostname:null,platform:null,osVersion:null,agentVersion:null,firewallEnabled:null,diskEncryption:null,autoUpdates:null,lastSeenAt:null,createdAt,openEvents:0},enrollmentToken:`${id}.${secret}`},{status:201});
}
