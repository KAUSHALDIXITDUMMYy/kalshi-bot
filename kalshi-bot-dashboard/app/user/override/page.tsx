"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  Terminal, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Crosshair,
  TrendingDown,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardHeader } from "@/app/components/DashboardHeader";

export default function OverridePage() {
  return (
    <div className="flex bg-[#08080A] text-foreground min-h-screen font-display">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto h-screen scrollbar-hide">
        <DashboardHeader title="Manual Tactical Override" />
        
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Status Alert */}
          <div className="glass-card p-6 rounded-3xl border-magenta-cyber/20 bg-magenta-cyber/5 flex items-center gap-6 shadow-[0_0_30px_rgba(255,0,128,0.1)]">
            <div className="w-12 h-12 rounded-2xl bg-magenta-cyber/10 flex items-center justify-center text-magenta-cyber border border-magenta-cyber/30 shrink-0">
               <AlertCircle size={24} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-black uppercase tracking-tight text-white leading-none mb-1">Override Protocol Active</h3>
              <p className="text-[10px] font-bold text-magenta-cyber/60 uppercase tracking-widest leading-relaxed">
                Manual signals will take precedence over the pricing engine kernel. Proceed with caution.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Live RFQ Pipeline */}
            <div className="col-span-8 flex flex-col gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[40px] border-white/5 overflow-hidden shadow-2xl relative"
              >
                <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <Terminal size={20} className="text-cyan-neon" />
                      <h2 className="text-lg font-black uppercase tracking-tight text-white leading-none">Open RFQ Pipeline</h2>
                   </div>
                   <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">Scanning Exchange...</span>
                </div>
                
                <div className="p-8 space-y-4">
                   {[
                     { market: "NVDA-MAR-26", side: "YES", price: 0.44, qty: 1500, time: "42s" },
                     { market: "BTC-80K-EOM", side: "NO", price: 0.12, qty: 500, time: "18s" },
                   ].map((rfq, i) => (
                     <div key={i} className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-cyan-neon/30 transition-all flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-6">
                           <div className="flex flex-col">
                              <span className="text-xs font-black text-white/40 uppercase mb-1">{rfq.market}</span>
                              <div className="flex items-center gap-3">
                                 <span className={cn(
                                   "text-[10px] font-black px-2 py-0.5 rounded tracking-widest border",
                                   rfq.side === "YES" ? "text-cyan-neon border-cyan-neon/20 bg-cyan-neon/5" : "text-magenta-cyber border-magenta-cyber/20 bg-magenta-cyber/5"
                                 )}>{rfq.side}</span>
                                 <span className="text-lg font-black text-white">$ {rfq.price}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <button className="flex items-center gap-2 px-6 py-3 bg-white/[0.03] hover:bg-magenta-cyber/10 border border-white/5 hover:border-magenta-cyber/30 rounded-2xl text-[10px] font-black text-white/40 hover:text-magenta-cyber uppercase tracking-widest transition-all">
                              <Trash2 size={14} /> Ignore
                           </button>
                           <button className="flex items-center gap-2 px-8 py-3 bg-cyan-neon text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,245,255,0.2)] hover:scale-[1.02] transition-all">
                              <CheckCircle2 size={14} /> Accept Signal
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              </motion.div>

              {/* Active Quotes for Cancellation */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-[40px] border-white/5 overflow-hidden shadow-2xl relative"
              >
                <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <Crosshair size={20} className="text-magenta-cyber" />
                      <h2 className="text-lg font-black uppercase tracking-tight text-white leading-none">Active Quote Management</h2>
                   </div>
                   <button className="text-[10px] font-black tracking-widest text-magenta-cyber uppercase hover:underline">Flush All Quotes</button>
                </div>
                
                <div className="p-8 space-y-4">
                   {[
                     { market: "AAPL-C250", side: "YES", price: 0.88, qty: 100 },
                   ].map((quote, i) => (
                     <div key={i} className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="flex flex-col">
                              <span className="text-xs font-black text-white/40 uppercase mb-1">{quote.market}</span>
                              <span className="text-[10px] font-bold text-white text-opacity-20 uppercase tracking-[0.3em]">Live on Exchange</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-right flex flex-col mr-4">
                              <span className="text-lg font-black text-white">$ {quote.price}</span>
                              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Qty: {quote.qty}</span>
                           </div>
                           <button className="px-6 py-3 bg-magenta-cyber/10 border border-magenta-cyber/20 hover:bg-magenta-cyber text-magenta-cyber hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                              Revoke
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar Controls */}
            <div className="col-span-4 flex flex-col gap-8">
              <div className="glass-card rounded-[40px] border-white/5 p-8 space-y-10">
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 text-white/20">
                       <Zap size={18} />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Signal Matrix</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <button className="py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-cyan-neon hover:border-cyan-neon/30 transition-all">
                          Freeze RFQs
                       </button>
                       <button className="py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-magenta-cyber hover:border-magenta-cyber/30 transition-all">
                          Kill All Bids
                       </button>
                    </div>
                 </div>

                 <div className="space-y-6 pt-10 border-t border-white/5">
                    <div className="flex items-center gap-3 text-white/20">
                       <Activity size={18} />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Quick Metrics</h3>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center bg-white/[0.01] p-4 rounded-xl border border-white/5">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Signal Latency</span>
                          <span className="text-xs font-black text-cyan-neon">0.8ms</span>
                       </div>
                       <div className="flex justify-between items-center bg-white/[0.01] p-4 rounded-xl border border-white/5">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Active Threads</span>
                          <span className="text-xs font-black text-white">12</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
