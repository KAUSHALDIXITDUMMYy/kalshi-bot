"use client";

import { motion } from "framer-motion";
import { Zap, Signal, Activity, Settings, Bell, Search, Thermometer, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function DashboardHeader({ title }: { title: string }) {
  const [isPractice, setIsPractice] = useState(true);

  return (
    <header className="h-20 glass-card sticky top-0 border-b border-white/5 flex items-center justify-between px-8 z-40 bg-background/50 backdrop-blur-3xl shrink-0">
      {/* Title & Status */}
      <motion.div 
        initial={{ opacity: 0, x: -10 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="flex items-center gap-8 min-w-0"
      >
        <h1 className="text-lg font-black tracking-tighter uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] whitespace-nowrap shrink-0">
          {title}
        </h1>
        
        <div className="h-6 w-px bg-white/5 shrink-0" />

        {/* Status Pills */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-cyan-neon/5 border border-cyan-neon/20 rounded-xl">
            <div className="w-1.5 h-1.5 bg-cyan-neon rounded-full animate-pulse shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
            <span className="text-[10px] font-black text-cyan-neon uppercase tracking-widest leading-none">WebSocket: Connected</span>
            <div className="h-3 w-[1px] bg-white/10 mx-0.5" />
            <span className="text-[10px] font-mono text-cyan-neon/60 uppercase tracking-widest leading-none">12ms</span>
          </div>
          
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-magenta-cyber/5 border border-magenta-cyber/20 rounded-xl">
            <Activity className="text-magenta-cyber" size={12} />
            <span className="text-[10px] font-black text-magenta-cyber uppercase tracking-widest leading-none outline-none">Bot Engine: Nominal</span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group flex items-center">
          <Search className="absolute left-3.5 text-white/20 group-focus-within:text-cyan-neon transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Command Search..." 
            className="h-10 w-64 bg-white/[0.03] border border-white/10 rounded-xl transition-all pl-10 pr-4 text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-cyan-neon/30 focus:w-80"
          />
        </div>

        {/* Practice Toggle */}
        <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-xl p-1 gap-1">
          <button 
            onClick={() => setIsPractice(true)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all px-6",
              isPractice ? "bg-cyan-neon text-background shadow-[0_0_15px_rgba(0,245,255,0.4)]" : "text-white/40 hover:text-white/60"
            )}
          >
            Practice
          </button>
          <button 
            onClick={() => setIsPractice(false)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all px-6",
              !isPractice ? "bg-magenta-cyber text-white shadow-[0_0_15px_rgba(255,0,128,0.4)]" : "text-white/40 hover:text-white/60"
            )}
          >
            Live
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1">
          <button className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-cyan-neon hover:bg-cyan-neon/10 rounded-xl transition-all">
            <Bell size={20} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-cyan-neon hover:bg-cyan-neon/10 rounded-xl transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
