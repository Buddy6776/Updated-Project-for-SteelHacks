'use client';

import { useMemo, useState } from 'react';

const concepts=[
 {term:'Vulnerability',group:'Fundamentals',plain:'A weakness that could let someone harm a system, expose data, or interrupt the business.',example:'Outdated website software with a known security flaw.'},
 {term:'Exposure',group:'Fundamentals',plain:'A system, service, or piece of information that is reachable from outside the business.',example:'A database administration page visible on the public internet.'},
 {term:'Severity',group:'Risk',plain:'A measure of how much harm a finding could cause and how urgently it deserves attention.',example:'Critical findings come before medium configuration improvements.'},
 {term:'Still vulnerable',group:'Workflow',plain:'The latest check still sees the security issue.',example:'HSTS remains missing after a new scan.'},
 {term:'In progress',group:'Workflow',plain:'A fix is being worked on or is waiting for a confirmation scan.',example:'Your hosting team enabled a setting and Aegis is waiting to verify it.'},
 {term:'Safe',group:'Workflow',plain:'The latest check no longer sees the issue. It does not mean every possible risk is gone.',example:'A certificate problem was fixed and confirmed by a later scan.'},
 {term:'HTTPS and TLS',group:'Website',plain:'Encryption that protects information while it travels between a visitor and a website.',example:'The lock icon in a browser indicates an HTTPS connection.'},
 {term:'HSTS',group:'Website',plain:'A browser rule that forces future visits to use encrypted HTTPS connections.',example:'It helps prevent a visitor from being downgraded to an unsafe connection.'},
 {term:'Content Security Policy (CSP)',group:'Website',plain:'A website rule that limits which scripts, images, and other content a browser may load.',example:'A strong CSP can reduce the impact of injected malicious scripts.'},
 {term:'SPF',group:'Email',plain:'A DNS policy listing which services are allowed to send email for a domain.',example:'Your newsletter provider may need to be included in SPF.'},
 {term:'DKIM',group:'Email',plain:'A cryptographic signature that lets receiving mail systems verify who signed a message.',example:'Google Workspace or Microsoft 365 signs outgoing business mail.'},
 {term:'DMARC',group:'Email',plain:'A policy that tells receivers what to do when a message fails SPF or DKIM checks and where to send reports.',example:'A reject policy can block many direct domain-spoofing attempts.'},
 {term:'Endpoint / EDR',group:'Devices',plain:'An endpoint is a laptop, desktop, or server. EDR watches those devices for suspicious activity and security-health changes.',example:'Aegis can report when a registered device stops checking in or loses firewall protection.'},
 {term:'IAM and least privilege',group:'Identity',plain:'Identity and access management controls who can sign in and what they are allowed to do. Least privilege means giving only the access needed.',example:'A billing employee should not automatically receive server-administrator access.'},
 {term:'MFA',group:'Identity',plain:'Multi-factor authentication requires another proof in addition to a password.',example:'A security key or authenticator code can stop many stolen-password attacks.'},
 {term:'CVE and CVSS',group:'Risk',plain:'A CVE identifies a publicly documented vulnerability. CVSS is one method for rating technical severity.',example:'Business context still matters even when two findings have the same CVSS score.'},
 {term:'False positive',group:'Risk',plain:'A scanner reports a possible issue that is not actually present or exploitable in the real environment.',example:'A version string looks outdated even though the vendor backported the security fix.'},
 {term:'Remediation',group:'Workflow',plain:'The work required to remove or reduce a security risk.',example:'Patching software, tightening a policy, or removing an unused service.'},
 {term:'Authorized scope',group:'Safety',plain:'The exact systems and testing methods an owner has given written permission to assess.',example:'Permission for example.com does not automatically include a supplier or unrelated subdomain.'},
 {term:'3-2-1 backup rule',group:'Recovery',plain:'Keep three copies of important data, on two kinds of storage, with one copy off-site or otherwise isolated.',example:'Production data, a local backup, and an encrypted off-site backup.'},
];

export default function LearnClient(){
 const[query,setQuery]=useState('');
 const[category,setCategory]=useState('All');
 const groups=['All',...Array.from(new Set(concepts.map(item=>item.group)))];
 const filtered=useMemo(()=>concepts.filter(item=>(category==='All'||item.group===category)&&`${item.term} ${item.plain} ${item.example}`.toLowerCase().includes(query.toLowerCase())),[category,query]);
 return <>
  <div className="learn-tools"><label>Search the glossary<input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Try HSTS, severity, or backup…"/></label><label>Category<select value={category} onChange={event=>setCategory(event.target.value)}>{groups.map(group=><option key={group}>{group}</option>)}</select></label></div>
  <div className="concept-grid">{filtered.map(item=><article key={item.term}><span>{item.group}</span><h2>{item.term}</h2><p>{item.plain}</p><div><strong>Example</strong><small>{item.example}</small></div></article>)}</div>
  {filtered.length===0&&<p className="content-empty">No concepts match that search.</p>}
 </>
}
