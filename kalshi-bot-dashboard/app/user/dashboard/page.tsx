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
  { label: "Active Nodes", value: "01", trend: "CONNECTED", color: "text-cyan-neon", icon: Activity },
  { label: "Quote Power", value: "82.4%", trend: "+2.1%", color: "text-cyan-neon", icon: Layers },
  { label: "Session PnL", value: "+$42.12", trend: "7.2%", color: "text-chart-green", icon: TrendingUp },
  { label: "Uptime", value: "14:32:01", trend: "99.9%", color: "text-cyan-neon", icon: Zap },
];

const POSITIONS = [
  { market: "AAPL-24MAR26-C250", side: "YES", qty: 50, avg: 0.45, pnl: "+$12.50", status: "ACTIVE" },
  { market: "FED-RATE-HIKE-SEP", side: "NO", qty: 120, avg: 0.12, pnl: "+$4.80", status: "ACTIVE" },
  { market: "BTC-USD-80K-EOM", side: "YES", qty: 15, avg: 0.68, pnl: "-$2.15", status: "ACTIVE" },
];

const LIVE_RFQS = [
  { 
    id: "rfq_01H2J", 
    market_ticker: "NASDAQ100-24MAR26-T18500", 
    contracts_fp: 5000, // 50.00 contracts
    target_cost: 0.56,
    status: "open",
    is_hvm: true,
    legs: [
      { ticker: "NAS-24MAR26-UP", side: "YES", value: 1.00 },
      { ticker: "NAS-24MAR26-DOWN", side: "NO", value: 0.00 }
    ]
  },
  { 
    id: "rfq_01H2K", 
    market_ticker: "BTC-USD-80K-EOM", 
    contracts_fp: 15000, 
    target_cost: 0.12,
    status: "accepted",
    is_hvm: false,
    legs: []
  },
  { 
    id: "rfq_01H2L", 
    market_ticker: "FED-RATE-HIKE-SEP", 
    contracts_fp: 12000, 
    target_cost: 0.88,
    status: "confirmed",
    is_hvm: false,
    legs: []
  }
];

const LOGS = [
  { time: "16:04:12", type: "COMMUNICATIONS", msg: "RFQ_CREATED: NASDAQ100...", status: "OK" },
  { time: "16:03:55", type: "SYSTEM", msg: "SHARD_SYNC_COMPLETE: SHARD_04", status: "OK" },
  { time: "16:02:12", type: "QUOTE", msg: "QUOTE_ACCEPTED: BTC-USD...", status: "PENDING" },
  { time: "16:01:44", type: "ENGINE", msg: "HVM_GATEWAY_ACTIVE", status: "ACTIVE" },
];

