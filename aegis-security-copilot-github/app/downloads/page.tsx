import { requireAegisUser } from '../business-auth';
import PortalSidebar from '../portal-sidebar';

const downloads=[
 {kind:'Private access',name:'WireGuard',description:'A lightweight open-source VPN protocol and tools for building a private tunnel.',url:'https://www.wireguard.com/install/',platforms:'Windows · macOS · Linux · iOS · Android'},
 {kind:'Private access',name:'Tailscale',description:'A managed mesh VPN built on WireGuard that can simplify secure access to a Raspberry Pi.',url:'https://tailscale.com/download',platforms:'Windows · macOS · Linux · iOS · Android'},
 {kind:'Private access',name:'OpenVPN Community',description:'An established open-source VPN client and server option for organizations that manage their own configuration.',url:'https://openvpn.net/community-downloads/',platforms:'Windows · macOS · Linux'},
 {kind:'Privacy VPN',name:'Proton VPN',description:'A consumer and business VPN option with official applications for major platforms.',url:'https://protonvpn.com/download',platforms:'Windows · macOS · Linux · iOS · Android'},
 {kind:'Privacy VPN',name:'Mullvad VPN',description:'A privacy-focused VPN service with open-source applications and clear platform downloads.',url:'https://mullvad.net/en/download/vpn/',platforms:'Windows · macOS · Linux · iOS · Android'},
 {kind:'Password security',name:'Bitwarden',description:'A password manager for creating and sharing strong business credentials.',url:'https://bitwarden.com/download/',platforms:'Desktop · Browser · Mobile · Server'},
 {kind:'Password security',name:'KeePassXC',description:'An offline, open-source password vault that stores its encrypted database under your control.',url:'https://keepassxc.org/download/',platforms:'Windows · macOS · Linux'},
 {kind:'Endpoint monitoring',name:'Wazuh',description:'An open-source security platform for endpoint telemetry, log analysis, and detection workflows.',url:'https://wazuh.com/install/',platforms:'Self-hosted server · Endpoint agents'},
 {kind:'Web testing',name:'OWASP ZAP',description:'An open-source web application testing proxy. Use only with explicit authorization.',url:'https://www.zaproxy.org/download/',platforms:'Windows · macOS · Linux · Docker'},
];

export const dynamic='force-dynamic';
export default async function DownloadsPage(){const user=await requireAegisUser('/downloads');return <main className="portal-shell"><PortalSidebar active="downloads" displayName={user.displayName} email={user.email}/><section className="portal-main"><header><span className="dash-kicker">TRUSTED DOWNLOAD CENTER</span><h1>Optional security tools from official sources</h1><p>Aegis links to each developer’s official download page instead of mirroring installers. Your team stays in control of what is installed.</p></header><div className="download-notice"><strong>Before installing</strong><p>Confirm the publisher, operating system, license, support model, and privacy policy. Test business-wide software on a small group first.</p></div><div className="download-grid">{downloads.map(item=><article key={item.name}><span>{item.kind}</span><h2>{item.name}</h2><p>{item.description}</p><small>{item.platforms}</small><a href={item.url} target="_blank" rel="noreferrer">Open official download ↗</a></article>)}</div></section></main>}
