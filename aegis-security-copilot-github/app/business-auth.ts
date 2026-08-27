import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type AegisUser={userId:string;email:string;displayName:string;fullName:string|null};
export const SESSION_COOKIE='aegis_session';

export async function hashValue(value:string){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return bytesToHex(new Uint8Array(digest))}
export async function passwordHash(password:string,saltHex:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:hexToBytes(saltHex),iterations:600_000},key,256);return bytesToHex(new Uint8Array(bits))}
export function randomHex(bytes:number){const value=new Uint8Array(bytes);crypto.getRandomValues(value);return bytesToHex(value)}
export function constantTimeEqual(left:string,right:string){if(left.length!==right.length)return false;let difference=0;for(let index=0;index<left.length;index++)difference|=left.charCodeAt(index)^right.charCodeAt(index);return difference===0}
export function sessionCookie(token:string,requestUrl:string,maxAge=60*60*24*14){const secure=new URL(requestUrl).protocol==='https:'?'; Secure':'';return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`}
export function clearSessionCookie(requestUrl:string){return sessionCookie('',requestUrl,0)}
export async function getAegisUser():Promise<AegisUser|null>{const token=(await cookies()).get(SESSION_COOKIE)?.value;if(!token)return null;const tokenHash=await hashValue(token);const now=new Date().toISOString();const user=await env.DB.prepare('SELECT a.id AS userId, a.email, a.display_name AS displayName FROM sessions s JOIN accounts a ON a.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?').bind(tokenHash,now).first<{userId:string;email:string;displayName:string}>();return user?{...user,fullName:user.displayName}:null}
export async function requireAegisUser(returnTo:string){const user=await getAegisUser();if(user)return user;redirect(`/login?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`)}
export function safeReturnTo(value:string|null|undefined){if(!value||!value.startsWith('/')||value.startsWith('//'))return'/dashboard';try{const url=new URL(value,'https://aegis.local');return url.origin==='https://aegis.local'?`${url.pathname}${url.search}${url.hash}`:'/dashboard'}catch{return'/dashboard'}}
function bytesToHex(bytes:Uint8Array){return [...bytes].map(byte=>byte.toString(16).padStart(2,'0')).join('')}
function hexToBytes(value:string){const bytes=new Uint8Array(value.length/2);for(let index=0;index<bytes.length;index++)bytes[index]=Number.parseInt(value.slice(index*2,index*2+2),16);return bytes}
