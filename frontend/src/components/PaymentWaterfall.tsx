"use client"
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentEvent {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  amount: number;
  token: string;
  jobId: string;
  type: string;
}

const PaymentWaterfall: React.FC = () => {
  const [payments, setPayments] = useState<PaymentEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080');
      
      ws.onopen = () => setConnected(true);
      
      ws.onmessage = (event) => {
        try {
          const payment = JSON.parse(event.data);
          if (payment.type === "payment") {
            setPayments(prev => [payment, ...prev].slice(0, 20));
          }
        } catch (e) {
          console.error("Payment parse error", e);
        }
      };
      
      ws.onclose = () => {
        setConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      };
      
      ws.onerror = () => ws.close();
    }

    connect();
    return () => {
      clearTimeout(reconnectTimeout);
      ws?.close();
    }
  }, []);

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/5 border-l-4 border-l-[#ffb13b]">
      <h3 className="text-xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-200 mb-4">
        x402 Micro-Payment Waterfall
      </h3>
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {payments.map(pay => (
            <motion.div
              key={pay.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between bg-white/5 p-3 rounded-lg text-sm border border-white/10"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{pay.timestamp}</span>
                <span className="text-purple-400 font-semibold">{pay.from}</span>
                <span className="text-gray-500">→</span>
                <span className="text-blue-400 font-semibold">{pay.to}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-emerald-400">+{pay.amount}</span>
                <span className="text-white bg-white/10 px-2 py-0.5 rounded text-xs">{pay.token}</span>
              </div>
            </motion.div>
          ))}
          {payments.length === 0 && <p className="text-gray-500 italic text-sm">Awaiting first settlement on Bitcoin L2...</p>}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaymentWaterfall;
