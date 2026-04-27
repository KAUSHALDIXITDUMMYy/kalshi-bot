"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  TrendingUp, 
  Zap,
  Server,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Target,
  BarChart3,
  Clock,
  AlertTriangle,
  FileCheck,
  History,
  Dices,
  Save,
  RotateCcw,
  Ban,
  RefreshCw,
  Lock,
  ArrowUpRight,
  Download,
  Filter,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardHeader } from "@/app/components/DashboardHeader";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// --- Types ---
interface BotStats {
  status: string;
  uptime_seconds: number;
  realized_pnl_cents: number;
  circuit_breakers: {
    global_halt: boolean;
    throttled_sports: string[];
  };
  capacity: {
    open_rfq_count: number;
    max_allowed: number;
  };
  exposure_cents: {
    daily_total: number;
    nfl: number;
    nba: number;
    mlb: number;
  };
  trackers: Record<string, number>;
  safety: {
    error_count: number;
    last_error_time: string;
    ws_latency_ms: number;
  };
  postgres: string;
  memory_mb: number;
}

interface DecisionLog {
  rfq_id: string;
  sport: string;
  leg_count: number;
  quoted: boolean;
  skip_reason: string;
  quote_id: string | null;
  yes: number | null;
  no: number | null;
  latency: number | null;
}

interface AuditLog {
  quote_id: string;
  quote_req_id: string;
  sport: string;
  contracts_fp: number;
  accepted_side: string;
  cost_cents: number;
  max_payout_cents: number;
  confirmed_at: string;
}

export default function UnifiedDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#08080A] flex items-center justify-center">
        <Loader2 className="text-cyan-neon animate-spin" size={48} />
      </div>
    }>
      <UnifiedDashboardInner />
    </Suspense>
  );
}

function UnifiedDashboardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [stats, setStats] = useState<BotStats | null>(null);
  const [config, setConfig] = useState<Record<string, string | null>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Stats Polling
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/bot/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setStats(null);
      }
    } catch (err) {
      console.error("Stats poll failed:", err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Config Fetching
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/bot/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error("Config fetch failed:", err);
    }
  }, []);

  // Audit Logs Fetching
  const fetchAudit = useCallback(async () => {
    try {
      const res = await fetch("/api/bot/audit");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error("Audit fetch failed:", err);
    }
  }, []);

  const fetchDecisionLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/bot/logs");
      if (res.ok) {
        const data = await res.json();
        setDecisionLogs(data);
      }
    } catch (err) {
      console.error("Decision logs fetch failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchConfig();
    fetchAudit();
    fetchDecisionLogs();
    const interval = setInterval(() => {
      fetchStats();
      if (activeTab === "audit" || activeTab === "overview") {
        fetchAudit();
        fetchDecisionLogs();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchConfig, fetchAudit, fetchDecisionLogs, activeTab]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    setActiveTab(tab || "overview");
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard?tab=${tab}`);
  };

  const handleSaveConfig = async (key: string, value: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/bot/config", {
        method: "POST",
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        fetchConfig(); // Refresh
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  // derived metrics
  const pnl = stats?.realized_pnl_cents || 0;
  const totalExp = stats?.exposure_cents.daily_total || 0;
  const rfqCount = stats?.capacity.open_rfq_count || 0;
  const isHalted = stats?.circuit_breakers.global_halt || false;

  const BOT_HUD = [
    { label: "Net Realized PnL", value: stats ? formatCurrency(pnl) : "---", trend: !stats ? "DISCONNECTED" : pnl >= 0 ? "PROFIT" : "LOSS", color: !stats ? "text-white/20" : pnl >= 0 ? "text-chart-green" : "text-magenta-cyber", icon: TrendingUp },
    { label: "Daily Exposure", value: stats ? formatCurrency(totalExp) : "---", trend: !stats ? "DISCONNECTED" : `OF $5,000`, color: !stats ? "text-white/20" : "text-cyan-neon", icon: Target },
    { label: "Active RFQs", value: stats ? rfqCount.toString() : "---", trend: !stats ? "DISCONNECTED" : "STABLE", color: !stats ? "text-white/20" : "text-cyan-neon", icon: Activity },
    { label: "System Status", value: !stats ? "DISCONNECTED" : isHalted ? "SUSPENDED" : "OPERATIONAL", trend: !stats ? "DISCONNECTED" : "1s WINDOW", color: !stats ? "text-magenta-cyber animate-pulse" : isHalted ? "text-magenta-cyber" : "text-chart-green", icon: ShieldCheck },
  ];

  return (
    <div className="flex bg-[#08080A] text-foreground min-h-screen font-display">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto h-screen scrollbar-hide">
        <DashboardHeader 
          title={`Bot Command Center: ${activeTab.toUpperCase()}`} 
          latency={stats ? stats.safety.ws_latency_ms?.toFixed(1) || "..." : null}
          status={!stats ? "DISCONNECTED" : isHalted ? "SUSPENDED" : "OPERATIONAL"}
        />
        
        <div className="p-8 space-y-8 w-full">
          
          {/* Global Bot KPI HUD */}
          <div className="grid grid-cols-4 gap-4">
            {BOT_HUD.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 rounded-2xl border border-white/5 relative group hover:border-cyan-neon/10 transition-all shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-lg bg-white/[0.03] border border-white/5", stat.color)}>
                    <stat.icon size={16} />
                  </div>
                  <div className={cn("text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded-full bg-white/[0.02]", stat.trend === "PROFIT" || stat.trend === "STABLE" || stat.trend === "OPERATIONAL" ? "text-chart-green" : "text-magenta-cyber")}>
                    {stat.trend}
                  </div>
                </div>
                <h3 className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1 italic font-mono">{stat.label}</h3>
                <p className={cn("text-2xl font-black tracking-tight italic", stat.color)}>{stat.value}</p>
              </motion.div>
            ))}
          </div>


          {/* Secondary HUD Row: Performance & Capacity */}
          <div className="grid grid-cols-4 gap-4">
             <div className="glass-card p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                   <h4 className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em] mb-1">Node Throughput</h4>
                   <p className="text-lg font-black text-white italic">{stats?.trackers.throughput || 0} <span className="text-[10px] text-white/20 not-italic">RFQ/MIN</span></p>
                </div>
                <div className="h-8 w-16 bg-white/[0.02] rounded flex items-end gap-0.5 p-1">
                   {[4, 7, 5, 8, 10, 6, 9, 7].map((h, i) => <div key={i} className="flex-1 bg-cyan-neon/20 rounded-sm" style={{ height: `${h * 10}%` }} />)}
                </div>
             </div>
             <div className="glass-card p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                   <h4 className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em] mb-1">Active Quotes</h4>
                   <p className="text-lg font-black text-white italic">{stats?.trackers.tracked_quotes || 0} <span className="text-[10px] text-white/20 not-italic">ACTIVE</span></p>
                </div>
                <div className="text-chart-green text-[10px] font-black italic">NOMINAL</div>
             </div>
             <div className="glass-card p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                   <h4 className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em] mb-1">Memory Profile</h4>
                   <p className="text-lg font-black text-white italic">{stats?.memory_mb || 0} <span className="text-[10px] text-white/20 not-italic">MB</span></p>
                </div>
                <div className="text-white/20 text-[10px] font-black italic">STABLE</div>
             </div>
             <div className="glass-card p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                   <h4 className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em] mb-1">Price Cache</h4>
                   <p className="text-lg font-black text-white italic">{stats?.trackers.price_cache || 0} <span className="text-[10px] text-white/20 not-italic">TICKERS</span></p>
                </div>
                <Clock size={16} className="text-cyan-neon opacity-20" />
             </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            
            {/* Main Center Column: Execution & Trends */}
            <div className="col-span-12 xl:col-span-9 flex flex-col gap-6">
               <div className="grid grid-cols-2 gap-6">
                  {/* Execution Ledger */}
                  <div className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl h-[450px]">
                    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                      <h2 className="text-xs font-black uppercase tracking-tight text-white italic flex items-center gap-2">
                         <Activity size={14} className="text-cyan-neon" />
                         Execution Ledger
                      </h2>
                      <span className="text-[9px] font-mono text-white/40">{(auditLogs?.length || 0)} Records Detected</span>
                    </div>
                    <div className="overflow-y-auto flex-1 font-mono text-[10px]">
                      <table className="w-full text-left">
                        <thead className="sticky top-0 bg-[#08080A]/90 backdrop-blur border-b border-white/5 z-10">
                          <tr>
                            <th className="px-4 py-3 font-black text-white/30 uppercase tracking-widest text-[9px]">Time</th>
                            <th className="px-4 py-3 font-black text-white/30 uppercase tracking-widest text-[9px]">Asset Node</th>
                            <th className="px-4 py-3 font-black text-white/30 uppercase tracking-widest text-center text-[9px]">Side</th>
                            <th className="px-4 py-3 font-black text-white/30 uppercase tracking-widest text-right text-[9px]">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {auditLogs && auditLogs.length > 0 ? (
                            auditLogs.map((log, i) => (
                            <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                              <td className="px-4 py-3 text-white/40 group-hover:text-white/60">{new Date(log.confirmed_at).toLocaleTimeString()}</td>
                              <td className="px-4 py-3 text-white/80 font-black tracking-tight">{log.sport}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-[4px] font-black text-[9px]",
                                  log.accepted_side === "YES" ? "text-chart-green bg-chart-green/10" : "text-magenta-cyber bg-magenta-cyber/10"
                                )}>{log.accepted_side}</span>
                              </td>
                              <td className="px-4 py-3 text-right text-cyan-neon font-black italic">{formatCurrency(log.cost_cents)}</td>
                            </tr>
                          ))
                          ) : null}
                          {(auditLogs?.length || 0) === 0 && (
                            <tr>
                              <td colSpan={4} className="px-4 py-20 text-center text-white/10 italic">
                                 <div className="flex flex-col items-center gap-2 opacity-50">
                                    <Loader2 size={24} className="animate-spin text-cyan-neon" />
                                    <span className="text-[10px] font-black tracking-widest uppercase">Awaiting Order Flow...</span>
                                 </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                   {/* Decision Intelligence (Logs) */}
                  <div className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl h-[450px]">
                    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                      <h2 className="text-xs font-black uppercase tracking-tight text-white italic flex items-center gap-2">
                         <Zap size={14} className="text-cyan-neon" />
                         Decision Intelligence
                      </h2>
                      <span className="text-[9px] font-mono text-white/40">{decisionLogs.length} Events</span>
                    </div>
                    <div className="overflow-y-auto flex-1 font-mono text-[10px]">
                      <table className="w-full text-left">
                        <thead className="sticky top-0 bg-[#08080A]/90 backdrop-blur border-b border-white/5 z-10">
                          <tr>
                            <th className="px-4 py-3 font-black text-white/30 uppercase tracking-widest text-[9px]">RFQ ID</th>
                            <th className="px-4 py-3 font-black text-white/30 uppercase tracking-widest text-[9px]">Decision</th>
                            <th className="px-4 py-3 font-black text-white/30 uppercase tracking-widest text-center text-[9px]">Price</th>
                            <th className="px-4 py-3 font-black text-white/30 uppercase tracking-widest text-right text-[9px]">Latency</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {decisionLogs.length > 0 ? (
                            decisionLogs.map((log, i) => (
                              <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="px-4 py-3 text-white/40 group-hover:text-white/60">{log.rfq_id}</td>
                                <td className="px-4 py-3">
                                  {log.quoted ? (
                                    <span className="text-chart-green flex items-center gap-1 font-black uppercase italic">
                                      <FileCheck size={10} /> QUOTED
                                    </span>
                                  ) : (
                                    <span className="text-magenta-cyber flex items-center gap-1 font-black uppercase italic">
                                      <Ban size={10} /> {log.skip_reason?.toUpperCase() || "SKIPPED"}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center text-white/80 font-black">
                                  {log.yes ? `${log.yes}¢` : "---"}
                                </td>
                                <td className="px-4 py-3 text-right text-cyan-neon font-black italic">
                                  {log.latency ? `${log.latency.toFixed(1)}ms` : "---"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-4 py-20 text-center text-white/10 italic">
                                 Awaiting RFQ stream...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
               </div>

               {/* Configuration Row */}
               <div className="glass-card rounded-2xl border border-white/5 p-6 shadow-2xl bg-white/[0.01] flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-xs font-black uppercase tracking-tight text-white italic flex items-center gap-2">
                        <Zap size={14} className="text-cyan-neon" />
                        Execution Strategy Overrides
                     </h2>
                     <span className="text-[10px] text-white/20 font-black italic uppercase tracking-widest">Global Vig Profile: High-Density</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "Single Leg", key: "config:vig:leg:1", color: "cyan-neon", desc: "Base RFQ spread" },
                      { label: "Double Leg", key: "config:vig:leg:2", color: "warning", desc: "Correlation tax" },
                      { label: "Triple Leg", key: "config:vig:leg:3", color: "chart-green", desc: "Multi-path offset" },
                      { label: "Parlay (4+)", key: "config:vig:leg:4", color: "magenta-cyber", desc: "Risk aggregation" },
                    ].map((item) => {
                      const val = parseInt(config[item.key] || "0");
                      return (
                        <div key={item.key} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group">
                          <div className="flex justify-between items-start mb-1">
                             <h3 className="text-[10px] font-black uppercase text-white/80 italic tracking-widest group-hover:text-white transition-colors">{item.label}</h3>
                             <span className="text-sm font-black font-mono text-white italic">{val}¢</span>
                          </div>
                          <p className="text-[8px] text-white/20 font-mono uppercase tracking-widest mb-6">{item.desc}</p>
                          <input 
                            type="range" min="0" max="10" step="1" 
                            value={val} 
                            onChange={(e) => handleSaveConfig(item.key, e.target.value)}
                            className={cn("w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-neon")}
                          />
                        </div>
                      );
                    })}
                  </div>
               </div>
            </div>

            {/* Right Command Column: Risk & Control */}
            <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
               {/* Emergency Controls */}
               <div className="glass-card rounded-2xl border border-white/5 p-6 shadow-2xl relative overflow-hidden group h-[164px]">
                  <div className={cn(
                     "absolute inset-0 transition-opacity duration-1000",
                     isHalted ? "bg-magenta-cyber/10 opacity-100" : "bg-transparent opacity-0"
                  )} />
                  <h2 className="text-xs font-black uppercase tracking-tight text-white italic mb-4 flex items-center gap-2">
                     <ShieldAlert size={14} className={isHalted ? "text-magenta-cyber animate-pulse" : "text-white/40"} />
                     Risk Protocol
                  </h2>
                  <button 
                    onClick={() => handleSaveConfig("circuit:global", isHalted ? "OK" : "HALT")}
                    className={cn(
                      "w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] transition-all relative z-10 italic shadow-2xl",
                      isHalted 
                        ? "bg-magenta-cyber text-white shadow-[0_0_20px_rgba(255,0,128,0.5)] border border-white/20" 
                        : "bg-magenta-cyber/10 text-magenta-cyber hover:bg-magenta-cyber hover:text-white border border-magenta-cyber/30"
                    )}
                  >
                    {isHalted ? "Resume Operations" : "Suspend Operations"}
                  </button>
                  <div className="mt-6 flex items-center justify-between text-[9px] font-black uppercase tracking-widest italic">
                    <span className="text-white/40">Engine State:</span>
                    <span className={cn(isHalted ? "text-magenta-cyber animate-pulse" : "text-chart-green")}>
                       {isHalted ? "HALTED" : "NOMINAL"}
                    </span>
                  </div>
               </div>

               {/* Sport Concentration Monitor */}
               <div className="glass-card rounded-2xl border border-white/5 p-6 shadow-2xl h-[262px] flex flex-col">
                  <h2 className="text-xs font-black uppercase tracking-tight text-white italic mb-4 flex items-center gap-2">
                     <Target size={14} className="text-cyan-neon" />
                     Asset Concentration
                  </h2>
                  <div className="flex-1 space-y-5 overflow-y-auto pr-2 scrollbar-hide">
                     {[
                        { label: 'NFL FOOTBALL', val: stats?.exposure_cents.nfl || 0, limit: 1500000 },
                        { label: 'NBA BASKETBALL', val: stats?.exposure_cents.nba || 0, limit: 1500000 },
                        { label: 'MLB BASEBALL', val: stats?.exposure_cents.mlb || 0, limit: 1500000 },
                     ].map(item => {
                        const pct = Math.min((item.val / item.limit) * 100, 100);
                        return (
                           <div key={item.label} className="space-y-1.5">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest italic">
                                 <span className="text-white/40">{item.label}</span>
                                 <span className="text-white/80">{formatCurrency(item.val)}</span>
                              </div>
                              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                 <div 
                                    className={cn("h-full rounded-full transition-all duration-1000", pct > 80 ? "bg-magenta-cyber shadow-[0_0_10px_#FF0080]" : "bg-cyan-neon")} 
                                    style={{ width: `${pct}%` }} 
                                 />
                              </div>
                           </div>
                        )
                     })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 text-center">
                     <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] italic">Capacity Utilized: {(totalExp / 500000 * 100).toFixed(1)}%</span>
                  </div>
               </div>

               {/* Node Integrity Matrix */}
               <div className="glass-card rounded-2xl border border-white/5 p-6 shadow-2xl flex-1 flex flex-col bg-white/[0.01]">
                  <h2 className="text-xs font-black uppercase tracking-tight text-white italic mb-6 flex items-center gap-2">
                     <Server size={14} className="text-cyan-neon" />
                     Node Integrity Matrix
                  </h2>
                  <div className="space-y-5 font-mono text-[10px] uppercase font-black tracking-widest">
                    <div className="flex justify-between items-center group">
                      <span className="text-white/40 group-hover:text-white/60 transition-colors flex items-center gap-2">
                         <div className={cn("w-1 h-1 rounded-full", !stats ? "bg-magenta-cyber shadow-[0_0_5px_#FF0080]" : "bg-chart-green shadow-[0_0_5px_#00E676]")} />
                         Postgres
                      </span>
                      <span className={cn(!stats ? "text-magenta-cyber" : "text-chart-green")}>{!stats ? "FAIL" : "STABLE"}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-white/40 group-hover:text-white/60 transition-colors flex items-center gap-2">
                         <div className={cn("w-1 h-1 rounded-full", !stats ? "bg-magenta-cyber shadow-[0_0_5px_#FF0080]" : "bg-chart-green shadow-[0_0_5px_#00E676]")} />
                         Redis L1
                      </span>
                      <span className={cn(!stats ? "text-magenta-cyber" : "text-chart-green")}>{!stats ? "FAIL" : "STABLE"}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-white/40 group-hover:text-white/60 transition-colors flex items-center gap-2">
                         <div className={cn("w-1 h-1 rounded-full", (stats?.safety.error_count || 0) > 0 ? "bg-magenta-cyber shadow-[0_0_5px_#FF0080]" : "bg-chart-green shadow-[0_0_5px_#00E676]")} />
                         Safety
                      </span>
                      <span className={cn(stats?.safety.error_count === 0 ? "text-chart-green" : "text-warning")}>
                         {stats?.safety.error_count || 0} Issues
                      </span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-white/40 group-hover:text-white/60 transition-colors flex items-center gap-2">
                         <div className={cn("w-1 h-1 rounded-full", !stats ? "bg-magenta-cyber shadow-[0_0_5px_#FF0080]" : "bg-chart-green shadow-[0_0_5px_#00E676]")} />
                         Feed
                      </span>
                      <span className={cn(!stats ? "text-magenta-cyber" : "text-chart-green")}>
                         {!stats ? "OFFLINE" : `STABLE (${stats.safety.ws_latency_ms?.toFixed(0)}ms)`}
                      </span>
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
