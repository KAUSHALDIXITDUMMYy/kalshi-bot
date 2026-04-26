"use client";

import { motion } from "framer-motion";
import { Zap, Signal, Activity, Settings, Bell, Search, Thermometer, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function DashboardHeader({ 
  title, 
  latency = "...", 
  status = "OPERATIONAL" 
}: { 
  title: string;
  latency?: string | number | null;
  status?: string;
}) {
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
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 border rounded-lg",
            status === "DISCONNECTED" ? "bg-magenta-cyber/5 border-magenta-cyber/10" : "bg-cyan-neon/5 border-cyan-neon/10"
          )}>
            <div className={cn("w-1 h-1 rounded-full", status === "DISCONNECTED" ? "bg-magenta-cyber" : "bg-cyan-neon animate-pulse shadow-[0_0_8px_cyan]")} />
            <span className={cn("text-[9px] font-black uppercase tracking-widest leading-none whitespace-nowrap", status === "DISCONNECTED" ? "text-magenta-cyber" : "text-cyan-neon")}>
              {status === "DISCONNECTED" ? "Connection: Disconnected" : "Connection: Active"}
            </span>
            <div className="h-2 w-[1px] bg-white/10 mx-0.5" />
            <span className={cn("text-[9px] font-mono uppercase tracking-widest leading-none", status === "DISCONNECTED" ? "text-magenta-cyber/40" : "text-cyan-neon/40")}>
              {status === "DISCONNECTED" ? "---" : `${latency}ms`}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-magenta-cyber/5 border border-magenta-cyber/10 rounded-lg">
            <Activity className="text-magenta-cyber" size={10} />
            <span className="text-[9px] font-black text-magenta-cyber uppercase tracking-widest leading-none outline-none whitespace-nowrap">Engine: {status}</span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4 shrink-0">
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
