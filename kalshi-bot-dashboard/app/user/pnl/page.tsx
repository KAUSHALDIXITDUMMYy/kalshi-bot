"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar, 
  ArrowUpRight, 
  Target, 
  Zap,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardHeader } from "@/app/components/DashboardHeader";

const PNL_STATS = [
  { label: "Total Net PnL", value: "+$4,842.12", trend: "+$420.50", color: "text-chart-green" },
  { label: "Win Rate", value: "68.2%", trend: "Above Target", color: "text-cyan-neon" },
  { label: "Profit Factor", value: "2.42", trend: "+0.12", color: "text-cyan-neon" },
  { label: "Max Drawdown", value: "-4.2%", trend: "Recovered", color: "text-chart-red" },
];

export default function PerformancePage() {
  return (
    <div className="flex bg-[#08080A] text-foreground min-h-screen font-display">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto h-screen scrollbar-hide">
        <DashboardHeader title="Performance Analytics" />
        
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Performance Overview Cards */}
          <div className="grid grid-cols-4 gap-4">
            {PNL_STATS.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 rounded-3xl border-white/5 relative group hover:border-cyan-neon/10 transition-all shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-white/20">
                    <PieChart size={16} />
                  </div>
                  <div className="text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded-full bg-white/[0.02] text-white/40">
                    {stat.trend}
                  </div>
                </div>
                <h3 className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className={cn("text-2xl font-black tracking-tight", stat.color)}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Main Equity Curve */}
            <div className="col-span-8">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[40px] border-white/5 p-10 shadow-2xl relative overflow-hidden h-[450px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-neon shadow-[0_0_8px_rgba(0,245,255,1)]" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-white">Cumulative Equity Curve</h2>
                  </div>
                  <div className="flex gap-2">
                    {['1D', '1W', '1M', 'ALL'].map((t) => (
                      <button key={t} className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all",
                        t === '1W' ? "bg-cyan-neon text-black" : "bg-white/[0.03] text-white/20 hover:text-white"
                      )}>{t}</button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex items-end gap-1 px-4 mb-4">
                  {[20, 25, 22, 35, 30, 45, 40, 55, 52, 65, 60, 75, 70, 85, 82, 95, 90, 100, 95, 110, 105, 120].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h * 0.7}%` }}
                      transition={{ delay: 0.2 + i * 0.02 }}
                      className="flex-1 bg-gradient-to-t from-cyan-neon/30 to-cyan-neon/0 border-t-2 border-cyan-neon/40 shadow-[0_-5px_15px_rgba(0,245,255,0.1)] rounded-t-[2px]"
                    />
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-[9px] font-black text-white/10 uppercase tracking-[0.4em] px-4 font-mono">
                  <span>SESS_START</span>
                  <span>MAR 24</span>
                  <span>MAR 25</span>
                  <span className="text-cyan-neon/40 italic flex items-center gap-2">
                    Current Growth Peak <ArrowUpRight size={10} />
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Session Insights */}
            <div className="col-span-4 flex flex-col gap-8">
              <div className="glass-card rounded-[40px] border-white/5 p-8 flex flex-col gap-10">
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <Target size={18} className="text-magenta-cyber" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Risk Distribution</h3>
                   </div>
                   <div className="space-y-5">
                      {[
                        { label: "Exposure Level", value: "Low", color: "bg-cyan-neon" },
                        { label: "System Confidence", value: "92%", color: "bg-cyan-neon" },
                        { label: "Latency Risk", value: "Minimal", color: "bg-chart-green" },
                      ].map((item) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                            <span className="text-white/30">{item.label}</span>
                            <span className="text-white">{item.value}</span>
                          </div>
                          <div className="w-full h-1 bg-white/[0.03] rounded-full overflow-hidden">
                            <div className={cn("h-full", item.color)} style={{ width: item.value === 'Low' || item.value === 'Minimal' ? '15%' : item.value }} />
                          </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-6 border-t border-white/5 pt-10">
                   <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-white/20" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Best Performing Market</h3>
                   </div>
                   <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-white/80">NVDA-EOM</span>
                        <span className="text-xs font-mono font-black text-chart-green">+$2,450</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="flex-1 py-3 bg-cyan-neon text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all">
                          Analyze Alpha
                        </button>
                      </div>
                   </div>
                </div>
              </div>

              {/* Stat Brief */}
              <div className="glass-card rounded-[40px] border-white/5 p-8 flex-1 relative overflow-hidden">
                 <div className="absolute -right-4 -bottom-4 opacity-5">
                    <TrendingUp size={120} className="text-cyan-neon" />
                 </div>
                 <div className="flex items-center gap-3 mb-6">
                    <Zap size={16} className="text-cyan-neon" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Quick Telemetry</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-white/20 uppercase">Avg Trade Time</p>
                      <p className="text-lg font-black text-white">4.2s</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-white/20 uppercase">Spread Capture</p>
                      <p className="text-lg font-black text-white">12.4%</p>
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
