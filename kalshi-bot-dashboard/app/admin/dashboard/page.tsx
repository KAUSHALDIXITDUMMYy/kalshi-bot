"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Globe, 
  Search, 
  ShieldCheck, 
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
  { label: "Platform Revenue", value: "$4.2M", trend: "+12.4%", color: "text-cyan-neon", icon: TrendingUp },
  { label: "Active User Nodes", value: "852", trend: "NOMINAL", color: "text-cyan-neon", icon: Users },
  { label: "System Load Index", value: "24%", trend: "STABLE", color: "text-chart-green", icon: Activity },
  { label: "API Health", value: "99.9%", trend: "OPTIMAL", color: "text-cyan-neon", icon: Server },
];

const USERS = [
  { name: "Alpha_Trader_99", status: "ACTIVE", profit: "+$12,450", loss: "-$1,200", daysLeft: 12, health: 85 },
  { name: "Quantum_Node", status: "DORMANT", profit: "+$45,800", loss: "-$8,400", daysLeft: 2, health: 12 },
  { name: "Bravo_Strategic", status: "ACTIVE", profit: "+$2,100", loss: "-$450", daysLeft: 28, health: 98 },
  { name: "Delta_Fleet_5", status: "ALERT", profit: "+$850", loss: "-$1,100", daysLeft: 15, health: 45 },
  { name: "Echo_Protocol", status: "ACTIVE", profit: "+$6,200", loss: "-$900", daysLeft: 30, health: 100 },
];

const GLOBAL_FEED = [
  { user: "Alpha_Trader_99", type: "FILL", market: "AAPL-YES", val: "+$450.00", time: "16:04:12" },
  { user: "Bravo_Strategic", type: "QUOTE", market: "BTC-80K", val: "PENDING", time: "16:03:55" },
  { user: "Echo_Protocol", type: "CONFIRM", market: "NVDA-SPLIT", val: "+$1,200", time: "16:02:10" },
  { user: "Delta_Fleet_5", type: "CANCEL", market: "TSLA-NO", val: "$0.00", time: "16:01:44" },
];

