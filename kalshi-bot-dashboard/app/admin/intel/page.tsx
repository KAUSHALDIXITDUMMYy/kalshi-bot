"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Globe, 
  BarChart3, 
  Activity, 
  Layers, 
  Cpu, 
  Server,
  Filter,
  Download,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardHeader } from "@/app/components/DashboardHeader";

const FLEET_PERFORMANCE = [
  { label: "Total Platform Volume", value: "$1.4B", trend: "+12.4%", color: "text-magenta-cyber" },
  { label: "Active Nodes", value: "852", trend: "NOMINAL", color: "text-cyan-neon" },
  { label: "Avg Execution Latency", value: "1.2ms", trend: "-5%", color: "text-chart-green" },
  { label: "Fleet Success Rate", value: "99.8%", trend: "STABLE", color: "text-cyan-neon" },
];

const MARKET_POPULARITY = [
  { market: "Elections", volume: "$650M", nodes: 442, share: "45%", color: "bg-cyan-neon" },
  { market: "Finance", volume: "$340M", nodes: 280, share: "24%", color: "bg-magenta-cyber" },
  { market: "Weather", volume: "$120M", nodes: 90, share: "12%", color: "bg-white/10" },
  { market: "Macro", volume: "$88M", nodes: 40, share: "9%", color: "bg-white/5" },
];

export default function PlatformIntelPage() {
  return (
    <div className="flex bg-[#08080A] text-foreground min-h-screen font-display">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto h-screen scrollbar-hide">
        <DashboardHeader title="Global Platform Intelligence" />
        
        <div className="p-10 space-y-10 max-w-7xl mx-auto">
          {/* Performance HUD */}
          <div className="grid grid-cols-4 gap-4">
            {FLEET_PERFORMANCE.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 rounded-[32px] border-white/5 relative group hover:border-magenta-cyber/10 transition-all shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-white/20">
                    <Activity size={16} />
                  </div>
                  <div className={cn("text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded-full bg-white/[0.02]", stat.trend === "NOMINAL" || stat.trend === "STABLE" || stat.trend.includes('+') ? "text-cyan-neon" : "text-magenta-cyber")}>
                    {stat.trend}
                  </div>
                </div>
                <h3 className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className={cn("text-2xl font-black tracking-tight", stat.color)}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Global Volume Heatmap Placeholder */}
            <div className="col-span-8">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[40px] border-white/5 p-10 shadow-2xl relative h-[450px] overflow-hidden"
              >
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-magenta-cyber shadow-[0_0_8px_rgba(255,0,128,1)]" />
                      <h2 className="text-sm font-black uppercase tracking-widest text-white">Aggregated Fleet Volume (24H)</h2>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                         <Filter size={14} /> Filter Node Cluster
                      </button>
                      <button className="p-2 bg-white/[0.03] border border-white/5 rounded-xl text-white/20 hover:text-white transition-all">
                         <Download size={16} />
                      </button>
                   </div>
                </div>

                <div className="h-64 flex items-end gap-1.5 px-4 mb-10 overflow-hidden">
                   {[34, 55, 45, 78, 90, 65, 45, 34, 23, 45, 67, 89, 95, 80, 70, 85, 90, 100, 85, 75, 65, 55, 45, 35].map((h, i) => (
                     <div key={i} className="flex-1 bg-white/[0.02] rounded-t-lg relative group transition-all hover:bg-magenta-cyber/40" style={{ height: `${h}%` }}>
                        <div className="absolute inset-x-0 top-0 h-1 bg-magenta-cyber shadow-[0_0_10px_magenta] rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                   ))}
                </div>
                
                <div className="flex justify-between items-center text-[9px] font-black text-white/10 uppercase tracking-[0.4em] px-4 font-mono">
                  <span>00:00 UTC</span>
                  <span>06:00</span>
                  <span className="text-magenta-cyber/40 italic">Global Volume Peak: $44.2M / HR</span>
                  <span>18:00</span>
                  <span>23:59</span>
                </div>
              </motion.div>
            </div>

            {/* Market Concentration Insights */}
            <div className="col-span-4 flex flex-col gap-8">
              <div className="glass-card rounded-[40px] border-white/5 p-8 flex flex-col gap-8 shadow-2xl h-full">
                 <div className="flex items-center gap-3">
                    <Globe size={18} className="text-cyan-neon" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic leading-none">Fleet Market Penetration</h3>
                 </div>
                 <div className="flex-1 flex flex-col justify-center gap-8">
                    {MARKET_POPULARITY.map((market, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between items-baseline text-[9px] font-black uppercase tracking-widest leading-none">
                          <span className="text-white/60">{market.market} Markets</span>
                          <span className="text-magenta-cyber">{market.share}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: market.share }} className={cn("h-full shadow-[0_0_10px_rgba(255,255,255,0.1)]", market.color)} />
                        </div>
                        <div className="flex justify-between items-center text-[8px] font-bold text-white/10 tracking-widest lowercase italic">
                          <span>{market.nodes} active nodes</span>
                          <span>Vol: {market.volume}</span>
                        </div>
                      </div>
                    ))}
                 </div>
                 <button className="w-full py-4 bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-neon/30 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-cyan-neon transition-all">
                    Generate Cluster Report
                 </button>
              </div>
            </div>
          </div>

          {/* Node Health Heatmap Section */}
          <div className="grid grid-cols-12 gap-8">
             <div className="col-span-12 glass-card rounded-[40px] border-white/5 p-10 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-cyan-neon/5 opacity-0 group-hover:opacity-100 transition-opacity blur-[100px]" />
                <div className="flex items-center gap-10">
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 text-white">
                         <Server size={20} className="text-cyan-neon" />
                         <h3 className="text-lg font-black uppercase tracking-tight italic leading-none">Cluster Health Index</h3>
                      </div>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest max-w-sm leading-relaxed mt-2">Aggregated monitoring across all user nodes for latency and API synchronization status.</p>
                   </div>
                   <div className="h-12 w-px bg-white/5" />
                   <div className="flex gap-4">
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-1">Rest API Status</span>
                         <span className="text-sm font-black text-chart-green uppercase">99.9% Optimal</span>
                      </div>
                      <div className="flex flex-col ml-6">
                         <span className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-1">WebSocket Mesh</span>
                         <span className="text-sm font-black text-magenta-cyber uppercase">12 Nodes Alerting</span>
                      </div>
                   </div>
                </div>
                <button className="px-8 py-4 bg-white/[0.03] border border-white/10 hover:border-cyan-neon/40 hover:bg-cyan-neon/5 text-white/40 hover:text-cyan-neon rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all relative z-10">
                   Open Health Matrix
                </button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
