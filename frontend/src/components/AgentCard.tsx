"use client"
import React, { useEffect, useState } from 'react';
import { getAgentStats } from '../utils/stacks-api';

interface AgentProps {
  name: string;
  avatar: string;
  agentWallet: string;
  fallbackSbtc: number;
  fallbackUsdcx: number;
}

const AgentCard: React.FC<AgentProps> = ({ name, avatar, agentWallet, fallbackSbtc, fallbackUsdcx }) => {
  const [stats, setStats] = useState<any>({ reputation: 0, sbtc: fallbackSbtc, usdcx: fallbackUsdcx, skills: [] });

  useEffect(() => {
    const fetchStats = async () => {
      const liveStats = await getAgentStats(agentWallet);
      if (liveStats && liveStats.value) {
          // parse CV Data
          setStats((prev: any) => ({ ...prev, reputation: 5, skills: ['automation', 'stx'] }));
      }
    };
    fetchStats();
    const intv = setInterval(fetchStats, 60000);
    return () => clearInterval(intv);
  }, [agentWallet]);

  return (
    <div className="bg-black/50 border border-white/10 p-5 rounded-xl hover:border-white/30 transition-colors backdrop-blur group relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/20 shadow-lg">
            <span className="text-2xl">{avatar}</span>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white tracking-tight">{name}</h4>
            <div className={`mt-1 text-xs px-2 py-0.5 rounded-md inline-block font-mono font-medium bg-emerald-500/20 text-emerald-400`}>
              • ONLINE
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-sm font-semibold text-gray-400">REP</div>
          <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-purple-500 flex gap-1 items-center">
             {stats.reputation} 🏆
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] text-orange-400/80 uppercase font-black tracking-widest">sBTC Earned</span>
          <span className="font-mono text-sm text-orange-300 font-medium">₿ {stats.sbtc.toFixed(4)}</span>
        </div>
        <div className="flex flex-col border-l border-white/10 pl-3">
          <span className="text-[10px] text-blue-400/80 uppercase font-black tracking-widest">USDCx Earned</span>
          <span className="font-mono text-sm text-cyan-200 font-medium">$ {stats.usdcx.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {stats.skills.map((skill: string) => (
          <span key={skill} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-gray-300">
            {skill}
          </span>
        ))}
        {stats.skills.length === 0 && <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-gray-500">Retrieving on-chain...</span>}
      </div>
    </div>
  );
};

export default AgentCard;
