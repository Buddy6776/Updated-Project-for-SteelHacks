import { env } from 'cloudflare:workers';

type AgentEvent={eventType?:unknown;severity?:unknown;title?:unknown;detail?:unknown};
type Heartbeat={hostname?:unknown;platform?:unknown;osVersion?:unknown;agentVersion?:unknown;firewallEnabled?:unknown;diskEncryption?:unknown;autoUpdates?:unknown;events?:unknown};
const allowedSeverities=new Set(['low','medium','high','critical']);
async function sha256(value:string){const bytes=new TextEncoder().encode(value);const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('')}
function text(value:unknown,max:number){if(typeof value!=='string')return null;const cleaned=value.trim().replace(/[\u0000-\u001f\u007f]/g,' ');return cleaned?cleaned.slice(0,max):null}
function optionalBoolean(value:unknown){return typeof value==='boolean'?value?1:0:null}

export async function POST(request:Request){
 const contentLength=Number(request.headers.get('content-length')??'0');if(contentLength>32_768)return Response.json({error:'Heartbeat payload is too large'},{status:413});
 const authorization=request.headers.get('authorization')??'';if(!authorization.startsWith('Bearer '))return Response.json({error:'Agent token required'},{status:401});
 const raw=authorization.slice(7).trim();const separator=raw.indexOf('.');if(separator<1)return Response.json({error:'Invalid agent token'},{status:401});
 const endpointId=raw.slice(0,separator);const secret=raw.slice(separator+1);if(!/^[0-9a-f-]{36}$/i.test(endpointId)||secret.length<32)return Response.json({error:'Invalid agent token'},{status:401});
 const tokenHash=await sha256(secret);const endpoint=await env.DB.prepare('SELECT id FROM endpoints WHERE id = ? AND token_hash = ?').bind(endpointId,tokenHash).first<{id:string}>();if(!endpoint)return Response.json({error:'Invalid agent token'},{status:401});
 const body=await request.json() as Heartbeat;const hostname=text(body.hostname,120);const platform=text(body.platform,40);const osVersion=text(body.osVersion,160);const agentVersion=text(body.agentVersion,30);if(!hostname||!platform||!agentVersion)return Response.json({error:'hostname, platform, and agentVersion are required'},{status:400});
 const observedAt=new Date().toISOString();const firewallEnabled=optionalBoolean(body.firewallEnabled);const diskEncryption=optionalBoolean(body.diskEncryption);const autoUpdates=optionalBoolean(body.autoUpdates);
 await env.DB.prepare('UPDATE endpoints SET hostname = ?, platform = ?, os_version = ?, agent_version = ?, firewall_enabled = ?, disk_encryption = ?, auto_updates = ?, last_seen_at = ? WHERE id = ?').bind(hostname,platform,osVersion,agentVersion,firewallEnabled,diskEncryption,autoUpdates,observedAt,endpoint.id).run();
 const postureEvents:AgentEvent[]=[];
 if(firewallEnabled===0)postureEvents.push({eventType:'firewall_disabled',severity:'high',title:'Endpoint firewall is disabled',detail:'Enable the host firewall and confirm required applications still work.'});
 if(diskEncryption===0)postureEvents.push({eventType:'disk_encryption_disabled',severity:'medium',title:'Disk encryption is disabled',detail:'Enable full-disk encryption to protect business data if the device is lost or stolen.'});
 if(autoUpdates===0)postureEvents.push({eventType:'automatic_updates_disabled',severity:'medium',title:'Automatic updates are disabled',detail:'Enable operating-system security updates and establish a patch schedule.'});
 const supplied=Array.isArray(body.events)?(body.events as AgentEvent[]).slice(0,10):[];let accepted=0;
 for(const event of [...postureEvents,...supplied]){const eventType=text(event.eventType,60);const severity=text(event.severity,12);const title=text(event.title,140);const detail=text(event.detail,600);if(!eventType||!severity||!allowedSeverities.has(severity)||!title||!detail)continue;const duplicate=await env.DB.prepare("SELECT id FROM endpoint_events WHERE endpoint_id = ? AND event_type = ? AND status = 'open' ORDER BY observed_at DESC LIMIT 1").bind(endpoint.id,eventType).first();if(duplicate)continue;await env.DB.prepare('INSERT INTO endpoint_events (id, endpoint_id, severity, event_type, title, detail, status, observed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(),endpoint.id,severity,eventType,title,detail,'open',observedAt).run();accepted++}
 return Response.json({ok:true,endpointId:endpoint.id,observedAt,acceptedEvents:accepted,nextHeartbeatSeconds:60});
}
