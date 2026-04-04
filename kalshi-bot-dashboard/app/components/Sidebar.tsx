"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Settings, 
  Activity, 
  ShieldAlert, 
  PieChart, 
  MessageSquareCode, 
  Power,
  Zap,
  Cpu,
  LogOut,
  ChevronRight,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/user/dashboard", active: true },
  { icon: Activity, label: "Bot Engine", href: "#" },
  { icon: PieChart, label: "Positions", href: "#" },
  { icon: ShieldAlert, label: "Risk Limits", href: "#" },
  { icon: Settings, label: "Terminal", href: "#" },
  { icon: MessageSquareCode, label: "Strategy", href: "#" },
];

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside className={cn("w-64 glass-card border-r border-white/5 flex flex-col p-6 z-50 h-screen sticky top-0", className)}>
      {/* Brand */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-cyan-neon/10 border border-cyan-neon/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.1)]">
          <Monitor className="text-cyan-neon" size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-white uppercase leading-none mb-1">Kalshi Pro</span>
          <span className="text-[10px] font-mono text-cyan-neon/60 tracking-widest uppercase">Operator Node</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => (
          <Link key={item.label} href={item.href}>
            <div className={cn(
              "flex items-center justify-between group px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden",
              item.active 
                ? "bg-cyan-neon/10 text-cyan-neon border border-cyan-neon/20 shadow-[0_4px_20px_rgba(0,245,255,0.1)]" 
                : "text-neutral-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
            )}>
              <div className="flex items-center gap-3.5 z-10 relative">
                <item.icon size={18} className={cn("transition-transform group-hover:scale-110", item.active && "drop-shadow-[0_0_5px_rgba(0,245,255,0.8)]")} />
                <span className="text-sm font-bold tracking-wide uppercase">{item.label}</span>
              </div>
              {item.active && <ChevronRight size={14} className="z-10" />}
              
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-neon/0 to-cyan-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </nav>

      {/* Account / Kill */}
      <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
        <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-neon to-magenta-cyber p-[1px]">
              <div className="w-full h-full bg-background rounded-xl flex items-center justify-center font-bold text-xs">
                OP
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white uppercase">Operator_01</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyan-neon rounded-full animate-pulse shadow-[0_0_5px_rgba(0,245,255,0.8)]" />
                <span className="text-[10px] font-bold text-cyan-neon uppercase">Live</span>
              </div>
            </div>
          </div>
        </div>
        
        <button className="w-full py-4 glass-card border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 group text-red-500/80 hover:text-red-500 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] font-bold">
          <Power size={14} className="group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_red] transition-all" />
          Terminate Session
        </button>
      </div>
    </aside>
  );
}
