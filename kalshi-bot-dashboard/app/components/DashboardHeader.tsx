"use client";

import { motion } from "framer-motion";
import { Zap, Signal, Activity, Settings, Bell, Search, Thermometer, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function DashboardHeader({ title }: { title: string }) {
  const [isPractice, setIsPractice] = useState(true);

  return (
    <header className="h-16 glass-card sticky top-0 border-b border-white/5 flex items-center justify-between px-6 z-40 bg-background/50 backdrop-blur-3xl shrink-0 gap-4">
      {/* Title & Status */}
      <motion.div 
        initial={{ opacity: 0, x: -10 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="flex items-center gap-4 min-w-0 flex-1"
      >
        <h1 className="text-base font-black tracking-tighter uppercase text-white truncate shrink-0 max-w-[150px] lg:max-w-none">
          {title}
        </h1>
        
        <div className="h-4 w-px bg-white/5 shrink-0" />

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-hidden shrink-0">
          <div className="flex items-center gap-2 px-3 py-1 bg-cyan-neon/5 border border-cyan-neon/10 rounded-lg">
            <div className="w-1 h-1 bg-cyan-neon rounded-full animate-pulse shadow-[0_0_8px_cyan]" />
            <span className="text-[9px] font-black text-cyan-neon uppercase tracking-widest leading-none whitespace-nowrap">WS: Connected</span>
            <div className="h-2 w-[1px] bg-white/10 mx-0.5" />
            <span className="text-[9px] font-mono text-cyan-neon/40 uppercase tracking-widest leading-none">12ms</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-magenta-cyber/5 border border-magenta-cyber/10 rounded-lg">
            <Activity className="text-magenta-cyber" size={10} />
            <span className="text-[9px] font-black text-magenta-cyber uppercase tracking-widest leading-none outline-none whitespace-nowrap">Engine: Nominal</span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Search */}
        <div className="relative group hidden xl:flex items-center">
          <Search className="absolute left-3 text-white/20 group-focus-within:text-cyan-neon transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="Search Command..." 
            className="h-9 w-48 bg-white/[0.03] border border-white/10 rounded-xl transition-all pl-9 pr-4 text-[10px] font-mono placeholder:text-white/20 focus:outline-none focus:border-cyan-neon/30 focus:w-64"
          />
        </div>

        {/* Practice Toggle */}
        <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-xl p-0.5 gap-0.5">
          <button 
            onClick={() => setIsPractice(true)}
            className={cn(
              "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
              isPractice ? "bg-cyan-neon text-black shadow-[0_0_15px_cyan/30]" : "text-white/20 hover:text-white/40"
            )}
          >
            Practice
          </button>
          <button 
            onClick={() => setIsPractice(false)}
            className={cn(
              "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
              !isPractice ? "bg-magenta-cyber text-white shadow-[0_0_15px_magenta/30]" : "text-white/20 hover:text-white/40"
            )}
          >
            Live
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-0.5">
          <button className="w-9 h-9 flex items-center justify-center text-white/20 hover:text-cyan-neon hover:bg-cyan-neon/5 rounded-xl transition-all">
            <Bell size={16} />
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-white/20 hover:text-cyan-neon hover:bg-cyan-neon/5 rounded-xl transition-all">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
