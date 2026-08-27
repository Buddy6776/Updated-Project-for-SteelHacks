'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function AuthForm({mode}:{mode:'login'|'signup'}){
 const[email,setEmail]=useState('');
 const[password,setPassword]=useState('');
 const[name,setName]=useState('');
 const[accepted,setAccepted]=useState(false);
 const[error,setError]=useState('');
 const[working,setWorking]=useState(false);
 const signup=mode==='signup';

 async function submit(event:FormEvent){
  event.preventDefault();setError('');setWorking(true);
  try{
   const params=new URLSearchParams(window.location.search);
   const response=await fetch(`/api/auth/${mode}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password,displayName:name,returnTo:params.get('returnTo'),acceptTerms:signup?accepted:undefined})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error??'Authentication failed.');
   window.location.assign(data.returnTo??'/dashboard');
  }catch(caught){setError(caught instanceof Error?caught.message:'Authentication failed.');setWorking(false)}
 }

 return <main className="auth-page">
  <Link className="auth-brand" href="/"><span>A</span><div><strong>Aegis</strong><small>Security Copilot</small></div></Link>
  <section className="auth-card">
   <div className="auth-independent">Standalone Aegis account — no ChatGPT or OpenAI login</div>
   <div className="auth-intro"><span>BUSINESS WORKSPACE</span><h1>{signup?'Create your Aegis account':'Welcome back'}</h1><p>{signup?'Register websites, monitor endpoints, and keep your security history in one workspace.':'Sign in to review your assets, findings, scan history, and notification settings.'}</p></div>
   <form onSubmit={submit}>
    {signup&&<label>Your name<input required autoComplete="name" value={name} onChange={event=>setName(event.target.value)} placeholder="Charlie Brill"/></label>}
    <label>Business email<input required type="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="you@company.com"/></label>
    <label>Password <small>{signup?'12–128 characters':''}</small><input required type="password" minLength={signup?12:1} maxLength={128} autoComplete={signup?'new-password':'current-password'} value={password} onChange={event=>setPassword(event.target.value)} placeholder="••••••••••••"/></label>
    {signup&&<label className="auth-consent"><input required type="checkbox" checked={accepted} onChange={event=>setAccepted(event.target.checked)}/><span>I confirm I will use Aegis only on systems I own or am authorized in writing to test, and I accept the <Link href="/terms">Terms</Link>, <Link href="/acceptable-use">Authorized Use Policy</Link>, and <Link href="/privacy">Privacy Policy</Link>.</span></label>}
    {error&&<p className="auth-error" role="alert">{error}</p>}
    <button disabled={working}>{working?'Please wait…':signup?'Create secure workspace →':'Sign in →'}</button>
   </form>
   <p className="auth-switch">{signup?'Already have an account?':'New to Aegis?'} <Link href={signup?'/login':'/signup'}>{signup?'Sign in':'Create an account'}</Link></p>
   <div className="auth-assurance"><span>✓ Encrypted session cookie</span><span>✓ Passwords stored as salted hashes</span><span>✓ Temporary lockout after repeated failures</span></div>
   {!signup&&<p className="auth-legal">Review the <Link href="/terms">Terms</Link>, <Link href="/acceptable-use">Authorized Use Policy</Link>, and <Link href="/privacy">Privacy Policy</Link>.</p>}
  </section>
  <aside className="auth-note"><strong>MVP authentication notice</strong><p>Before production use, add verified email delivery, password recovery, MFA or SSO, abuse protection, and an independent security review.</p></aside>
 </main>
}
