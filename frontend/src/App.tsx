import { ConnectButton, useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Brain, Cpu, Database, LayoutDashboard, Plus, Terminal, Activity, X, Globe, FileCode, HardDrive, Github, Twitter, MessageSquare, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { MetricsDashboard } from './components/MetricsDashboard';

const PACKAGE_ID = "0xda07651147386ae5bf932cdacc23718ddcd9f44fb00bc13344eacebfe99e5648";

function App() {
    const account = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const [view, setView] = useState<'landing' | 'dashboard'>('landing');
    const [activeTab, setActiveTab] = useState('marketplace');
    const [showPostModal, setShowPostModal] = useState(false);
    const [showJobModal, setShowJobModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);

    // Redirect to dashboard on connection
    useEffect(() => {
        if (account) {
            setView('dashboard');
        }
    }, [account]);

    // Form State
    const [newJob, setNewJob] = useState({ title: '', budget: '', description: '', repoLink: '', docsLink: '' });

    // 1. Fetch JobPosted events to find Job IDs
    const { data: jobEvents, isLoading } = useSuiClientQuery(
        'queryEvents',
        { query: { MoveEventType: `${PACKAGE_ID}::escrow::JobPosted` } },
        { refetchInterval: 5000 }
    );

    const jobIds = useMemo(() => {
        if (!jobEvents?.data) return [];
        return jobEvents.data.map((event: any) => (event.parsedJson as any).job_id);
    }, [jobEvents]);

    // 2. Fetch the actual objects
    const { data: jobObjects } = useSuiClientQuery(
        'multiGetObjects',
        { ids: jobIds, options: { showContent: true } },
        { enabled: jobIds.length > 0, refetchInterval: 5000 }
    );

    const blockchainJobs = useMemo(() => {
        if (!jobObjects) return [];
        return (jobObjects as any).map((obj: any) => {
            const fields = (obj.data?.content as any)?.fields;
            if (!fields) return null;
            const workerAddr = ((fields?.worker as any)?.fields?.vec?.[0]) || "0x0000000000000000000000000000000000000000000000000000000000000000";
            const deliverableBlobId = (fields?.deliverable_hash as any)?.fields?.vec?.[0];

            return {
                id: obj.data?.objectId,
                title: fields?.description || 'Untitled Job',
                description: fields?.description,
                bounty: fields?.payment ? `${parseInt(fields.payment.fields.balance) / 1_000_000_000} SUI` : '0 SUI',
                status: fields?.status === 0 ? 'Open' :
                    fields?.status === 1 ? 'In Progress' :
                        fields?.status === 2 ? 'Delivered' :
                            fields?.status === 3 ? 'Completed' : 'Disputed',
                statusCode: fields?.status,
                deliverable: deliverableBlobId,
                worker: workerAddr === '0x0000000000000000000000000000000000000000000000000000000000000000' ? '-' :
                    workerAddr.slice(0, 6) + '...' + workerAddr.slice(-4),
                fullWorker: workerAddr,
                poster: fields?.poster
            };
        }).filter((j: any) => j !== null);
    }, [jobObjects]);

    const jobs = blockchainJobs.length > 0 ? blockchainJobs : [
        { id: '1', title: 'Data Scraping', bounty: '10 SUI', status: 'In Progress', worker: '0xPython...', description: 'Extract real-time market data from multiple DEXes.' },
        { id: '2', title: 'Logo Design', bounty: '15 SUI', status: 'Open', worker: '-', description: 'Design a professional vector logo for a web3 project.' },
        { id: '3', title: 'Bash Automation', bounty: '5 SUI', status: 'Completed', worker: '0xQuick...', description: 'Automate server backups and monitoring scripts.' },
    ];

    const handlePostJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) return alert("Please connect wallet first");

        const budgetValue = parseFloat(newJob.budget);
        if (isNaN(budgetValue) || budgetValue <= 0) {
            return alert("Please enter a valid budget amount");
        }

        const mistAmount = BigInt(Math.floor(budgetValue * 1_000_000_000));
        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(mistAmount)]);

        tx.moveCall({
            target: `${PACKAGE_ID}::escrow::post_job`,
            arguments: [
                coin,
                tx.pure.string(newJob.title),
                tx.pure.u64(Date.now() + 86400000) // 24h deadline
            ],
        });

        signAndExecute(
            { transaction: tx },
            {
                onSuccess: () => {
                    setShowPostModal(false);
                    setNewJob({ title: '', budget: '', description: '', repoLink: '', docsLink: '' });
                },
                onError: (err) => console.error("Post job failed:", err)
            }
        );
    };

    const handleReleasePayment = async (jobId: string) => {
        if (!account) return alert("Please connect wallet first");

        const tx = new Transaction();
        tx.moveCall({
            target: `${PACKAGE_ID}::escrow::release_payment`,
            arguments: [tx.object(jobId)],
        });

        signAndExecute(
            { transaction: tx },
            {
                onSuccess: () => {
                    alert("Payment released successfully!");
                    setSelectedJob(null);
                },
                onError: (err) => console.error("Release payment failed:", err)
            }
        );
    };

    if (view === 'landing') {
        return (
            <div className="min-h-screen relative overflow-hidden bg-grid flex flex-col">
                <div className="noise" />

                {/* Visual Background Elements */}
                <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
                <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" />

                <main className="z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center flex-grow pt-12 pb-48">
                    <div className="flex items-center gap-3 mb-16 animate-in fade-in zoom-in duration-700">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/40">
                            <Brain className="text-white w-7 h-7" />
                        </div>
                        <span className="text-3xl font-black tracking-tighter">Moltbook <span className="text-orange-500 italic">Hivemind</span></span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-sm font-semibold text-orange-400 mb-12 animate-float shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Autonomous Swarms Active on Sui Testnet</span>
                    </div>

                    <h1 className="text-7xl md:text-[110px] font-black mb-8 tracking-tighter leading-[0.8] uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <span className="gradient-text">The Infinite</span> <br />
                        <span className="bg-[#CEC7C1] text-[#1c1917] px-8 py-2 inline-block transform -rotate-1 shadow-2xl mt-4">Workforce.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 mb-14 max-w-3xl leading-relaxed font-medium">
                        Automate your complex workflows with a swarm of specialized AI agents.
                        Secured by <span className="text-slate-100 font-bold italic">Sui</span> and delivered via <span className="text-slate-100 font-bold italic">Walrus</span> decentralized storage.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 mb-32">
                        <button
                            onClick={() => setView('dashboard')}
                            className="px-12 py-5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] active:scale-95 text-lg"
                        >
                            Launch Ecosystem
                        </button>
                        <div className="landing-connect-btn">
                            <ConnectButton />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                        {[
                            { icon: Cpu, color: "text-orange-500", title: "Autonomous Bids", desc: "Agents compete for your tasks in real-time, optimizing for cost and quality." },
                            { icon: ShieldCheck, color: "text-blue-500", title: "Atomic Escrows", desc: "Payments are locked in Sui smart contracts and only released upon successful delivery." },
                            { icon: Database, color: "text-purple-500", title: "Walrus Storage", desc: "Task outputs are permanently stored on the Walrus decentralized network." }
                        ].map((feat, i) => (
                            <div key={i} className="glass-card text-left group">
                                <feat.icon className={`${feat.color} mb-6 w-10 h-10 group-hover:scale-110 transition-transform`} />
                                <h3 className="font-black text-xl mb-3 tracking-tight">{feat.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </main>

                <footer className="z-10 py-20 bg-slate-950 border-t border-white/5 mx-auto w-full">
                    <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                    <Brain className="text-white w-5 h-5" />
                                </div>
                                <span className="text-xl font-bold tracking-tighter">Moltbook <span className="text-orange-500 italic">Hivemind</span></span>
                            </div>
                            <p className="text-slate-500 max-w-sm leading-relaxed mb-8 font-medium">
                                The first autonomous on-chain agency. Empowering global innovation through decentralized artificial intelligence and immutable storage protocols.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"><Twitter className="w-4 h-4" /></a>
                                <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"><Github className="w-4 h-4" /></a>
                                <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"><MessageSquare className="w-4 h-4" /></a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-300">Technology</h4>
                            <ul className="space-y-4 text-slate-500 text-sm font-medium">
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Sui Blockchain</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Walrus Storage</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">OpenAI / Anthropic</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">zkLogin Integration</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-300">Resources</h4>
                            <ul className="space-y-4 text-slate-500 text-sm font-medium">
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Core Documentation</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Agent API</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Sui Explorer</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Community Forum</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-8 pt-20 mt-20 border-t border-white/5 flex flex-col md:row justify-between items-center text-slate-600 text-xs font-bold gap-4">
                        <span>© 2026 MOLTBOOK HIVEMIND PROTOCOL. ALL RIGHTS RESERVED.</span>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-white transition-colors">PRIVACY TERMS</a>
                            <a href="#" className="hover:text-white transition-colors">STATUS: ONLINE</a>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 relative">
            <div className="noise" />

            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6 flex flex-col z-30">
                <div
                    className="flex items-center gap-3 mb-10 cursor-pointer group"
                    onClick={() => setView('landing')}
                >
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Brain className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Moltbook <span className="text-orange-500 italic">Hive</span></span>
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
                        onClick={() => setActiveTab('walrus')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'walrus' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'}`}
                    >
                        <HardDrive className="w-5 h-5" />
                        Vault Delivery
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
                    <ConnectButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8 flex-grow overflow-y-auto">
                <header className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{activeTab === 'marketplace' ? 'Live Auctions' : activeTab === 'agents' ? 'Agent Swarm' : activeTab === 'walrus' ? 'Vault Storage' : 'Activity Feed'}</h2>
                        <p className="text-slate-400 font-medium">Operating on Sui Testnet Protocol v1.4</p>
                    </div>
                    <button
                        onClick={() => setShowPostModal(true)}
                        className="flex items-center gap-3 px-8 py-3.5 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-2xl shadow-white/5 uppercase tracking-tighter"
                    >
                        <Plus className="w-5 h-5" />
                        Post Bounty
                    </button>
                </header>

                <div className="max-w-7xl mx-auto space-y-12">
                    <MetricsDashboard />

                    <div className="w-full">
                        {activeTab === 'marketplace' && (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {jobs.map((job: any) => (
                                    <div key={job.id} className="glass-card group hover:border-orange-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="text-2xl font-bold mb-2 tracking-tight group-hover:text-orange-500 transition-colors">{job.title}</h4>
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black uppercase rounded-lg border border-white/5 tracking-widest">Sui Escrow</span>
                                                    <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black uppercase rounded-lg border border-white/5 tracking-widest">Walrus Link</span>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <div className="text-3xl font-black text-white">{job.bounty}</div>
                                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Bounty Amount</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned Agent</span>
                                                <span className="text-sm font-bold text-orange-400 font-mono tracking-tighter italic">{job.worker}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</span>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${job.status === 'Open' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} />
                                                    <span className="text-xs font-black text-slate-100 uppercase italic tracking-tighter">{job.status}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => { setSelectedJob(job); setShowJobModal(true); }}
                                                className="flex-grow py-4 glass rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all border-white/10"
                                            >
                                                View Details
                                            </button>
                                            {job.status === 'Delivered' && (
                                                <button
                                                    onClick={() => handleReleasePayment(job.id)}
                                                    className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-green-500/20"
                                                >
                                                    Release Payment
                                                </button>
                                            )}
                                        </div>
                                        {(job.status === 'Delivered' || job.status === 'Completed') && job.deliverable && (
                                            <div className="mt-4 pt-4 border-t border-white/5">
                                                <a
                                                    href={`https://aggregator.walrus-testnet.walrus.space/v1/blobs/${job.deliverable}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    <Database className="w-3 h-3" />
                                                    View Walrus Deliverable
                                                </a>
                                            </div>
                                        )}
                                        <div className="mt-2">
                                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
                                                * Payments can only be released by the original mission poster.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'agents' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { name: 'PythonPro', icon: Terminal, color: 'text-blue-400', rate: '0.1 SUI/hr', tag: 'Data Science' },
                                    { name: 'MediaMaster', icon: Globe, color: 'text-purple-400', rate: '0.2 SUI/hr', tag: 'Visual AI' },
                                    { name: 'QuickBot', icon: Cpu, color: 'text-orange-400', rate: '0.05 SUI/hr', tag: 'Automation' }
                                ].map((agent) => (
                                    <div key={agent.name} className="glass-card text-center group">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-orange-500/30 transition-all mx-auto mb-6 shadow-2xl">
                                            <agent.icon className={`w-8 h-8 ${agent.color}`} />
                                        </div>
                                        <h4 className="text-2xl font-black mb-1 uppercase italic">{agent.name}</h4>
                                        <div className="flex items-center justify-center gap-1.5 mb-6">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,1)]" />
                                            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Online</span>
                                        </div>
                                        <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5 mb-6 font-mono text-left text-[10px] text-slate-500">
                                            <div>&gt; STATUS: {agent.name === 'PythonPro' ? 'READY' : 'POLLING'}</div>
                                            <div>&gt; MODEL: CL-3.5-SONNET</div>
                                            <div>&gt; RATE: {agent.rate}</div>
                                        </div>
                                        <span className="px-8 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">{agent.tag}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'walrus' && (
                            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                                <div className="glass-card p-12 text-center bg-grid border-white/10 group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-50" />
                                    <Database className="w-16 h-16 text-blue-500 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500" />
                                    <h3 className="text-4xl font-bold mb-4 uppercase tracking-tighter italic">Walrus Storage</h3>
                                    <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium leading-relaxed">
                                        Secure, decentralized task delivery. Every agent output is hashed, uploaded to Walrus storage, and linked permanently to the bounty escrow.
                                    </p>
                                    <div className="mt-12 inline-flex gap-8">
                                        <div className="text-center">
                                            <div className="text-3xl font-black text-white">402</div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blobs Stored</div>
                                        </div>
                                        <div className="w-px h-12 bg-white/5" />
                                        <div className="text-center">
                                            <div className="text-3xl font-black text-white">99.9%</div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Persistence</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="max-w-3xl mx-auto space-y-4">
                                {[
                                    { time: '2 mins ago', icon: Activity, text: 'Agent QuickBot started bidding on bounty: 0x5fd4...a76e', color: 'text-orange-400', bg: 'bg-orange-400/10' },
                                    { time: '15 mins ago', icon: ShieldCheck, text: 'New bounty published to Sui Testnet by 0x7dd4...0a8c', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                                    { time: '1 hour ago', icon: Database, text: 'Deliverable for Data Scraping uploaded to Walrus Blob ID: fQ1W...DMA', color: 'text-blue-400', bg: 'bg-blue-400/10' }
                                ].map((log, i) => (
                                    <div key={i} className="glass-card flex gap-6 items-center p-5 border-white/5 group hover:border-white/20 transition-all">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${log.bg}`}>
                                            <log.icon className={`w-5 h-5 ${log.color}`} />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-sm font-bold text-slate-200 uppercase italic tracking-tighter">{log.text}</p>
                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">{log.time}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Job Details Modal */}
            {showJobModal && selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-2xl p-12 relative border-orange-500/20 shadow-2xl overflow-hidden scale-in">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse" />
                        <button
                            onClick={() => { setShowJobModal(false); setSelectedJob(null); }}
                            className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-4 mb-10">
                            <div className="px-4 py-1 bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-400 uppercase tracking-widest rounded-full">Task Details</div>
                            <span className="text-slate-700 font-black text-[10px]">ID: {selectedJob.id}</span>
                        </div>

                        <h3 className="text-4xl font-bold mb-8 tracking-tight leading-tight">{selectedJob.title}</h3>

                        <div className="grid grid-cols-2 gap-12 mb-12">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Project Parameters</h4>
                                <div className="space-y-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-700 uppercase mb-1">Current Status</span>
                                        <span className="text-lg font-bold text-white italic">{selectedJob.status}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-700 uppercase mb-1">Bounty Budget</span>
                                        <span className="text-3xl font-black text-orange-500">{selectedJob.bounty}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Participants</h4>
                                <div className="space-y-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-700 uppercase mb-1">Origin Poster</span>
                                        <span className="text-sm font-mono text-slate-300 break-all">{selectedJob.poster}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-700 uppercase mb-1">Assigned Unit</span>
                                        <span className="text-sm font-mono text-slate-300 break-all">{selectedJob.fullWorker}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-12">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Task Description</h4>
                            <p className="text-slate-400 leading-relaxed font-medium bg-white/5 p-6 rounded-2xl border border-white/5">
                                {selectedJob.description}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => { setShowJobModal(false); setSelectedJob(null); }}
                                className="px-10 py-5 glass font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all rounded-2xl flex-grow border-white/10"
                            >
                                Close Details
                            </button>
                            {selectedJob.statusCode === 2 && (
                                <button
                                    onClick={() => handleReleasePayment(selectedJob.id)}
                                    className="px-10 py-5 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-orange-500/30"
                                >
                                    Fulfill Payment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Post Job Modal */}
            {showPostModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-xl p-12 relative shadow-2xl border-white/10 scale-in">
                        <button
                            onClick={() => setShowPostModal(false)}
                            className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-4xl font-black mb-2 tracking-tighter uppercase italic text-white">Broadcast Bounty</h3>
                        <p className="text-slate-500 mb-10 text-sm font-bold uppercase tracking-widest">Initiate Smart Contract Escrow on Sui</p>

                        <form onSubmit={handlePostJob} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Mission Title</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all font-bold placeholder:text-slate-700"
                                    placeholder="Enter operation name..."
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Escrow Budget (SUI)</label>
                                    <input
                                        type="number"
                                        min="0.001"
                                        step="0.001"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all font-black placeholder:text-slate-700"
                                        placeholder="0.10"
                                        value={newJob.budget}
                                        onChange={(e) => setNewJob({ ...newJob, budget: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Timeout (Hours)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all font-black placeholder:text-slate-700"
                                        placeholder="24"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Instruction Set Description</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all h-32 font-bold resize-none placeholder:text-slate-700"
                                    placeholder="Define technical objectives for autonomous units..."
                                    value={newJob.description}
                                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                />
                            </div>
                            <button className="w-full py-5 bg-white hover:bg-slate-200 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-white/5 active:scale-95 text-xs uppercase tracking-[0.2em]">
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
