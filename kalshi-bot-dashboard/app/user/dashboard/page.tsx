"use client";

import { motion } from "framer-motion";
import { 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Layers,
  Power,
  ZapOff,
  History,
  Terminal,
  Cpu,
  RefreshCw,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardHeader } from "@/app/components/DashboardHeader";
import { useState } from "react";

const STATS = [
  { label: "RFQs Detected", value: "1,245", trend: "+12%", color: "text-cyan-neon", icon: Activity },
  { label: "Quote Participation", value: "88%", trend: "+2%", color: "text-cyan-neon", icon: Layers },
  { label: "Acceptance Rate", value: "32%", trend: "-5%", color: "text-magenta-cyber", icon: Target },
  { label: "Daily PnL", value: "+$452.12", trend: "+$45", color: "text-chart-green", icon: TrendingUp },
];

const POSITIONS = [
  { market: "AAPL-24MAR26-C250", side: "YES", qty: 50, avg: 0.45, pnl: "+$12.50", status: "ACTIVE" },
  { market: "FED-RATE-HIKE-SEP", side: "NO", qty: 120, avg: 0.12, pnl: "+$4.80", status: "ACTIVE" },
  { market: "BTC-USD-80K-EOM", side: "YES", qty: 15, avg: 0.68, pnl: "-$2.15", status: "ACTIVE" },
  { market: "NVDA-SPLIT-CONFIRM", side: "YES", qty: 200, avg: 0.33, pnl: "+$44.00", status: "ACTIVE" },
];

const LOGS = [
  { time: "14:32:01", type: "RFQ", msg: "AAPL YES 0.44", status: "QUOTE SENT" },
  { time: "14:31:45", type: "RFQ", msg: "TSLA NO 0.35", status: "FILLED" },
  { time: "14:29:02", type: "RFQ", msg: "AMZN YES 0.88", status: "EXPIRED" },
  { time: "14:28:12", type: "RFQ", msg: "SPY-PUT-500 YES 0.15", status: "QUOTE SENT" },
  { time: "14:27:44", type: "RISK", msg: "MAX POSITION LIMIT REACHED [NVDA]", status: "ALERT" },
];

