"use client";

import { motion } from "framer-motion";
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ExternalLink,
  ChevronDown,
  Activity,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardHeader } from "@/app/components/DashboardHeader";

const HISTORY_DATA = [
  { id: "TX-01H2J", market: "NASDAQ100-24MAR26-T18500", type: "RFQ", side: "YES", qty: 5000, price: 0.56, status: "EXECUTED", time: "16:10:45", pnl: "+$12.50" },
  { id: "TX-01H2K", market: "BTC-USD-80K-EOM", type: "QUOTE", side: "NO", qty: 12000, price: 0.12, status: "EXPIRED", time: "16:04:12", pnl: "$0.00" },
  { id: "TX-01H2L", market: "FED-RATE-HIKE-SEP", type: "RFQ", side: "YES", qty: 1500, price: 0.88, status: "CANCELLED", time: "15:58:22", pnl: "$0.00" },
  { id: "TX-01H2M", market: "AAPL-24MAR26-C250", type: "RFQ", side: "YES", qty: 2000, price: 0.33, status: "EXECUTED", time: "15:45:01", pnl: "+$44.00" },
  { id: "TX-01H2N", market: "TSLA-24MAR26-DOWN", type: "QUOTE", side: "NO", qty: 1000, price: 0.45, status: "EXECUTED", time: "15:32:18", pnl: "-$5.20" },
  { id: "TX-01H2O", market: "SPY-24MAR26-P520", type: "RFQ", side: "YES", qty: 5000, price: 0.15, status: "EXECUTED", time: "15:20:44", pnl: "+$12.00" },
];

export default function HistoryPage() {
  return (
    <div className="flex bg-[#08080A] text-foreground min-h-screen font-display">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto h-screen scrollbar-hide">
        <DashboardHeader title="Trade Audit Log" />
        
        <div className="p-10 space-y-10 max-w-7xl mx-auto">
          {/* Filtering Header */}
          <div className="glass-card p-6 rounded-[32px] border-white/5 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  type="text" 
                  placeholder="Search by Transaction ID or Market..." 
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold text-white outline-none focus:border-cyan-neon/30 transition-all font-mono"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white/40 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest">
                <Filter size={14} /> 
                Add Filter
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-white/[0.08] hover:bg-white/[0.12] rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all">
                <Download size={14} /> 
                Export CSV
              </button>
            </div>
          </div>

          {/* Audit Table */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[40px] border-white/5 overflow-hidden shadow-2xl shadow-black/50"
          >
            <div className="px-10 py-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History size={20} className="text-white/20" />
                <h2 className="text-sm font-black uppercase tracking-tight text-white">Full Event Ledger</h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Query latency: 0.42ms</span>
            </div>
            
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-white/[0.01]">
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest">Event ID</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest">Market Entity</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest text-center">Type</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest text-center">Outcome</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest text-right">PnL Delta</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {HISTORY_DATA.map((row, i) => (
                    <tr key={i} className="group hover:bg-white/[0.01] transition-colors border-l-2 border-transparent hover:border-cyan-neon/40">
                      <td className="px-10 py-6">
                        <span className="text-xs font-black text-white/40 group-hover:text-cyan-neon transition-colors">{row.id}</span>
                        <p className="text-[9px] font-bold text-white/10 mt-1 uppercase tracking-widest">{row.time}</p>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white/80">{row.market}</span>
                          <span className={cn(
                            "text-[10px] font-black tracking-tight",
                            row.side === "YES" ? "text-cyan-neon/40" : "text-magenta-cyber/40"
                          )}>{row.side} @ {row.price.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className="text-[10px] font-black uppercase bg-white/[0.02] border border-white/5 py-1 px-3 rounded-full text-white/30 tracking-widest">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                           {row.status === "EXECUTED" ? <CheckCircle2 size={12} className="text-chart-green" /> : 
                            row.status === "CANCELLED" ? <XCircle size={12} className="text-chart-red" /> : 
                            <Clock size={12} className="text-white/20" />}
                           <span className={cn(
                             "text-[11px] font-black uppercase tracking-widest",
                             row.status === "EXECUTED" ? "text-white" : "text-white/20"
                           )}>{row.status}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className={cn(
                          "text-sm font-black",
                          row.pnl.startsWith('+') ? "text-chart-green text-glow-green" : 
                          row.pnl.startsWith('-') ? "text-chart-red text-glow-red" : "text-white/20"
                        )}>{row.pnl}</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button className="p-2 text-white/10 hover:text-white transition-colors">
                           <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-10 py-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-center">
               <div className="flex items-center gap-8">
                  <button className="text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-cyan-neon transition-colors cursor-not-allowed">Previous Page</button>
                  <div className="flex gap-2">
                     {[1, 2, 3, 4].map((p) => (
                       <button key={p} className={cn(
                         "w-8 h-8 rounded-lg text-[10px] font-black flex items-center justify-center border transition-all",
                         p === 1 ? "bg-cyan-neon border-cyan-neon/20 text-black shadow-[0_0_15px_rgba(0,245,255,0.4)]" : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white"
                       )}>{p}</button>
                     ))}
                  </div>
                  <button className="text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-cyan-neon transition-colors">Next Sequence</button>
               </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
