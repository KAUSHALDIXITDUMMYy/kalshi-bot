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
  Monitor,
  Globe,
  Users,
  History
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
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  const NAV_ITEMS = isAdmin ? [
    { icon: Globe, label: "Fleet Overview", href: "/admin/dashboard" },
    { icon: Users, label: "User Management", href: "/admin/users" },
    { icon: Activity, label: "Platform Intel", href: "/admin/intel" },
    { icon: ShieldAlert, label: "Global Risk", href: "/admin/risk" },
    { icon: Settings, label: "System Config", href: "/admin/config" },
  ] : [
    { icon: LayoutDashboard, label: "Node Terminal", href: "/user/dashboard" },
    { icon: Zap, label: "Manual Override", href: "/user/override" },
    { icon: Activity, label: "Live Bids", href: "/user/bids" },
    { icon: PieChart, label: "Session PnL", href: "/user/pnl" },
    { icon: History, label: "History", href: "/user/history" },
    { icon: MessageSquareCode, label: "Bot Logic", href: "/user/logic" },
  ];

  return (
    <aside className={cn("w-64 glass-card border-r border-white/5 flex flex-col p-6 z-50 h-screen sticky top-0", className)}>
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border",
          isAdmin ? "bg-magenta-cyber/10 border-magenta-cyber/30" : "bg-cyan-neon/10 border-cyan-neon/30"
        )}>
          {isAdmin ? <Cpu className="text-magenta-cyber" size={20} /> : <Monitor className="text-cyan-neon" size={20} /> }
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tighter text-white uppercase leading-none mb-1">
            {isAdmin ? "Fleet" : "Kalshi"} <span className={isAdmin ? "text-magenta-cyber" : "text-cyan-neon"}>{isAdmin ? "Cmd" : "Pro"}</span>
          </span>
          <span className="text-[9px] font-black font-mono text-white/20 tracking-[0.2em] uppercase">
            {isAdmin ? "Global Intelligence" : "Operator Node"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5">
        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 mb-4 px-4 italic">
          {isAdmin ? "Fleet Management" : "Node Operations"}
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href}>
              <div className={cn(
                "flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden border mb-1",
                isActive 
                  ? (isAdmin ? "bg-magenta-cyber/10 text-magenta-cyber border-magenta-cyber/20 shadow-[0_0_20px_rgba(255,0,255,0.1)]" : "bg-cyan-neon/10 text-cyan-neon border-cyan-neon/20 shadow-[0_0_20px_rgba(0,245,255,0.1)]")
                  : "text-white/30 hover:text-white hover:bg-white/[0.02] border-transparent"
              )}>
                <div className="flex items-center gap-3.5 z-10 relative">
                  <item.icon size={16} className={cn(
                    "transition-transform group-hover:scale-110", 
                    isActive && (isAdmin ? "drop-shadow-[0_0_5px_rgba(255,0,255,0.8)]" : "drop-shadow-[0_0_5px_rgba(0,245,255,0.8)]")
                  )} />
                  <span className="text-[11px] font-black tracking-wider uppercase">{item.label}</span>
                </div>
                {isActive && <div className={cn("w-1 h-1 rounded-full", isAdmin ? "bg-magenta-cyber shadow-[0_0_5px_magenta]" : "bg-cyan-neon shadow-[0_0_5px_cyan]")} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile & Footer */}
      <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
        <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-white/10 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-lg p-[1px]",
              isAdmin ? "bg-gradient-to-tr from-magenta-cyber to-purple-500" : "bg-gradient-to-tr from-cyan-neon to-blue-500"
            )}>
              <div className="w-full h-full bg-[#0A0A0C] rounded-[7px] flex items-center justify-center font-black text-[10px] text-white">
                {isAdmin ? "AD" : "OP"}
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black text-white uppercase truncate">{isAdmin ? "Admin_Root" : "Operator_01"}</span>
              <div className="flex items-center gap-1.5">
                <span className={cn("w-1 h-1 rounded-full animate-pulse", isAdmin ? "bg-magenta-cyber" : "bg-cyan-neon")} />
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{isAdmin ? "Auth: Root" : "Auth: Secure"}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button className="w-full py-4 text-white/20 hover:text-magenta-cyber bg-white/[0.02] hover:bg-magenta-cyber/5 border border-white/5 hover:border-magenta-cyber/20 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-[0.3em] text-[10px] font-black group">
          <Power size={14} className="group-hover:rotate-90 transition-transform duration-500" />
          Disconnect
        </button>
      </div>
    </aside>
  );
}
