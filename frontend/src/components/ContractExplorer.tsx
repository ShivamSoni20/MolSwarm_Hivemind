"use client"
import React, { useState, useEffect } from 'react';
import { getOpenJobs, subscribeToContractEvents, CONTRACTS } from '../utils/stacks-api';

const ContractExplorer: React.FC = () => {
  const [openJobs, setOpenJobs] = useState(0);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const jobs = await getOpenJobs();
      setOpenJobs(jobs.length);
    };
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);

    const cleanup = subscribeToContractEvents(CONTRACTS.JOB_REGISTRY.split('.')[0], (event: any) => {
        setEvents(prev => [{
            txid: event.tx_id,
            name: event.tx_type,
            time: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 5));
    });

    return () => { clearInterval(interval); cleanup(); };
  }, []);

  return (
    <div className="bg-black/50 border border-white/5 rounded-xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl group">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Clarity State Explorer
        </h3>
        <span className="text-xs tracking-widest text-[#ff6a00] uppercase opacity-70 border border-[#ff6a00]/30 px-3 py-1 rounded-full">
          Stacks Testnet
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-sm text-gray-400 uppercase tracking-wide">Open Jobs in Escrow</span>
          <span className="text-3xl font-mono text-white mt-2">{openJobs}</span>
        </div>
        <div className="bg-white/5 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-sm text-gray-400 uppercase tracking-wide">Active Agent Bids</span>
          <span className="text-3xl font-mono text-white mt-2">{openJobs * 2}</span>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-4 cursor-pointer hover:bg-white/5 rounded transition-all">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Latest Intercepts</h4>
        <div className="flex flex-col gap-2">
          {events.map((ev, i) => (
             <a key={i} href={`https://explorer.hiro.so/txid/${ev.txid}?chain=testnet`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
               <span className="font-mono text-blue-400 text-sm overflow-hidden text-ellipsis whitespace-nowrap">{ev.txid.substring(0,10)}... &gt; tx</span>
               <span className="text-xs text-gray-500">explorer ↗</span>
             </a>
          ))}
          {events.length === 0 && <span className="text-xs text-slate-500">Listening to Testnet mempool...</span>}
        </div>
      </div>
    </div>
  );
};

export default ContractExplorer;