export default function UserDashboard() {
  const [isBotOn, setIsBotOn] = useState(true);

  return (
    <div className="flex bg-[#08080A] text-foreground min-h-screen font-display">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto h-screen scrollbar-hide">
        <DashboardHeader title="Operator Terminal" />
        
        <div className="p-10 space-y-10 max-w-7xl mx-auto">
          {/* Top Bar: Bot Health & Connection Status */}
          <div className="flex items-center justify-between bg-white/[0.01] p-6 rounded-[32px] border border-white/5 shadow-xl">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4 px-5 py-2.5 bg-cyan-neon/5 rounded-2xl border border-cyan-neon/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-neon opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-neon shadow-[0_0_8px_cyan]"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-neon">WebSocket Mesh: Connected</span>
              </div>
              <div className="flex items-center gap-4 px-5 py-2.5 bg-white/[0.03] rounded-2xl border border-white/10">
                <ShieldCheck size={14} className="text-white/40" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Auth: Secure_v2</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-white transition-colors">
                <RefreshCw size={18} />
              </button>
              <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-white transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 rounded-2xl border border-white/5 relative group hover:border-cyan-neon/10 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-lg bg-white/[0.03] border border-white/5", stat.color)}>
                    <stat.icon size={16} />
                  </div>
                  <div className="text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded-full bg-white/[0.02] text-white/40">
                    {stat.trend}
                  </div>
                </div>
                <h3 className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-2xl font-black tracking-tight text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Column: Data Stream & Manual Intervention */}
            <div className="col-span-8 flex flex-col gap-8">
              
              {/* RFQ & Quote Pipeline */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl"
              >
                <div className="px-8 py-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal size={18} className="text-cyan-neon" />
                    <h2 className="text-sm font-black uppercase tracking-tight text-white">Live RFQ Pipeline</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-magenta-cyber/10 border border-magenta-cyber/20 px-3 py-1 rounded-lg">
                      <span className="text-[9px] font-black text-magenta-cyber uppercase tracking-widest">HVM Active</span>
                    </div>
                  </div>
                </div>
                <div className="p-0">
                  <div className="divide-y divide-white/5">
                    {LIVE_RFQS.map((rfq, i) => (
                      <div key={rfq.id} className="p-8 hover:bg-white/[0.01] transition-all group">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-white tracking-tight">{rfq.market_ticker}</span>
                              {rfq.is_hvm && <Zap size={12} className="text-magenta-cyber" />}
                            </div>
                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">UID: {rfq.id}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest",
                              rfq.status === "open" && "bg-cyan-neon/5 border-cyan-neon/20 text-cyan-neon",
                              rfq.status === "accepted" && "bg-chart-green/5 border-chart-green/20 text-chart-green",
                              rfq.status === "confirmed" && "bg-magenta-cyber/5 border-magenta-cyber/20 text-magenta-cyber"
                            )}>
                              {rfq.status}
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-black text-white/80">${(rfq.contracts_fp / 100).toFixed(2)} Target</span>
                              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Size: {rfq.contracts_fp / 100} Contracts</span>
                            </div>
                          </div>
                        </div>

                        {rfq.legs.length > 0 && (
                          <div className="mb-6 grid grid-cols-2 gap-3">
                            {rfq.legs.map((leg, li) => (
                              <div key={li} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-tight truncate max-w-[120px]">{leg.ticker}</span>
                                <span className={cn(
                                  "text-[9px] font-black px-2 py-0.5 rounded",
                                  leg.side === "YES" ? "text-cyan-neon bg-cyan-neon/10" : "text-magenta-cyber bg-magenta-cyber/10"
                                )}>{leg.side}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          {rfq.status === "open" && (
                            <button className="flex-1 py-3 bg-cyan-neon text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(0,245,255,0.2)] hover:scale-[1.02] transition-all">
                              Submit Quote
                            </button>
                          )}
                          {rfq.status === "accepted" && (
                            <button className="flex-1 py-3 bg-magenta-cyber text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(255,0,128,0.2)] hover:scale-[1.02] transition-all">
                              Confirm Trade (30s)
                            </button>
                          )}
                          {rfq.status === "confirmed" && (
                            <button className="flex-1 py-3 bg-white/[0.05] border border-white/10 text-white/40 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed">
                              Awaiting Execution (15s)
                            </button>
                          )}
                          <button className="px-6 py-3 bg-white/[0.03] border border-white/5 text-white/20 hover:text-white/40 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            Ignore
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Positions Table */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl"
              >
                <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <Activity size={18} className="text-white/40" />
                    <h2 className="text-sm font-black uppercase tracking-tight text-white">Active Positions</h2>
                  </div>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.01]">
                      <tr>
                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 tracking-widest">Market</th>
                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 tracking-widest">Side</th>
                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 tracking-widest text-center">Qty</th>
                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 tracking-widest text-right">P/L Session</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {POSITIONS.map((pos, i) => (
                        <tr key={i} className="group hover:bg-white/[0.01] transition-colors">
                          <td className="px-8 py-5 text-sm font-bold text-white/70">{pos.market}</td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "text-[9px] font-black px-2 py-0.5 rounded tracking-widest border",
                              pos.side === "YES" ? "text-cyan-neon border-cyan-neon/20 bg-cyan-neon/5" : "text-magenta-cyber border-magenta-cyber/20 bg-magenta-cyber/5"
                            )}>{pos.side}</span>
                          </td>
                          <td className="px-8 py-5 text-center font-mono text-sm text-white/40">{pos.qty}</td>
                          <td className={cn("px-8 py-5 text-right font-mono text-sm font-black", pos.pnl.startsWith('+') ? "text-chart-green" : "text-chart-red")}>
                            {pos.pnl}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Execution Controls & Activity */}
            <div className="col-span-4 flex flex-col gap-8">
              <div className="glass-card rounded-3xl border border-white/5 p-8 flex flex-col gap-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Execution Engine</h3>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      isBotOn ? "bg-cyan-neon shadow-[0_0_8px_rgba(0,245,255,0.6)] animate-pulse" : "bg-white/10"
                    )} />
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => setIsBotOn(!isBotOn)}
                      className={cn(
                        "w-full py-5 rounded-2xl transition-all duration-300 font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3",
                        isBotOn 
                          ? "bg-magenta-cyber/10 text-magenta-cyber border border-magenta-cyber/20 hover:bg-magenta-cyber/20" 
                          : "bg-cyan-neon text-black hover:scale-[1.02]"
                      )}
                    >
                      {isBotOn ? <ZapOff size={18} /> : <Zap size={18} />}
                      {isBotOn ? "Deactivate" : "Ignite Engine"}
                    </button>
                    <p className="text-[9px] font-bold text-white/20 text-center uppercase tracking-widest">
                      {isBotOn ? "Engine in Active Monitoring" : "Engine on Standby Mode"}
                    </p>
                  </div>
                </div>

                <div className="space-y-6 border-t border-white/5 pt-10">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6">Trading Strategy</h3>
                   <div className="space-y-4">
                      {['Market Making', 'Spread Arbitrage', 'Linear Volatility'].map((type) => (
                        <div key={type} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-cyan-neon/20 transition-all cursor-pointer">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">{type}</span>
                          <div className={cn("w-1.5 h-1.5 rounded-full", type === 'Market Making' ? "bg-cyan-neon" : "bg-white/5")} />
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Logs Card */}
              <div className="glass-card rounded-3xl border border-white/5 overflow-hidden flex flex-col flex-1 min-h-[400px]">
                <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History size={16} className="text-white/20" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40">Event Stream</h2>
                  </div>
                </div>
                <div className="p-8 space-y-5 overflow-y-auto font-mono scrollbar-hide">
                  {LOGS.map((log, i) => (
                    <div key={i} className="flex flex-col gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{log.type}</span>
                        <span className="text-[9px] font-bold text-white/10">{log.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-white tracking-tight">{log.msg}</span>
                        <span className={cn(
                          "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                          log.status === "OK" || log.status === "ACTIVE" ? "text-cyan-neon bg-cyan-neon/10" : "text-white/20 bg-white/5"
                        )}>{log.status}</span>
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
