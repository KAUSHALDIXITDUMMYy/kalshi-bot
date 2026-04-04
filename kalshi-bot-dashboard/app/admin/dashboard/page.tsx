"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Cpu, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Globe, 
  Search, 
  ShieldCheck, 
  History,
  Zap,
  Server,
  Layers,
  MoreVertical,
  ArrowRight,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardHeader } from "@/app/components/DashboardHeader";

const FLEET_STATS = [
  { label: "Total Operators", value: "142", trend: "+14", color: "text-cyan-neon", icon: Users },
  { label: "Active Bot Fleet", value: "85", trend: "Normal", color: "text-cyan-neon", icon: Cpu },
  { label: "Fleet Volume 24h", value: "$1.4M", trend: "-2.4%", color: "text-magenta-cyber", icon: Activity },
  { label: "System Health", value: "NOMINAL", trend: "Stable", color: "text-chart-green", icon: Server },
];

const OPERATORS = [
  { name: "Alpha_Node_1", status: "ACTIVE", bots: 3, volume: "$450k", risk: "Low", lastActive: "Just now" },
  { name: "Bravo_Node_5", status: "ACTIVE", bots: 1, volume: "$120k", risk: "Med", lastActive: "2m ago" },
  { name: "Charlie_Trader", status: "STDBY", bots: 0, volume: "$88k", risk: "Low", lastActive: "14m ago" },
  { name: "Delta_QuantX", status: "ALERT", bots: 12, volume: "$2.1M", risk: "High", lastActive: "Just now" },
  { name: "Echo_Sector_9", status: "ACTIVE", bots: 5, volume: "$340k", risk: "Low", lastActive: "5s ago" },
];

const GLOBAL_FEED = [
  { operator: "Delta_QuantX", type: "FILL", market: "AAPL-SEP-C250", val: "$14.5k", time: "14:45:01" },
  { operator: "Alpha_Node_1", type: "QUOTE", market: "FED-HIKE-DEC", val: "$2.1k", time: "14:44:59" },
  { operator: "Echo_Sector_9", type: "CANCEL", market: "SPY-PUT", val: "$0", time: "14:44:12" },
  { operator: "Bravo_Node_5", type: "FILL", market: "BTC-80K-EOM", val: "$5.8k", time: "14:44:05" },
];

