"use client";

import { motion } from "framer-motion";
import { 
  Settings, 
  Terminal, 
  Lock, 
  ShieldCheck, 
  Key, 
  Cpu, 
  Database, 
  Zap, 
  Save, 
  RotateCcw,
  CloudLightning,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardHeader } from "@/app/components/DashboardHeader";
import { useState } from "react";

export default function AdminConfigPage() {
  const [activeTab, setActiveTab] = useState("ORCHESTRATOR");

  return (
    <div className="flex bg-[#08080A] text-foreground min-h-screen font-display">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto h-screen scrollbar-hide">
        <DashboardHeader title="Fleet Orchestrator Configuration" />
        
        <div className="p-10 space-y-10 max-w-7xl mx-auto">
          {/* Orchestrator Health Header */}
          <div className="glass-card p-10 rounded-[40px] border-white/5 bg-white/[0.01] flex items-center justify-between shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-magenta-cyber/5 opacity-0 group-hover:opacity-100 transition-opacity blur-[80px]" />
            <div className="flex items-center gap-12 relative z-10">
               <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-white">
                     <Cpu size={22} className="text-magenta-cyber" />
                     <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Global Control Kernel</h3>
                  </div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-relaxed mt-1">Managing 852 nodes across 4 cluster availability zones.</p>
               </div>
               <div className="h-14 w-px bg-white/5" />
               <div className="flex gap-12">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-white/10 uppercase tracking-widest mb-1">Fleet Sync Latency</span>
                     <span className="text-lg font-black text-cyan-neon uppercase font-mono tracking-tighter">0.4 ms Peak</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-white/10 uppercase tracking-widest mb-1">Hash Integrity</span>
                     <span className="text-lg font-black text-chart-green uppercase tracking-tighter">Verified: L1_v9</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-4 relative z-10">
               <button className="flex items-center gap-2 px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[11px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-all">
                  <RotateCcw size={14} /> Reset Fleet
               </button>
               <button className="flex items-center gap-2 px-10 py-4 bg-magenta-cyber text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:scale-[1.02] transition-all">
                  <Save size={14} /> Commit
               </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Master Navigation Controls */}
            <div className="col-span-3 flex flex-col gap-3">
              {[
                { id: "ORCHESTRATOR", label: "Fleet Orchestrator", icon: Settings },
                { id: "BOT_DEFAULTS", label: "Kernel Defaults", icon: Cpu },
                { id: "API_GATEWAY", label: "Gateway Matrix", icon: CloudLightning },
                { id: "IDENTITY", label: "Identity & Keys", icon: Key },
                { id: "DATA", label: "Market Databases", icon: Database },
                { id: "MONITOR", label: "Monitor Config", icon: Monitor },
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-left group italic overflow-hidden relative",
                    activeTab === tab.id 
                      ? "bg-magenta-cyber/10 border-magenta-cyber/20 text-magenta-cyber shadow-[0_0_20px_rgba(255,0,128,0.1)]" 
                      : "bg-white/[0.01] border-white/5 text-white/40 hover:text-white hover:bg-white/[0.03]"
                  )}
                >
                  <tab.icon size={18} className={cn("transition-transform group-hover:rotate-12", activeTab === tab.id ? "drop-shadow-[0_0_5px_rgba(255,0,128,0.8)]" : "opacity-40")} />
                  <span className="text-[11px] font-black uppercase tracking-widest leading-none">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Config Panels */}
            <div className="col-span-9">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-[40px] border-white/5 p-12 shadow-2xl h-full min-h-[600px] relative overflow-hidden"
              >
                {activeTab === "ORCHESTRATOR" && (
                  <div className="space-y-12">
                    <div className="flex items-center justify-between">
                       <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">{activeTab} Environment</h2>
                       <div className="px-4 py-1.5 rounded-full bg-magenta-cyber/10 border border-magenta-cyber/20 text-magenta-cyber text-[10px] font-black uppercase tracking-widest">Master Node: Primary Zone</div>
                    </div>

                    <div className="grid grid-cols-2 gap-12">
                      {/* Global API Rate Limit */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-black uppercase tracking-widest text-white/40">Global Rate Limit</label>
                          <span className="text-xs font-mono font-black text-magenta-cyber italic">10k req/s</span>
                        </div>
                        <div className="relative w-full h-8 flex items-center group">
                          <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                             <div className="w-[85%] h-full bg-magenta-cyber/60 blur-[3px]" />
                          </div>
                          <div className="absolute left-[85%] top-1/2 -translate-y-1/2 w-4 h-4 bg-magenta-cyber rounded-full border-4 border-[#08080A] shadow-[0_0_20px_rgba(255,0,128,1)] cursor-pointer" />
                        </div>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">Aggregated request limit across all active node clusters.</p>
                      </div>

                      {/* Cluster Redundancy */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-black uppercase tracking-widest text-white/40">Node Redundancy Target</label>
                          <span className="text-xs font-mono font-black text-magenta-cyber italic">3:1 Failover</span>
                        </div>
                        <div className="relative w-full h-8 flex items-center group">
                          <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                             <div className="w-[60%] h-full bg-cyan-neon/40 blur-[3px]" />
                          </div>
                          <div className="absolute left-[60%] top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-neon rounded-full border-4 border-[#08080A] shadow-[0_0_20px_rgba(0,245,255,1)] cursor-pointer" />
                        </div>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">Target ratio of standby backup nodes to active production nodes.</p>
                      </div>

                      <div className="col-span-2 space-y-6">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Automated Orchestration Rules</h4>
                         <div className="grid grid-cols-2 gap-4">
                            {[
                               { label: "Auto-Scale on Market Volatility", active: true },
                               { label: "Predictive Cluster Pre-warming", active: false },
                               { label: "Adaptive API Load Balancing", active: true },
                               { label: "Self-Healing Kernel Restarts", active: true },
                            ].map((rule) => (
                               <div key={rule.label} className="p-6 bg-white/[0.02] border border-white/5 rounded-[24px] flex items-center justify-between group hover:border-magenta-cyber/30 transition-all cursor-pointer">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{rule.label}</span>
                                  <div className={cn(
                                    "w-10 h-5 rounded-full relative transition-all",
                                    rule.active ? "bg-magenta-cyber/20 border border-magenta-cyber/40" : "bg-white/[0.05] border border-white/10"
                                  )}>
                                     <div className={cn(
                                       "absolute top-1 w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,1)]",
                                       rule.active ? "right-1 bg-magenta-cyber" : "left-1 bg-white/20"
                                     )} />
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                {(activeTab === "IDENTITY" || activeTab === "BOT_DEFAULTS" || activeTab === "API_GATEWAY") && (
                   <div className="flex flex-col items-center justify-center h-full text-center space-y-8 italic">
                      <div className="w-24 h-24 bg-magenta-cyber/5 border-2 border-magenta-cyber/20 rounded-[40px] flex items-center justify-center text-magenta-cyber relative overflow-hidden group">
                         <div className="absolute inset-0 bg-magenta-cyber opacity-10 blur-[20px] group-hover:opacity-30 transition-opacity" />
                         <Lock size={40} className="relative z-10" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Security Authorization Required</h3>
                        <p className="text-[10px] font-extrabold text-white/20 max-w-sm uppercase tracking-[0.3em] leading-relaxed">Modify sensitive cryptographc identities or kernel defaults requires Dual-Root hardware key validation.</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <button className="px-8 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Submit Audit Request</button>
                      </div>
                   </div>
                )}
                
                {(activeTab === "DATA" || activeTab === "MONITOR") && (
                   <div className="flex flex-col items-center justify-center h-full text-center space-y-8 italic">
                      <div className="w-24 h-24 bg-white/[0.02] border-2 border-white/5 rounded-[40px] flex items-center justify-center text-white/10 animate-pulse">
                         <Terminal size={40} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-white/20 uppercase tracking-tighter lowercase">Stage_L3_Development...</h3>
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">Core data sync protocols remaining integration status.</p>
                      </div>
                   </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
