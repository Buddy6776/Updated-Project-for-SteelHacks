import { requireAegisUser } from '../business-auth';
import DashboardClient from './dashboard-client';
export const dynamic='force-dynamic';
export default async function Dashboard(){const user=await requireAegisUser('/dashboard');return <DashboardClient displayName={user.displayName} email={user.email}/>}