export default function AdminDashboard() {
  return (
    <div className="flex bg-[#08080A] text-foreground min-h-screen font-display">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto h-screen scrollbar-hide">
        <DashboardHeader title="Command Control" />
        
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Platform Performance HUD */}
          <div className="grid grid-cols-4 gap-4">
            {FLEET_STATS.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 rounded-2xl border border-white/5 relative group hover:border-cyan-neon/10 transition-all shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-lg bg-white/[0.03] border border-white/5", stat.color)}>
                    <stat.icon size={16} />
                  </div>
                  <div className={cn("text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded-full bg-white/[0.02]", stat.trend === "NOMINAL" || stat.trend === "STABLE" || stat.trend.includes('+') ? "text-cyan-neon" : "text-magenta-cyber")}>
                    {stat.trend}
                  </div>
                </div>
                <h3 className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-2xl font-black tracking-tight text-white mb-2">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* User Fleet Monitoring */}
            <div className="col-span-8 space-y-8">
              <div className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-cyan-neon" />
                    <h2 className="text-sm font-black uppercase tracking-tight text-white">Global User Fleet Monitoring</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={12} />
                      <input type="text" placeholder="Search user ID..." className="bg-white/[0.03] border border-white/5 rounded-full py-1.5 pl-9 pr-4 text-[9px] font-bold text-white outline-none focus:border-cyan-neon/30 transition-all w-48" />
                    </div>
                    <button className="p-2 bg-white/[0.03] border border-white/5 rounded-lg text-white/40 hover:text-cyan-neon transition-colors">
                      <Settings size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/[0.01]">
                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 tracking-widest font-mono">User Identifier</th>
                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 tracking-widest font-mono text-center">Status</th>
                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 tracking-widest font-mono text-center">Net Profit</th>
                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 tracking-widest font-mono text-center">Time Remaining</th>
                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 tracking-widest font-mono text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {USERS.map((user, i) => (
                        <tr key={i} className="group hover:bg-white/[0.01] transition-colors cursor-pointer">
                          <td className="px-8 py-5 flex items-center gap-3 font-bold text-white/80 text-sm">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]",
                              user.status === "ACTIVE" ? "bg-cyan-neon shadow-cyan-neon/40 animate-pulse" : user.status === "ALERT" ? "bg-magenta-cyber" : "bg-white/10"
                            )} />
                            {user.name}
                          </td>
                          <td className="px-8 py-5 text-center italic text-white/40 text-[10px] font-mono tracking-widest uppercase">{user.status}</td>
                          <td className="px-8 py-5 text-center font-black text-chart-green text-sm font-mono">{user.profit}</td>
                          <td className="px-8 py-5 text-center">
                            <div className="space-y-1.5 flex flex-col items-center">
                              <span className={cn(
                                "text-[10px] font-black tracking-[0.2em]",
                                user.daysLeft <= 5 ? "text-magenta-cyber" : "text-white/40"
                              )}>{user.daysLeft} DAYS</span>
                              <div className="w-20 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  animate={{ width: `${(user.daysLeft / 30) * 100}%` }} 
                                  className={cn("h-full", user.daysLeft <= 5 ? "bg-magenta-cyber" : "bg-cyan-neon")} 
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button className="p-2 text-white/10 group-hover:text-cyan-neon transition-colors">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Advanced Diagnostics HUD */}
              <div className="grid grid-cols-2 gap-8">
                <div className="glass-card rounded-3xl border border-white/5 p-8 flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 italic">System API Latency</h3>
                    <Layers size={14} className="text-white/20" />
                  </div>
                  <div className="h-32 flex items-end gap-2 px-2">
                    {[34, 55, 45, 78, 90, 65, 45, 34, 23, 45, 67, 89].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/[0.03] rounded-t-lg relative group transition-all hover:bg-cyan-neon/40" style={{ height: `${h}%` }}>
                        <div className="absolute inset-0 bg-cyan-neon opacity-0 group-hover:opacity-100 transition-opacity blur-[8px] rounded-t-lg" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-mono text-white/20 uppercase tracking-[0.4em]">
                    <span>12:00</span>
                    <span className="text-cyan-neon/40 uppercase">Cluster Load: Normal</span>
                    <span>00:00</span>
                  </div>
                </div>

                <div className="glass-card rounded-3xl border border-white/5 p-8 flex flex-col gap-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4">
                      <ShieldCheck size={48} className="text-white/[0.02] -rotate-12" />
                   </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Market Distribution</h3>
                    <Server size={14} className="text-white/20" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-5">
                    {[
                      { l: "Elections", p: "65%", c: "bg-cyan-neon" },
                      { l: "Finance", p: "22%", c: "bg-magenta-cyber" },
                      { l: "Macro", p: "13%", c: "bg-white/10" },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black text-white/40 uppercase tracking-widest">
                          <span>{item.l}</span>
                          <span className="text-white/60">{item.p}</span>
                        </div>
                        <div className="h-1 w-full bg-white/[0.02] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: item.p }} className={cn("h-full", item.c)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Global Activity Feed */}
            <div className="col-span-4 flex flex-col gap-8 h-full">
              <div className="glass-card rounded-3xl border border-white/5 shadow-2xl flex flex-col h-full relative overflow-hidden">
                <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <Zap size={18} className="text-cyan-neon" />
                    <h2 className="text-sm font-black uppercase tracking-tight text-white">Global Event Stream</h2>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-neon animate-pulse" />
                    <span className="text-[8px] font-black uppercase text-white/40 tracking-widest italic leading-none">LIVE</span>
                  </div>
                </div>

                <div className="p-8 space-y-6 flex-1 overflow-y-auto font-mono scrollbar-hide">
                  {GLOBAL_FEED.map((feed, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/[0.02] pb-5 last:border-0 group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-cyan-neon/60 uppercase tracking-tighter truncate w-32">{feed.user}</span>
                        <span className="text-[8px] font-mono text-white/10">{feed.time}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded-[4px] text-[8px] font-black tracking-widest",
                          feed.type === "FILL" ? "bg-chart-green/10 text-chart-green border border-chart-green/20" : 
                          feed.type === "QUOTE" ? "bg-white/5 text-white/40" : 
                          "bg-cyan-neon/10 text-cyan-neon border border-cyan-neon/20 shadow-[0_0_10px_rgba(0,245,255,0.1)]"
                        )}>{feed.type}</span>
                        <span className="text-[11px] font-bold text-white tracking-tight uppercase truncate">{feed.market}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] italic">Impact</span>
                         <span className={cn("text-[10px] font-bold", feed.val.startsWith('+') ? "text-chart-green" : "text-white/20")}>{feed.val}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-6 mt-auto">
                    <button className="w-full py-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-neon/20 transition-all rounded-2xl flex items-center justify-center gap-3 group">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-cyan-neon">Initialize Audit Log</span>
                        <ArrowRight size={14} className="text-white/20 group-hover:text-cyan-neon group-hover:translate-x-1 transition-all" />
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
