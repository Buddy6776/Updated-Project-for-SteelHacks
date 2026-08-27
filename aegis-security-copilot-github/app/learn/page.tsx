import { requireAegisUser } from '../business-auth';
import PortalSidebar from '../portal-sidebar';
import LearnClient from './learn-client';

export const dynamic='force-dynamic';
export default async function LearnPage(){const user=await requireAegisUser('/learn');return <main className="portal-shell"><PortalSidebar active="learn" displayName={user.displayName} email={user.email}/><section className="portal-main"><header><span className="dash-kicker">SECURITY KNOWLEDGE CENTER</span><h1>Understand what Aegis finds</h1><p>Plain-language definitions for the website, email, endpoint, identity, and recovery terms businesses see most often.</p></header><LearnClient/></section></main>}
