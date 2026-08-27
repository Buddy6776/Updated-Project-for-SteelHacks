'use client';

import Link from 'next/link';

export default function PortalSidebar({active,displayName,email}:{active:'learn'|'downloads'|'resolve';displayName:string;email:string}){
 async function signOut(){await fetch('/api/auth/logout',{method:'POST'});window.location.assign('/')}
 return <aside className="portal-sidebar">
  <Link className="dash-brand" href="/"><span>A</span><div><strong>Aegis</strong><small>Security Copilot</small></div></Link>
  <nav>
   <p>BUSINESS WORKSPACE</p>
   <Link href="/dashboard">⌂ <span>Dashboard</span></Link>
   <Link href="/dashboard#vulnerabilities">◆ <span>Vulnerability history</span></Link>
   <Link href="/dashboard#scan-history">◷ <span>Past URL scans</span></Link>
   <Link href="/dashboard#notifications">◇ <span>Notification center</span></Link>
   <Link href="/dashboard#analytics">▥ <span>Analytics</span></Link>
   <p>KNOWLEDGE & TOOLS</p>
   <Link className={active==='learn'?'active':''} href="/learn">ⓘ <span>Security glossary</span></Link>
   <Link className={active==='downloads'?'active':''} href="/downloads">⇩ <span>Trusted downloads</span></Link>
   <Link className={active==='resolve'?'active':''} href="/resolve">✦ <span>Aegis Resolve Pro</span></Link>
   <p>POLICIES</p>
   <Link href="/acceptable-use">✓ <span>Authorized use</span></Link>
   <Link href="/terms">§ <span>Terms of service</span></Link>
   <Link href="/privacy">◈ <span>Privacy</span></Link>
  </nav>
  <div className="portal-profile"><span>{displayName.slice(0,2).toUpperCase()}</span><div><strong>{displayName}</strong><small>{email}</small></div><button onClick={signOut}>Sign out</button></div>
 </aside>
}
