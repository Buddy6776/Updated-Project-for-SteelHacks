'use client';

import { FormEvent, KeyboardEvent, useId, useMemo, useState } from 'react';

export type CommandSuggestion={
 command:string;
 label:string;
 detail:string;
 icon:string;
 keywords:string;
};

export const publicCommandSuggestions:CommandSuggestion[]=[
 {command:'/priority',label:'What should I fix first?',detail:'Prioritize the finding with the greatest business risk.',icon:'01',keywords:'first priority urgent risk fix'},
 {command:'/explain hsts',label:'Explain the missing HSTS header',detail:'Get a plain-English explanation of this website finding.',icon:'Aa',keywords:'hsts header explain meaning plain english'},
 {command:'/fix security headers',label:'Show me how to fix my security headers',detail:'Turn the scan result into practical remediation steps.',icon:'✓',keywords:'repair remediation csp hsts headers steps'},
 {command:'/draft web-team message',label:'Draft a message for my web team',detail:'Create a concise handoff with the issue and requested fix.',icon:'✦',keywords:'email developer hosting team draft message'},
 {command:'/score',label:'What does my security score mean?',detail:'Understand the score without technical jargon.',icon:'#',keywords:'score grade result understand business'},
];

export const workspaceCommandSuggestions:CommandSuggestion[]=[
 {command:'/findings critical',label:'Show critical vulnerabilities',detail:'Focus on open findings with the highest severity.',icon:'!',keywords:'critical high vulnerabilities findings urgent'},
 {command:'/changes latest-scan',label:'What changed since my last scan?',detail:'Summarize new, fixed, and unchanged findings.',icon:'↻',keywords:'change latest scan history new fixed'},
 {command:'/endpoints attention',label:'Which endpoints need attention?',detail:'Review offline devices and open endpoint alerts.',icon:'ED',keywords:'endpoint device edr offline alert attention'},
 {command:'/email posture',label:'Check my email spoofing protection',detail:'Review SPF, DKIM, DMARC, and related safeguards.',icon:'@',keywords:'email spoofing spf dkim dmarc posture'},
 {command:'/checklist',label:'Create a remediation checklist',detail:'Turn current findings into an ordered action list.',icon:'✓',keywords:'remediation checklist tasks fix plan'},
 {command:'/report executive',label:'Summarize risk for a business owner',detail:'Translate technical findings into a short executive update.',icon:'Aa',keywords:'report executive owner summary business risk'},
];

export default function CommandSuggestions({value,onChange,onSubmit,suggestions,placeholder,buttonLabel='Send',className=''}:{value:string;onChange:(value:string)=>void;onSubmit:(value:string)=>void;suggestions:CommandSuggestion[];placeholder:string;buttonLabel?:string;className?:string}){
 const listId=useId();
 const[open,setOpen]=useState(false);
 const[activeIndex,setActiveIndex]=useState(-1);
 const matches=useMemo(()=>{
  const query=value.trim().toLowerCase();
  if(!query)return suggestions.slice(0,5);
  const terms=query.replace(/^\//,'').split(/\s+/).filter(Boolean);
  return suggestions.filter(item=>{const searchable=`${item.command} ${item.label} ${item.detail} ${item.keywords}`.toLowerCase();return terms.every(term=>searchable.includes(term))}).slice(0,5);
 },[suggestions,value]);
 const visible=open&&matches.length>0;
 function submit(text:string){const cleaned=text.trim();if(!cleaned)return;setOpen(false);setActiveIndex(-1);onSubmit(cleaned)}
 function handleSubmit(event:FormEvent){event.preventDefault();if(visible&&activeIndex>=0){submit(matches[activeIndex].command);return}submit(value)}
 function handleKeyDown(event:KeyboardEvent<HTMLInputElement>){
  if(event.key==='ArrowDown'){event.preventDefault();setOpen(true);setActiveIndex(current=>Math.min(current+1,matches.length-1))}
  if(event.key==='ArrowUp'){event.preventDefault();setOpen(true);setActiveIndex(current=>Math.max(current-1,0))}
  if(event.key==='Escape'){event.preventDefault();setOpen(false);setActiveIndex(-1)}
 }
 return <div className={`command-composer ${className}${visible?' suggestions-visible':''}`}>
  <form onSubmit={handleSubmit}>
   <input role="combobox" aria-autocomplete="list" aria-expanded={visible} aria-controls={listId} aria-activedescendant={activeIndex>=0?`${listId}-${activeIndex}`:undefined} aria-label="Ask Aegis" placeholder={placeholder} value={value} onFocus={()=>setOpen(true)} onBlur={()=>window.setTimeout(()=>setOpen(false),100)} onChange={event=>{onChange(event.target.value);setOpen(true);setActiveIndex(-1)}} onKeyDown={handleKeyDown}/>
   <button aria-label={buttonLabel}>{buttonLabel}<span aria-hidden="true"> →</span></button>
  </form>
  {visible&&<div className="command-suggestion-panel" id={listId} role="listbox" aria-label="Suggested Aegis commands">
   <div className="suggestion-heading"><span>{value.trim()?'Matching suggestions':'Suggested questions'}</span><small>↑↓ to navigate · Enter to ask</small></div>
   {matches.map((item,index)=><button type="button" role="option" aria-selected={index===activeIndex} id={`${listId}-${index}`} className={index===activeIndex?'active':''} key={item.command} onPointerDown={event=>{event.preventDefault();submit(item.command)}} onMouseEnter={()=>setActiveIndex(index)}>
    <span className="suggestion-icon">{item.icon}</span><span className="suggestion-copy"><strong>{item.label}</strong><small>{item.detail}</small></span><code>{item.command}</code>
   </button>)}
  </div>}
 </div>
}
