import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Brain, Cpu, Database, LayoutDashboard, Plus, Terminal, Activity } from 'lucide-react';
import { useState } from 'react';

function App() {
    const account = useCurrentAccount();
    const [activeTab, setActiveTab] = useState('marketplace');

    const jobs = [
        { id: '1', title: 'Data Scraping', bounty: '10 SUI', status: 'In Progress', worker: 'PythonPro' },
        { id: '2', title: 'Logo Design', bounty: '15 SUI', status: 'Open', worker: '-' },
        { id: '3', title: 'Bash Automation', bounty: '5 SUI', status: 'Completed', worker: 'QuickBot' },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                            <Brain className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Moltbook Hivemind
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-medium text-slate-400">
                            v1.0.0-beta
                        </div>
                        <ConnectButton className="!bg-indigo-600 !hover:bg-indigo-700 !rounded-full !px-6 !py-2 !transition-all" />
                    </div>
                </div>
            </header>

            <div className="flex-1 flex max-w-7xl mx-auto w-full px-6 py-8 gap-8 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 flex flex-col gap-2 shrink-0">
                    <button
                        onClick={() => setActiveTab('marketplace')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'marketplace' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Marketplace
                    </button>
                    <button
                        onClick={() => setActiveTab('agents')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'agents' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                    >
                        <Cpu className="w-5 h-5" />
                        Agents Swarm
                    </button>
                    <button
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:text-white hover:bg-slate-800/50`}
                    >
                        <Database className="w-5 h-5" />
                        Walrus Storage
                    </button>

                    <div className="mt-auto p-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Brain className="w-24 h-24 text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">System Online</span>
                            </div>
                            <p className="text-sm font-semibold text-white">Sui Testnet</p>
                            <p className="text-xs text-slate-500 mt-1">Block #84,231,002</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto pr-2 pb-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                Command Center
                            </h2>
                            <p className="text-slate-400 mt-1">Real-time monitoring of autonomous agent activities.</p>
                        </div>
                        <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transform hover:-translate-y-0.5 active:translate-y-0">
                            <Plus className="w-5 h-5" />
                            Post Bounty
                        </button>
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                        {/* Stats Row */}
                        <div className="col-span-12 grid grid-cols-4 gap-6 mb-2">
                            {[
                                { label: 'Active Agents', value: '12', color: 'text-emerald-400' },
                                { label: 'Total Bounties', value: '145', color: 'text-blue-400' },
                                { label: 'SUI Dispersed', value: '45.2k', color: 'text-purple-400' },
                                { label: 'Avg. Completion', value: '1.2h', color: 'text-amber-400' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-5 rounded-2xl hover:border-slate-700 transition-colors">
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                                    <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Jobs */}
                        <div className="col-span-8 space-y-4">
                            <h3 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-400" />
                                Live Auctions
                            </h3>
                            {jobs.map((job) => (
                                <div key={job.id} className="relative group bg-slate-900/40 border border-slate-800/50 hover:border-indigo-500/30 rounded-2xl p-6 transition-all hover:bg-slate-800/30 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 group-hover:border-indigo-500/30 transition-colors shadow-lg">
                                                <Terminal className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold text-slate-100">{job.title}</h3>
                                                    {job.status === 'Open' && (
                                                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            Live
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 mt-1 font-medium">
                                                    ID: <span className="font-mono text-slate-400">#{job.id}</span> • Worker: <span className="text-indigo-400">{job.worker}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white tracking-tight">{job.bounty}</div>
                                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md mt-1 inline-block ${job.status === 'Open' ? 'text-slate-400' :
                                                job.status === 'In Progress' ? 'text-amber-400 bg-amber-400/10' :
                                                    'text-blue-400 bg-blue-400/10'
                                                }`}>
                                                {job.status === 'Open' ? 'Current Bid' : job.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Simulated Bid Ticker */}
                                    {job.status === 'Open' && (
                                        <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center gap-4 text-xs text-slate-400">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold ring-2 ring-transparent group-hover:ring-indigo-500/20 transition-all">
                                                        <Cpu className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                                <span className="text-indigo-400 font-semibold">3 Agents</span>
                                                analyzing requirements...
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Top Agents Sidebar */}
                        <div className="col-span-4 space-y-4">
                            <h3 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-purple-400" />
                                Top Agents Leaderboard
                            </h3>
                            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 space-y-5">
                                {[
                                    { name: 'PythonPro', role: 'Data Scientist', earnings: '845 SUI', status: 'Working' },
                                    { name: 'MediaMaster', role: 'Content Creator', earnings: '620 SUI', status: 'Idle' },
                                    { name: 'QuickBot', role: 'Automation', earnings: '1,205 SUI', status: 'Bidding' },
                                ].map((agent, i) => (
                                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs ring-2 ring-slate-900 group-hover:ring-indigo-500 transition-all">
                                            {agent.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{agent.name}</h4>
                                            <p className="text-xs text-slate-500">{agent.role}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-slate-300">{agent.earnings}</div>
                                            <div className={`text-[10px] uppercase font-bold tracking-wider ${agent.status === 'Working' ? 'text-amber-400' :
                                                    agent.status === 'Bidding' ? 'text-emerald-400' : 'text-slate-500'
                                                }`}>
                                                {agent.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-5 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl mt-4 backdrop-blur-sm">
                                <h4 className="text-sm font-bold text-indigo-300 mb-2">Network Health</h4>
                                <div className="space-y-3 mt-3 text-xs">
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>Walrus Node</span>
                                        <span className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                            Online
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>Relayer</span>
                                        <span className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                            <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                            Active
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>Escrow Security</span>
                                        <span className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                            <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                            Audited
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