export default function AdminDashboard() {
  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Sidebar />
      
      <main className="flex-1 relative">
        <DashboardHeader title="Command Control" />
        
        <div className="p-10 space-y-10">
          {/* Fleet Stats */}
          <div className="grid grid-cols-4 gap-6">
            {FLEET_STATS.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl border border-white/5 relative group hover:border-cyan-neon/20 transition-all shadow-2xl "
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-xl bg-white/[0.03] border border-white/5", stat.color)}>
                    <stat.icon size={20} />
                  </div>
                  <div className={cn("text-[10px] font-black tracking-widest uppercase", stat.trend === "Normal" || stat.trend === "Stable" || stat.trend.includes('+') ? "text-cyan-neon" : "text-magenta-cyber")}>
                    {stat.trend}
                  </div>
                </div>
                
                <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-3xl font-black tracking-tight text-white mb-2">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Operator Monitoring */}
            <div className="col-span-8 space-y-8">
              <div className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <Globe size={20} className="text-cyan-neon" />
                    <h2 className="text-lg font-black uppercase tracking-tight text-white">Global Operator Monitoring</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                      <input type="text" placeholder="Filter node..." className="bg-white/[0.03] border border-white/5 rounded-lg py-1.5 pl-9 pr-4 text-[10px] font-bold text-white outline-none focus:border-cyan-neon/30" />
                    </div>
                    <button className="p-2 bg-white/[0.03] border border-white/5 rounded-lg hover:text-cyan-neon transition-colors">
                      <Settings size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="p-0">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/[0.01]">
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-white/30 tracking-widest">Operator Node</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-white/30 tracking-widest">Fleet Status</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-white/30 tracking-widest text-center">Active Bots</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-white/30 tracking-widest text-center">Volume</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-white/30 tracking-widest text-center">Risk Index</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-white/30 tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {OPERATORS.map((op, i) => (
                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                          <td className="px-8 py-6 flex items-center gap-3 font-bold text-white text-sm">
                            <span className={cn("w-1.5 h-1.5 rounded-full", op.status === "ACTIVE" ? "bg-cyan-neon animate-pulse shadow-[0_0_5px_cyan]" : op.status === "ALERT" ? "bg-magenta-cyber animate-bounce" : "bg-neutral-600")} />
                            {op.name}
                          </td>
                          <td className="px-8 py-6 italic text-white/40 text-xs font-mono">{op.status}</td>
                          <td className="px-8 py-6 text-center font-bold text-white text-sm">{op.bots}</td>
                          <td className="px-8 py-6 text-center font-bold text-white text-sm">{op.volume}</td>
                          <td className="px-8 py-6 text-center">
                            <span className={cn(
                              "px-2.5 py-1 rounded text-[10px] font-black tracking-widest uppercase",
                              op.risk === "Low" ? "bg-chart-green/10 text-chart-green border border-chart-green/20" : op.risk === "Med" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-chart-red/10 text-chart-red border border-chart-red/20 shadow-[0_0_10px_red]"
                            )}>{op.risk}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="p-2 text-white/20 hover:text-white transition-colors">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Heatmap / Aggregation Placeholder */}
              <div className="grid grid-cols-2 gap-8">
                <div className="glass-card rounded-3xl border border-white/5 p-8 flex flex-col gap-6 ">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-tight text-white">API Load Index</h3>
                    <Layers size={14} className="text-white/20" />
                  </div>
                  <div className="h-40 flex items-end gap-1.5 px-2">
                    {[34, 55, 45, 78, 90, 65, 45, 34, 23, 45, 67, 89].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/[0.05] rounded-t-sm relative group transition-all hover:bg-cyan-neon/40 hover:scale-110" style={{ height: `${h}%` }}>
                        <div className="absolute inset-0 bg-cyan-neon opacity-0 group-hover:opacity-100 transition-opacity blur-[8px]" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>00:00</span>
                  </div>
                </div>

                <div className="glass-card rounded-3xl border border-white/5 p-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-tight text-white">Event Distribution</h3>
                    <Globe size={14} className="text-white/20" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    {[
                      { l: "Weather", p: "45%", c: "bg-cyan-neon" },
                      { l: "Finance", p: "32%", c: "bg-magenta-cyber" },
                      { l: "Politics", p: "12%", c: "bg-neutral-600" },
                      { l: "Other", p: "11%", c: "bg-white/5" },
                    ].map((item, i) => (
                      <div key={i} className="mb-4 last:mb-0">
                        <div className="flex justify-between text-[10px] font-bold text-white uppercase mb-2">
                          <span>{item.l}</span>
                          <span className="text-white/40">{item.p}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: item.p }} className={cn("h-full", item.c)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Global Activity Feed */}
            <div className="col-span-4 flex flex-col gap-8">
              <div className="glass-card rounded-3xl border border-white/5 shadow-2xl p-8 flex flex-col gap-8 h-full relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white">
                    <Zap size={20} className="text-cyan-neon" />
                    <h2 className="text-lg font-black uppercase tracking-tight italic">Fleet Activity</h2>
                  </div>
                  <ShieldCheck size={18} className="text-white/20" />
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                  {GLOBAL_FEED.map((feed, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="border-b border-white/5 pb-6 last:border-0 group select-none"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-black text-cyan-neon/80 uppercase tracking-tight">{feed.operator}</span>
                        <span className="text-[10px] font-mono text-white/20">{feed.time}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black tracking-widest",
                          feed.type === "FILL" ? "bg-chart-green text-background" : feed.type === "QUOTE" ? "bg-white/10 text-white" : "text-white/20 border border-white/5"
                        )}>{feed.type}</span>
                        <span className="text-xs font-bold text-white tracking-wide uppercase truncate">{feed.market}</span>
                      </div>
                      <div className="text-[10px] font-mono text-white/40 flex items-center gap-1.5">
                        <TrendingUp size={10} />
                        VALUE: {feed.val}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button className="w-full py-4 glass-card border-white/10 hover:border-cyan-neon/40 hover:bg-cyan-neon/5 group transition-all text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-cyan-neon rounded-2xl flex items-center justify-center gap-2">
                  View Full Audit Log
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
