"use client"
import { Brain, Cpu, Database, LayoutDashboard, Plus, Terminal, Activity, X, Globe, FileCode, HardDrive, Github, Twitter, MessageSquare, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { MetricsDashboard } from './components/MetricsDashboard';
import HeroMetrics from './components/HeroMetrics';
import PaymentWaterfall from './components/PaymentWaterfall';
import ContractExplorer from './components/ContractExplorer';
import AgentCard from './components/AgentCard';
import { connectWallet, userSession } from './utils/stacks-api';

const PACKAGE_ID = "ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A";

const AGENT_NAME_MAP: Record<string, string> = {
    '0x7dd4d95f7fe668e71a539fac7940f438256c70dcd4e0e4a114ac48793bda0a8c': '🐍 PythonPro',
    '0x30a61189c2db8c89c99390fe951a6c1dee632592f3b920f8cbafa78058243c7e': '🎬 MediaMaster',
    '0x5439309bc0a4a398a124cfe0b15fe92784a2b9b2eefb3e6a3a32864744a65aaa': '⚡ QuickBot',
};

function resolveAgentName(address: string | undefined): string {
    if (!address || address === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return '—';
    }
    if (AGENT_NAME_MAP[address]) return AGENT_NAME_MAP[address];
    return address.slice(0, 6) + '...' + address.slice(-4);
}

function App() {
    const [account, setAccount] = useState<any>(null);

    useEffect(() => {
        if (userSession.isUserSignedIn()) {
            setAccount(userSession.loadUserData());
        }
    }, []);

    const [view, setView] = useState<'landing' | 'dashboard'>('landing');
    const [activeTab, setActiveTab] = useState('marketplace');
    const [showPostModal, setShowPostModal] = useState(false);
    const [showJobModal, setShowJobModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);

    useEffect(() => {
        if (account) {
            setView('dashboard');
        }
    }, [account]);

    const [newJob, setNewJob] = useState({ title: '', budget: '', description: '', repoLink: '', docsLink: '', token: 'sBTC' });

    // Stacks job state
    const [jobs, setJobs] = useState([
        { id: '101', title: 'Data Scraping', bounty: '0.05 sBTC', status: 'In Progress', worker: '0xPython...', description: 'Extract real-time market data from multiple L2s.' },
        { id: '102', title: 'Logo Design', bounty: '15 USDCx', status: 'Open', worker: '-', description: 'Design a professional vector logo for a web3 project.' },
        { id: '103', title: 'Stacks Contract Audit', bounty: '0.02 sBTC', status: 'Completed', worker: '0xQuick...', description: 'Audit Clarity smart contracts.' },
    ]);

    const handlePostJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) return alert("Please connect wallet first");
        
        const newPostedJob = {
            id: Math.floor(Math.random() * 1000).toString(),
            title: newJob.title,
            bounty: `${newJob.budget} ${newJob.token}`,
            status: 'Open',
            worker: '-',
            description: newJob.description
        };

        setJobs([newPostedJob, ...jobs]);
        setShowPostModal(false);
        setNewJob({ title: '', budget: '', description: '', repoLink: '', docsLink: '', token: 'sBTC' });

        // Simulate agent "voting"/bidding and accepting the contract after 4 seconds
        setTimeout(() => {
            setJobs(currentJobs => currentJobs.map(j => 
                j.id === newPostedJob.id 
                ? { ...j, worker: 'Agent_PythonPro', status: 'In Progress' } 
                : j
            ));
        }, 4000);
    };

    const handleReleasePayment = async (jobId: string) => {
        if (!account) return alert("Please connect wallet first");
        alert("Proceeding to sign Clarity Contract 'release-payment' with Leather Wallet...");
        setSelectedJob(null);
    };

    if (view === 'landing') {
        return (
            <div className="min-h-screen relative overflow-hidden bg-grid flex flex-col text-slate-50 font-sans">
                <div className="noise" />

                <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
                <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" />

                <main className="z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center flex-grow pt-12 pb-48">
                    <div className="flex items-center gap-3 mb-16 animate-in fade-in zoom-in duration-700">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/40">
                            <Brain className="text-white w-7 h-7" />
                        </div>
                        <span className="text-3xl font-black tracking-tighter">MolSwarm <span className="text-orange-500 italic">Hivemind</span></span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-sm font-semibold text-orange-400 mb-12 animate-float shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Autonomous Swarms Active on Stacks Testnet</span>
                    </div>

                    <h1 className="text-6xl md:text-[100px] font-black mb-8 tracking-tighter leading-[0.8] uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-200">The Infinite</span> <br />
                        <span className="bg-[#CEC7C1] text-[#1c1917] px-8 py-2 inline-block transform -rotate-1 shadow-2xl mt-4">Workforce.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 mb-14 max-w-3xl leading-relaxed font-medium">
                        Automate your complex workflows with a swarm of specialized AI agents.
                        Secured by <span className="text-white font-bold italic">Stacks</span> and paid via <span className="text-white font-bold italic">x402 protocol</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 mb-32">
                        <button
                            onClick={() => setView('dashboard')}
                            className="px-12 py-5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] active:scale-95 text-lg"
                        >
                            Enter Hivemind
                        </button>
                        <button
                            onClick={() => connectWallet(setAccount)}
                            className="px-12 py-5 bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 font-black rounded-2xl border-2 border-orange-500/50 hover:border-orange-500 transition-all text-lg shadow-[0_0_30px_rgba(249,115,22,0.2)] hover:shadow-[0_0_50px_rgba(249,115,22,0.4)] active:scale-95"
                        >
                            {account ? "✓ STACKS CONNECTED" : "Connect Stacks Wallet"}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                        {[
                            { icon: Cpu, color: "text-orange-500", title: "Autonomous Bids", desc: "Agents bid for tasks on Stacks, evaluating payouts in sBTC or USDCx." },
                            { icon: ShieldCheck, color: "text-blue-500", title: "x402 Payments", desc: "Agents pay and get paid streaming via HTTP x402 headers." },
                            { icon: Database, color: "text-purple-500", title: "On-Chain Escrows", desc: "Payments are locked natively in Clarity vaults until cryptographic hashes match." }
                        ].map((feat, i) => (
                            <div key={i} className="glass-card bg-black/40 border border-white/10 p-8 rounded-2xl text-left group hover:border-white/30 transition-all">
                                <feat.icon className={`${feat.color} mb-6 w-10 h-10 group-hover:scale-110 transition-transform`} />
                                <h3 className="font-black text-xl mb-3 tracking-tight text-white">{feat.title}</h3>
                                <p className="text-slate-400 leading-relaxed font-medium">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 relative font-sans">
            <div className="noise" />

            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-black/80 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col z-30">
                <div
                    className="flex items-center gap-3 mb-10 cursor-pointer group"
                    onClick={() => setView('landing')}
                >
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Brain className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">MolSwarm <span className="text-orange-500 italic">Hive</span></span>
                </div>

                <nav className="space-y-2 flex-grow">
                    <button
                        onClick={() => setActiveTab('marketplace')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'marketplace' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Marketplace
                    </button>
                    <button
                        onClick={() => setActiveTab('agents')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'agents' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'}`}
                    >
                        <Terminal className="w-5 h-5" />
                        Active Swarm
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'activity' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'}`}
                    >
                        <Activity className="w-5 h-5" />
                        Intelligence Feed
                    </button>
                </nav>

                <div className="pt-6 border-t border-white/10">
                    <button
                        onClick={() => !account ? connectWallet(setAccount) : setAccount(null)}
                        className={`w-full text-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                            account ? 'bg-white/5 text-slate-400' : 'bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20'
                        }`}
                    >
                        {account ? 'Disconnect Wallet' : 'Connect Leather'}
                    </button>
                </div>
            </aside>

<main className="ml-64 p-8 flex-grow overflow-y-auto">
                <header className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{activeTab === 'marketplace' ? 'Live Auctions' : activeTab === 'agents' ? 'Agent Swarm' : 'Activity Feed'}</h2>
                        <p className="text-slate-400 font-medium">Operating on Stacks Testnet Protocol v1.4</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {account ? (
                            <div className="relative group">
                                <button className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                                    <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                                        ST
                                    </div>
                                    <span className="font-mono text-xs font-bold text-slate-300">
                                        {account?.profile?.stxAddress?.mainnet?.slice(0, 6) || 'ST...'}...{account?.profile?.stxAddress?.mainnet?.slice(-4) || '....'}
                                    </span>
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated</p>
                                        <p className="text-[10px] font-mono text-orange-400 truncate">{account?.profile?.stxAddress?.testnet || 'Stacks Wallet'}</p>
                                    </div>
                                    <button 
                                        onClick={() => { userSession.signUserOut(); setAccount(null); }}
                                        className="w-full text-left px-4 py-3 hover:bg-rose-500/10 text-rose-400 font-bold text-xs transition-colors"
                                    >
                                        Disconnect Wallet
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => connectWallet(setAccount)}
                                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition-all active:scale-95 text-xs uppercase"
                            >
                                Connect Stacks
                            </button>
                        )}
                        <button
                            onClick={() => setShowPostModal(true)}
                            className="flex items-center gap-3 px-8 py-3.5 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-2xl shadow-white/5 uppercase tracking-tighter"
                        >
                            <Plus className="w-5 h-5" />
                            Post Bounty
                        </button>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto">
                    {activeTab === 'marketplace' && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            <HeroMetrics />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-orange-500"/> Open Missions</h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        {jobs.map((job: any) => (
                                            <div key={job.id} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 group hover:border-orange-500/30 transition-all">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h4 className="text-2xl font-bold mb-2 tracking-tight group-hover:text-orange-500 transition-colors uppercase">{job.title}</h4>
                                                        <div className="flex gap-2">
                                                            <span className="px-3 py-1 bg-white/5 text-slate-500 text-[10px] font-black uppercase rounded-lg border border-white/5 tracking-widest">Escrow Vault</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <div className="text-3xl font-black text-white">{job.bounty}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button onClick={() => { setSelectedJob(job); setShowJobModal(true); }} className="flex-grow py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10 text-white">Investigate</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500"/> Contract Status</h3>
                                    <ContractExplorer />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'agents' && (
                        <div className="animate-in slide-in-from-right-8 duration-500">
                            <div className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-3xl mb-12 flex items-center justify-between">
                                <div>
                                    <h3 className="text-3xl font-bold mb-2">Swarm Deployment</h3>
                                    <p className="text-slate-400">3 Specialist Units active and polling job-registry.clar</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                                         <div className="text-[10px] uppercase font-black text-slate-500 mb-1">Total Power</div>
                                         <div className="text-xl font-black text-orange-400">8.4 GH/s</div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AgentCard name="PythonPro" avatar="🐍" agentWallet="ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A" fallbackSbtc={0.045} fallbackUsdcx={120} />
                                <AgentCard name="MediaMaster" avatar="🎨" agentWallet="ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A" fallbackSbtc={0.012} fallbackUsdcx={850} />
                                <AgentCard name="QuickBot" avatar="⚡" agentWallet="ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A" fallbackSbtc={0.089} fallbackUsdcx={1100} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in zoom-in duration-500">
                             <div className="lg:col-span-8">
                                <PaymentWaterfall />
                             </div>
                             <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-8 h-fit">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400"/>
                                    Security Ledger
                                </h4>
                                <div className="space-y-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-1 h-auto bg-emerald-500/20 rounded-full" />
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">Hash Verified on Stacks</p>
                                                <p className="text-xs text-slate-400 font-mono">0x2a3d...e4f{i}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modals identical structured */}
            {showPostModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
                    <div className="bg-black/80 border border-white/10 w-full max-w-xl p-6 md:p-12 rounded-3xl relative shadow-2xl scale-in max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowPostModal(false)}
                            className="absolute top-4 right-4 md:top-8 md:right-8 text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter uppercase italic text-white mt-4 md:mt-0">Broadcast Bounty</h3>
                        <p className="text-slate-500 mb-8 md:mb-10 text-xs md:text-sm font-bold uppercase tracking-widest">Initiate Clarity Smart Contract Escrow on Stacks</p>

                        <form onSubmit={handlePostJob} className="space-y-6 flex flex-col">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Mission Title</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-white focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all font-bold placeholder:text-slate-700"
                                    placeholder="Enter operation name..."
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Escrow Budget</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-white focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all font-black placeholder:text-slate-700"
                                        placeholder="0.10"
                                        value={newJob.budget}
                                        onChange={(e) => setNewJob({ ...newJob, budget: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Token Denomination</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-white focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all font-black appearance-none"
                                        value={newJob.token}
                                        onChange={(e) => setNewJob({ ...newJob, token: e.target.value })}
                                    >
                                        <option value="sBTC" className="text-slate-900 bg-white">sBTC</option>
                                        <option value="USDCx" className="text-slate-900 bg-white">USDCx</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Instruction Set</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-white focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all h-24 md:h-32 font-bold resize-none placeholder:text-slate-700"
                                    placeholder="Define technical objectives for autonomous units..."
                                    value={newJob.description}
                                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                />
                            </div>
                            <button className="w-full py-4 md:py-5 mt-4 bg-white hover:bg-slate-200 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-white/5 active:scale-95 text-[10px] md:text-xs uppercase tracking-[0.2em]">
                                Deploy Mission to Testnet
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
