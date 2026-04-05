"use client";

import { motion } from "framer-motion";
import { 
  Activity, 
  BarChart3, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Crosshair,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardHeader } from "@/app/components/DashboardHeader";

const ORDER_BOOK = [
  { price: 0.82, qty: 1450, total: 1450, side: "ASK", heat: 85 },
  { price: 0.81, qty: 890, total: 2340, side: "ASK", heat: 60 },
  { price: 0.80, qty: 450, total: 2790, side: "ASK", heat: 30 },
  { price: 0.79, qty: 120, total: 2910, side: "ASK", heat: 10 },
  // Spread
  { price: 0.77, qty: 440, total: 440, side: "BID", heat: 35 },
  { price: 0.76, qty: 620, total: 1060, side: "BID", heat: 50 },
  { price: 0.75, qty: 1100, total: 2160, side: "BID", heat: 75 },
  { price: 0.74, qty: 2400, total: 4560, side: "BID", heat: 95 },
];

const RECENT_TICKS = [
  { price: 0.78, qty: 50, time: "16:10:45", side: "YES" },
  { price: 0.78, qty: 120, time: "16:10:42", side: "YES" },
  { price: 0.79, qty: 15, time: "16:10:38", side: "NO" },
];

export default function LiveBidsPage() {
  return (
    <div className="flex bg-[#08080A] text-foreground min-h-screen font-display">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto h-screen scrollbar-hide">
        <DashboardHeader title="Live Market Depth" />
        
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Market Selection Bar */}
          <div className="flex items-center justify-between glass-card p-6 rounded-3xl border-white/5">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Active Market</span>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <h2 className="text-xl font-black text-white group-hover:text-cyan-neon transition-colors">AAPL-24MAR26-C250</h2>
                  <ChevronDown size={18} className="text-white/20 group-hover:text-cyan-neon" />
                </div>
              </div>
              <div className="h-10 w-px bg-white/5" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Last Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-mono font-black text-cyan-neon">0.78</span>
                  <span className="text-[10px] font-bold text-chart-green flex items-center gap-0.5">
                    <ArrowUpRight size={10} /> +1.2%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  type="text" 
                  placeholder="Scan symbols..." 
                  className="bg-white/[0.03] border border-white/5 rounded-full py-2.5 pl-10 pr-6 text-sm font-bold text-white outline-none focus:border-cyan-neon/30 transition-all w-64"
                />
              </div>
              <button className="p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:text-cyan-neon transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Tactical Order Book Ladder */}
            <div className="col-span-7">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[32px] border-white/5 overflow-hidden shadow-2xl relative"
              >
                <div className="px-8 py-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 size={18} className="text-magenta-cyber" />
                    <h2 className="text-sm font-black uppercase tracking-tight text-white">Market Depth Ladder</h2>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-magenta-cyber" />
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">Asks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-neon" />
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">Bids</span>
                    </div>
                  </div>
                </div>

                <div className="p-0 font-mono">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.01]">
                      <tr>
                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 tracking-widest">Price Point</th>
                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 tracking-widest text-right">Size Intensity</th>
                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 tracking-widest text-right">Cumulative QTY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {ORDER_BOOK.map((row, i) => (
                        <tr key={i} className="group relative transition-all hover:bg-white/[0.03]">
                          <td className="px-8 py-4 relative z-10">
                            <span className={cn(
                              "text-sm font-black",
                              row.side === "ASK" ? "text-magenta-cyber/60" : "text-cyan-neon/60"
                            )}>
                              {row.price.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-right relative min-w-[200px]">
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 h-4 rounded-sm border border-white/5 overflow-hidden w-40 bg-white/[0.02]">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${row.heat}%` }}
                                className={cn(
                                  "h-full",
                                  row.side === "ASK" ? "bg-magenta-cyber/30" : "bg-cyan-neon/30"
                                )}
                              />
                            </div>
                            <span className="relative z-10 text-xs font-bold text-white mr-44">{row.qty}</span>
                          </td>
                          <td className="px-8 py-4 text-right relative z-10">
                            <span className="text-xs text-white/40">{row.total}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tactical Overlays */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-14 bg-white/[0.01] border-y border-white/5 pointer-events-none flex items-center justify-center">
                  <div className="px-4 py-1.5 rounded-full glass-card border-white/10 backdrop-blur-3xl flex items-center gap-3">
                    <Crosshair size={12} className="text-white/40" />
                    <span className="text-[10px] font-black tracking-[0.3em] text-white/60 uppercase italic">Spread: 0.02 pts</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Price Action & Tape */}
            <div className="col-span-5 flex flex-col gap-8">
              {/* Micro Price Chart Placeholder */}
              <div className="glass-card rounded-[32px] border-white/5 p-8 flex flex-col gap-8 flex-1">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Market Volatility</h3>
                    <div className="p-1 px-2 rounded-md bg-cyan-neon/10 border border-cyan-neon/20 text-cyan-neon text-[8px] font-black uppercase tracking-widest">Live Flow</div>
                 </div>
                 <div className="flex-1 flex items-end gap-1.5 px-2">
                    {[50, 45, 60, 55, 78, 65, 45, 80, 70, 85, 90, 80, 75, 60, 55].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/[0.03] rounded-t-sm relative group hover:bg-cyan-neon/40 transition-all" style={{ height: `${h}%` }}>
                        <div className="absolute inset-0 bg-cyan-neon opacity-0 group-hover:opacity-100 transition-opacity blur-[5px]" />
                      </div>
                    ))}
                 </div>
              </div>

              {/* Tape / Recent Fills */}
              <div className="glass-card rounded-[32px] border-white/5 overflow-hidden flex flex-col min-h-[350px]">
                <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                   <div className="flex items-center gap-3">
                    <Activity size={16} className="text-white/20" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Live Tape Scan</h2>
                  </div>
                </div>
                <div className="p-8 space-y-6 overflow-y-auto font-mono scrollbar-hide">
                  {RECENT_TICKS.map((tick, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">{tick.time}</span>
                        <span className={cn(
                          "text-[10px] font-black tracking-tight",
                          tick.side === "YES" ? "text-cyan-neon" : "text-magenta-cyber"
                        )}>
                          {tick.side} FILLED
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-white/80">{tick.qty}</span>
                        <span className="text-[10px] font-bold text-white/20">@ {tick.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
