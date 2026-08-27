import { env } from 'cloudflare:workers';
import { getAegisUser } from '../../business-auth';

export async function GET(){
 const user=await getAegisUser();if(!user)return Response.json({error:'Authentication required'},{status:401});
 const[websites,vulnerabilities,scans,notifications,endpoints,endpointEvents]=await Promise.all([
  env.DB.prepare('SELECT id, hostname, verified, monitoring_enabled AS monitoringEnabled, notify_email AS notifyEmail, created_at AS createdAt, last_checked_at AS lastCheckedAt FROM websites WHERE user_id = ? ORDER BY created_at DESC').bind(user.userId).all(),
  env.DB.prepare('SELECT id, website_id AS websiteId, url, type, severity, title, status, detected_at AS detectedAt, updated_at AS updatedAt FROM vulnerabilities WHERE user_id = ? ORDER BY updated_at DESC').bind(user.userId).all(),
  env.DB.prepare('SELECT id, website_id AS websiteId, url, scan_type AS scanType, status, finding_count AS findingCount, score, started_at AS startedAt, completed_at AS completedAt FROM scans WHERE user_id = ? ORDER BY started_at DESC').bind(user.userId).all(),
  env.DB.prepare('SELECT id, label, channel, destination, enabled, minimum_severity AS minimumSeverity, created_at AS createdAt FROM notification_destinations WHERE user_id = ? ORDER BY created_at DESC').bind(user.userId).all(),
  env.DB.prepare('SELECT id, display_name AS displayName, hostname, platform, os_version AS osVersion, agent_version AS agentVersion, firewall_enabled AS firewallEnabled, disk_encryption AS diskEncryption, auto_updates AS autoUpdates, last_seen_at AS lastSeenAt, created_at AS createdAt FROM endpoints WHERE user_id = ? ORDER BY created_at DESC').bind(user.userId).all(),
  env.DB.prepare('SELECT v.id, v.endpoint_id AS endpointId, v.severity, v.event_type AS eventType, v.title, v.detail, v.status, v.observed_at AS observedAt FROM endpoint_events v JOIN endpoints e ON e.id = v.endpoint_id WHERE e.user_id = ? ORDER BY v.observed_at DESC').bind(user.userId).all(),
 ]);
 const exportedAt=new Date().toISOString();const payload={format:'aegis-workspace-export-v1',exportedAt,account:{email:user.email,displayName:user.displayName},websites:websites.results,vulnerabilities:vulnerabilities.results,scans:scans.results,notificationDestinations:notifications.results,endpoints:endpoints.results,endpointEvents:endpointEvents.results};
 return new Response(JSON.stringify(payload,null,2),{headers:{'content-type':'application/json; charset=utf-8','content-disposition':`attachment; filename="aegis-export-${exportedAt.slice(0,10)}.json"`,'cache-control':'no-store'}})
}
