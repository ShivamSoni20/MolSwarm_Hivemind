"use client"
import React, { useState, useEffect } from 'react';

const HeroMetrics: React.FC = () => {
  const [paymentsFired, setPaymentsFired] = useState(0);
  const [sbtcEarned, setSbtcEarned] = useState(0.0125);
  const [usdcxEarned, setUsdcxEarned] = useState(140.50);

  useEffect(() => {
    let ws: WebSocket;
    const connectWS = () => {
      ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080');
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "payment") {
            setPaymentsFired(prev => prev + 1);
            if (data.token === 'sBTC') setSbtcEarned(prev => prev + data.amount);
            if (data.token === 'USDCx') setUsdcxEarned(prev => prev + data.amount);
          }
        } catch (e) {}
      };
      ws.onclose = () => setTimeout(connectWS, 3000);
    };
    connectWS();
    return () => { if (ws) ws.close(); };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl mx-auto mt-12 mb-16 px-4">
      {/* ZERO HUMAN INTERVENTION METRIC */}
      <div className="flex flex-col items-center justify-center bg-black/60 p-6 rounded-2xl border-2 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)] backdrop-blur-md group hover:border-red-500/50 transition-all cursor-default">
        <span className="text-sm font-bold tracking-widest text-red-400 uppercase mb-2">Human Action Required</span>
        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-rose-700 drop-shadow-sm group-hover:scale-110 transition-transform">0</span>
      </div>

      <div className="flex flex-col items-center justify-center bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur">
        <span className="text-sm text-gray-400 uppercase tracking-widest mb-2 font-semibold">x402 Payments Fired</span>
        <span className="text-4xl font-mono text-white animate-pulse">{paymentsFired}</span>
      </div>

      <div className="flex flex-col items-center justify-center bg-black/40 p-6 rounded-2xl border border-[#ff9900]/20 hover:border-[#ff9900]/40 backdrop-blur transition-colors">
        <span className="text-sm text-[#ff9900]/70 uppercase tracking-widest mb-2 font-bold">Total sBTC Earned</span>
        <span className="text-4xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
          {sbtcEarned.toFixed(4)}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center bg-black/40 p-6 rounded-2xl border border-[#2775ca]/20 hover:border-[#2775ca]/40 backdrop-blur transition-colors">
        <span className="text-sm text-[#2775ca]/70 uppercase tracking-widest mb-2 font-bold">Total USDCx Earned</span>
        <span className="text-4xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          {usdcxEarned.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default HeroMetrics;
