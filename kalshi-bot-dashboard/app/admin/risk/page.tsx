"use client";

import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Zap, 
  Layers, 
  BarChart, 
  Activity, 
  Crosshair,
  Lock,
  ArrowUpRight,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardHeader } from "@/app/components/DashboardHeader";

const GLOBAL_EXPOSURE = [
  { market: "Election-Nov24", exposure: "$4.1M", risk: "HIGH", color: "text-magenta-cyber", share: "52%" },
  { market: "Fed-Interest-Rate", exposure: "$1.2M", risk: "LOW", color: "text-cyan-neon", share: "15%" },
  { market: "BTC-Spot", exposure: "$850k", risk: "MEDIUM", color: "text-white/40", share: "11%" },
  { market: "S&P500-EOM", exposure: "$620k", risk: "LOW", color: "text-cyan-neon", share: "8%" },
];

export default function GlobalRiskPage() {
  return (
    <div className="flex bg-[#08080A] text-foreground min-h-screen font-display">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto h-screen scrollbar-hide">
        <DashboardHeader title="Global Risk Intelligence" />
        
        <div className="p-10 space-y-10 max-w-7xl mx-auto">
          {/* Performance HUD */}
          <div className="glass-card p-8 rounded-[40px] border-magenta-cyber/20 bg-magenta-cyber/5 flex items-center justify-between shadow-[0_0_40px_rgba(255,0,128,0.1)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-magenta-cyber opacity-0 group-hover:opacity-10 transition-opacity blur-[50px]" />
            <div className="flex items-center gap-8 relative z-10">
               <div className="w-16 h-16 rounded-3xl bg-magenta-cyber/20 flex items-center justify-center text-magenta-cyber border border-magenta-cyber/40 shrink-0">
                  <ShieldAlert size={32} className="animate-pulse" />
               </div>
               <div className="flex flex-col">
                 <h3 className="text-xl font-black uppercase tracking-tight text-white leading-none mb-2 italic">Platform Concentration Alert</h3>
                 <p className="text-xs font-bold text-magenta-cyber/60 uppercase tracking-widest leading-relaxed max-w-md">
                   Elevated exposure detected in "Election-Nov24" markets. Concentration ratio exceeds threshold (52%). Monitoring fleet behavior for anomalous PnL deviations.
                 </p>
               </div>
            </div>
            <button className="px-10 py-4 bg-magenta-cyber text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(255,0,128,0.4)] hover:scale-[1.02] transition-all relative z-10 group-hover:shadow-magenta-cyber/50">
               Resolve All Conflicts
            </button>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Exposure Breakdown */}
            <div className="col-span-8 flex flex-col gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[40px] border-white/5 overflow-hidden shadow-2xl relative"
              >
                 <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                       <BarChart size={20} className="text-cyan-neon" />
                       <h2 className="text-lg font-black uppercase tracking-tight text-white leading-none italic">Asset Risk Exposure</h2>
                    </div>
                 </div>

                 <div className="p-0 font-mono">
                    <table className="w-full text-left">
                       <thead>
                         <tr className="bg-white/[0.01]">
                            <th className="px-10 py-6 text-[10px] font-black uppercase text-white/20 tracking-widest italic">Market Focus</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase text-white/20 tracking-widest text-center">Concentration</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase text-white/20 tracking-widest text-center">Net Exposure</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase text-white/20 tracking-widest text-right italic">Risk Rating</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                         {GLOBAL_EXPOSURE.map((row, i) => (
                           <tr key={i} className="group hover:bg-white/[0.01] transition-colors">
                              <td className="px-10 py-8">
                                 <span className="text-sm font-black text-white/80">{row.market}</span>
                              </td>
                              <td className="px-10 py-8 text-center">
                                 <div className="flex flex-col items-center gap-1.5">
                                    <span className="text-[10px] font-black text-white">{row.share}</span>
                                    <div className="w-20 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                       <motion.div initial={{ width: 0 }} animate={{ width: row.share }} className={cn("h-full", row.risk === 'HIGH' ? "bg-magenta-cyber" : "bg-cyan-neon/60")} />
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-center text-sm font-black text-white italic">
                                 {row.exposure}
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <span className={cn(
                                   "px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest",
                                   row.risk === 'HIGH' ? "text-magenta-cyber border-magenta-cyber/20 bg-magenta-cyber/5 shadow-[0_0_15px_rgba(255,0,128,0.1)]" : "text-cyan-neon border-cyan-neon/20 bg-cyan-neon/5"
                                 )}>{row.risk} LEVEL</span>
                              </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>

              {/* Anomaly Real-time Stream */}
              <div className="glass-card rounded-[40px] border-white/5 overflow-hidden flex flex-col shadow-2xl">
                 <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Zap size={18} className="text-magenta-cyber" />
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Global Anomaly Scanner</h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-cyan-neon animate-pulse" />
                       <span className="text-[9px] font-black tracking-widest text-white/20 uppercase">Live Intercept</span>
                    </div>
                 </div>
                 <div className="p-8 space-y-6 font-mono overflow-y-auto max-h-[300px] scrollbar-hide">
                    {[
                      { msg: "Node UID-8012 exhibiting non-linear PnL growth.", type: "PnL_DRIFT", time: "17:04:12" },
                      { msg: "Cluster rejection threshold exceeded on NVDA-MAR-26.", type: "CLUSTER_FAILURE", time: "16:58:33" },
                      { msg: "Unauthorized kernel modification detected on Edge_Node_02.", type: "SEC_BREACH", time: "16:42:15" },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between group border-l-2 border-white/5 pl-4 hover:border-magenta-cyber transition-all">
                         <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                               <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">{log.time}</span>
                               <span className="text-[10px] font-black text-magenta-cyber uppercase tracking-tight">{log.type}</span>
                            </div>
                            <p className="text-xs font-bold text-white/60 leading-relaxed uppercase">{log.msg}</p>
                         </div>
                         <button className="p-2 text-white/10 hover:text-white transition-colors">
                            <MoreVertical size={16} />
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Platform Control Center */}
            <div className="col-span-4 flex flex-col gap-8">
              <div className="glass-card rounded-[40px] border-white/5 p-8 flex flex-col gap-10 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <AlertTriangle size={150} className="text-magenta-cyber" />
                 </div>
                 <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3 italic">
                       <Crosshair size={18} className="text-white/40" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">Security Override Matrix</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                       {[
                         { label: "Enable Circuit Breakers", icon: Zap, color: "text-cyan-neon" },
                         { label: "Flush Fleet Memory", icon: Activity, color: "text-white/40" },
                         { label: "Lock API Credentials", icon: Lock, color: "text-magenta-cyber" },
                       ].map((action) => (
                         <button key={action.label} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.04] group text-left">
                            <div className="flex items-center gap-4">
                               <action.icon size={16} className={cn("transition-transform group-hover:scale-110", action.color)} />
                               <span className="text-[11px] font-black uppercase tracking-widest text-white/80">{action.label}</span>
                            </div>
                            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20" />
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="pt-10 border-t border-white/5 space-y-6 relative z-10">
                    <div className="flex items-center gap-3 italic">
                       <Layers size={18} className="text-white/40" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">Cluster Risk Profile</h3>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 space-y-6">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Entropy Alpha</span>
                          <span className="text-sm font-black text-chart-green italic">v1.2 Secure</span>
                       </div>
                       <div className="w-full h-20 flex items-end gap-1 px-1">
                          {[30, 45, 60, 45, 30, 25, 40, 55, 60, 45, 35, 50, 40, 30, 45].map((h, i) => (
                            <div key={i} className="flex-1 bg-magenta-cyber/20 rounded-t-sm" style={{ height: `${h}%` }} />
                          ))}
                       </div>
                       <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed text-center italic">Market entropy remains within 1.2σ boundary fleet-wide.</p>
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