export default function UserDashboard() {
  const [isBotOn, setIsBotOn] = useState(true);

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Sidebar />
      
      <main className="flex-1 relative">
        <DashboardHeader title="Operator Terminal" />
        
        <div className="p-10 space-y-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl border border-white/5 relative group hover:border-cyan-neon/20 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 ${stat.color.replace('text-', 'bg-')}`} />
                
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-xl bg-white/[0.03] border border-white/5", stat.color)}>
                    <stat.icon size={20} className="drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]" />
                  </div>
                  <div className={cn("text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded bg-white/[0.03]", stat.trend.includes('-') ? "text-magenta-cyber" : "text-cyan-neon")}>
                    {stat.trend}
                  </div>
                </div>
                
                <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-3xl font-black tracking-tight text-white mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{stat.value}</p>
                <div className="w-full h-1 bg-white/[0.03] rounded-full overflow-hidden mt-4">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "70%" }} 
                    className={cn("h-full", stat.color.replace('text-', 'bg-'))} 
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Column: Positions */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-8 flex flex-col gap-8"
            >
              <div className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <Activity size={20} className="text-cyan-neon" />
                    <h2 className="text-lg font-black uppercase tracking-tight text-white">Active Positions</h2>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase">
                    Real-time Data Stream
                    <span className="w-1.5 h-1.5 bg-cyan-neon rounded-full animate-pulse shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
                  </div>
                </div>
                
                <div className="p-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.01]">
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-white/30 tracking-widest">Market</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-white/30 tracking-widest">Side</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-white/30 tracking-widest text-center">Qty</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-white/30 tracking-widest text-center">Avg Price</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-white/30 tracking-widest text-right">Current P/L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {POSITIONS.map((pos, i) => (
                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                          <td className="px-8 py-5 text-sm font-bold text-white tracking-wide">{pos.market}</td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "text-[10px] font-black px-2.5 py-1 rounded tracking-widest",
                              pos.side === "YES" ? "bg-cyan-neon/10 text-cyan-neon border border-cyan-neon/30" : "bg-magenta-cyber/10 text-magenta-cyber border border-magenta-cyber/30"
                            )}>{pos.side}</span>
                          </td>
                          <td className="px-8 py-5 text-center font-mono text-sm text-white">{pos.qty}</td>
                          <td className="px-8 py-5 text-center font-mono text-sm text-white">${pos.avg}</td>
                          <td className={cn("px-8 py-5 text-right font-mono text-sm font-bold", pos.pnl.startsWith('+') ? "text-chart-green" : "text-chart-red")}>
                            {pos.pnl}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Logs */}
              <div className="glass-card rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <Terminal size={20} className="text-white/40" />
                    <h2 className="text-lg font-black uppercase tracking-tight text-white">System Activity Logs</h2>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Quote Sent</span>
                    </div>
                    <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-neon rounded-full shadow-[0_0_5px_rgba(0,245,255,0.8)]" />
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Filled</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 space-y-4 max-h-[300px] overflow-y-auto font-mono scrollbar-hide">
                  {LOGS.map((log, i) => (
                    <div key={i} className="flex items-center justify-between group border-b border-white/[0.02] pb-4">
                      <div className="flex items-center gap-6">
                        <span className="text-xs text-white/20 font-bold">{log.time}</span>
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] bg-white/[0.03]",
                            log.type === "RISK" ? "text-magenta-cyber" : "text-neutral-500"
                          )}>{log.type}:</span>
                          <span className="text-white/70 group-hover:text-white transition-colors uppercase tracking-tight">{log.msg}</span>
                        </div>
                      </div>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-white/[0.02] border border-white/5 rounded-full transition-all group-hover:border-white/10",
                        log.status === "FILLED" ? "text-cyan-neon border-cyan-neon/20 shadow-[0_0_10px_rgba(0,245,255,0.1)]" : "text-white/20"
                      )}>{log.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column: Controls */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-4 flex flex-col gap-8"
            >
              <div className="glass-card rounded-3xl border border-white/5 shadow-2xl overflow-hidden p-8 flex flex-col gap-10 relative">
                {/* Emergency Stop */}
                <button className="w-full py-10 bg-chart-red/10 border border-chart-red/30 hover:bg-chart-red/20 group rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center gap-4 active:scale-95 shadow-[0_0_40px_rgba(255,0,0,0.1)]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-chart-red/0 to-chart-red/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Power size={48} className="text-chart-red group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_red] transition-all" />
                  <span className="text-2xl font-black uppercase text-chart-red tracking-widest z-10">EMERGENCY STOP</span>
                </button>

                {/* Bot Control */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Execution Control</h3>
                    <div className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-full border bg-white/[0.02]",
                      isBotOn ? "text-cyan-neon border-cyan-neon/30 shadow-[0_0_10px_rgba(0,245,255,0.1)]" : "text-neutral-500 border-white/5"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", isBotOn ? "bg-cyan-neon animate-pulse" : "bg-neutral-500")} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{isBotOn ? "Engine Running" : "Engine Standby"}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Base Strategy</span>
                        <Settings size={14} className="text-white/20" />
                      </div>
                      <select className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-cyan-neon/30 transition-all appearance-none">
                        <option>Bot Logic: Spread-based</option>
                        <option>Bot Logic: Fixed-price</option>
                        <option>Bot Logic: Orderbook-match</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3">
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Max Daily Loss</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/20 font-bold">$</span>
                          <input type="number" placeholder="500" className="bg-transparent w-full text-lg font-black text-white outline-none placeholder:text-white/10" />
                        </div>
                      </div>
                      <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3">
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Max Position</span>
                        <div className="flex items-center gap-2">
                          <input type="number" placeholder="100" className="bg-transparent w-full text-lg font-black text-white outline-none placeholder:text-white/10" />
                          <span className="text-white/20 font-bold text-xs">QTY</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Risk Exposure Matrix</span>
                        <ShieldCheck size={14} className="text-cyan-neon" />
                      </div>
                      <div className="w-full h-32 flex items-center justify-center relative">
                        {/* Fake Dial */}
                        <div className="w-24 h-24 rounded-full border-[8px] border-white/[0.03] border-t-cyan-neon shadow-[0_0_20px_rgba(0,245,255,0.1)] relative">
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs font-black text-white">$12.4k</span>
                            <span className="text-[8px] font-bold text-cyan-neon uppercase">Safe Zone</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setIsBotOn(!isBotOn)}
                      className={cn(
                        "w-full py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 active:scale-95 shadow-lg",
                        isBotOn 
                          ? "bg-magenta-cyber/20 text-magenta-cyber border border-magenta-cyber/30 hover:bg-magenta-cyber/30" 
                          : "bg-cyan-neon text-background shadow-cyan-neon/20 hover:shadow-cyan-neon/30"
                      )}
                    >
                      {isBotOn ? <ZapOff size={20} /> : <Zap size={20} />}
                      {isBotOn ? "Deactivate Engine" : "Ignite Engine"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
