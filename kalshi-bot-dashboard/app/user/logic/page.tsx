"use client";

import { motion } from "framer-motion";
import { 
  Settings2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Info, 
  Lock, 
  Terminal,
  Cpu,
  Save,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardHeader } from "@/app/components/DashboardHeader";
import { useState } from "react";

export default function LogicPage() {
  const [activeTab, setActiveTab] = useState("STRATEGY");

  return (
    <div className="flex bg-[#08080A] text-foreground min-h-screen font-display">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto h-screen scrollbar-hide">
        <DashboardHeader title="Bot Intelligence Configuration" />
        
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Quick Stats / Health */}
          <div className="flex items-center justify-between glass-card p-6 rounded-[32px] border-white/5 shadow-2xl">
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Engine Kernel</span>
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-cyan-neon" />
                  <span className="text-sm font-black text-white">v2.4.1-STABLE</span>
                </div>
              </div>
              <div className="h-8 w-px bg-white/5" />
              <div className="flex flex-col text-center">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Quote Propagation</span>
                <span className="text-sm font-black text-chart-green font-mono">1.2ms Avg</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white/40 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest">
                 <RotateCcw size={14} /> Reset Defaults
              </button>
              <button className="flex items-center gap-2 px-8 py-3 bg-cyan-neon text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,245,255,0.2)] hover:scale-[1.02] transition-all">
                 <Save size={14} /> Commit Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar Controls */}
            <div className="col-span-3 flex flex-col gap-2">
              {[
                { id: "STRATEGY", label: "Pricing Strategy", icon: Layers },
                { id: "RISK", label: "Risk Mitigation", icon: ShieldCheck },
                { id: "EXECUTION", label: "Execution Layer", icon: Zap },
                { id: "ADVANCED", label: "Kernel Tuning", icon: Terminal },
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-left group",
                    activeTab === tab.id 
                      ? "bg-cyan-neon/10 border-cyan-neon/20 text-cyan-neon shadow-[0_0_15px_rgba(0,245,255,0.1)]" 
                      : "bg-white/[0.01] border-white/5 text-white/40 hover:text-white hover:bg-white/[0.03]"
                  )}
                >
                  <tab.icon size={18} className={cn("transition-transform group-hover:scale-110", activeTab === tab.id ? "drop-shadow-[0_0_5px_rgba(0,245,255,0.8)]" : "opacity-40")} />
                  <span className="text-[11px] font-black uppercase tracking-widest leading-none">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Main Config Panel */}
            <div className="col-span-9">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-[40px] border-white/5 p-10 shadow-2xl h-full min-h-[500px]"
              >
                {activeTab === "STRATEGY" && (
                  <div className="space-y-10">
                    <div className="flex items-center justify-between">
                       <h2 className="text-xl font-black text-white tracking-tight uppercase italic">{activeTab} Parameters</h2>
                       <div className="px-3 py-1 rounded-full bg-cyan-neon/10 border border-cyan-neon/20 text-cyan-neon text-[9px] font-black uppercase tracking-widest">Optimized for Latency</div>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                      {/* Price Skew */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-black uppercase tracking-widest text-white/40">Market Bid Skew</label>
                          <span className="text-xs font-mono font-black text-cyan-neon">0.12 pts</span>
                        </div>
                        <div className="relative w-full h-8 flex items-center group">
                          <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                             <div className="w-[60%] h-full bg-cyan-neon/40 blur-[2px]" />
                          </div>
                          <div className="absolute left-[60%] top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-neon rounded-full border-4 border-[#08080A] shadow-[0_0_10px_rgba(0,245,255,1)] cursor-pointer" />
                        </div>
                        <p className="text-[9px] font-bold text-white/20 italic">Shifts your active quotes toward the prevailing market bid.</p>
                      </div>

                      {/* Spread Width */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-black uppercase tracking-widest text-white/40">Target Spread Width</label>
                          <span className="text-xs font-mono font-black text-cyan-neon">0.05 pts</span>
                        </div>
                        <div className="relative w-full h-8 flex items-center group">
                          <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                             <div className="w-[30%] h-full bg-magenta-cyber/40 blur-[2px]" />
                          </div>
                          <div className="absolute left-[30%] top-1/2 -translate-y-1/2 w-4 h-4 bg-magenta-cyber rounded-full border-4 border-[#08080A] shadow-[0_0_10px_rgba(255,0,128,1)] cursor-pointer" />
                        </div>
                        <p className="text-[9px] font-bold text-white/20 italic">Maintain tight spread profiles to capture maximum volume.</p>
                      </div>

                      <div className="col-span-2 p-6 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                         <div className="flex items-center gap-3">
                            <Info size={16} className="text-cyan-neon/40" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-none">Automated Re-pricing Logic</h4>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white/40">Dynamic Spread Expansion on Volatility</span>
                            <div className="w-12 h-6 bg-cyan-neon/20 border border-cyan-neon/30 rounded-full relative cursor-pointer">
                               <div className="absolute right-1 top-1 w-4 h-4 bg-cyan-neon rounded-full shadow-[0_0_10px_cyan]" />
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "RISK" && (
                   <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                      <div className="w-20 h-20 bg-magenta-cyber/5 border border-magenta-cyber/20 rounded-full flex items-center justify-center text-magenta-cyber relative">
                         <Lock size={32} />
                         <div className="absolute inset-0 bg-magenta-cyber animate-ping opacity-10 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Access Restricted</h3>
                        <p className="text-xs font-bold text-white/20 max-w-xs uppercase tracking-widest leading-relaxed">Risk parameters require L-2 credentials or hardware key override to modify.</p>
                      </div>
                   </div>
                )}

                {(activeTab === "EXECUTION" || activeTab === "ADVANCED") && (
                   <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                      <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center text-white/10 group">
                         <Terminal size={32} className="group-hover:text-cyan-neon transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-md font-black text-white/40 uppercase tracking-widest">Protocol Staging...</h3>
                        <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.3em]">Module implementation pending backend verification.</p>
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
