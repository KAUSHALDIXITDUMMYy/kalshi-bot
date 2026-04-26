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
  History,
  FileCheck,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const NAV_ITEMS = [
  { id: "overview", icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { id: "risk", icon: ShieldAlert, label: "Risk Hub", href: "/dashboard?tab=risk" },
  { id: "config", icon: MessageSquareCode, label: "Strategy", href: "/dashboard?tab=config" },
  { id: "audit", icon: FileCheck, label: "Audit Log", href: "/dashboard?tab=audit" },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside className={cn("w-64 glass-card border-r border-white/5 flex flex-col p-6 z-50 h-screen sticky top-0", className)}>
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border bg-cyan-neon/10 border-cyan-neon/30">
          <Monitor className="text-cyan-neon" size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tighter text-white uppercase leading-none mb-1">
            Kalshi <span className="text-cyan-neon">Cmd</span>
          </span>
          <span className="text-[9px] font-black font-mono text-white/20 tracking-[0.2em] uppercase">
            Bot Command Suite
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5">
        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 mb-4 px-4 italic">
          Operations Hub
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <Link key={item.label} href={item.href}>
              <div className={cn(
                "flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden border mb-1",
                isActive 
                  ? "bg-cyan-neon/10 text-cyan-neon border-cyan-neon/20 shadow-[0_0_20px_rgba(0,245,255,0.1)]"
                  : "text-white/30 hover:text-white hover:bg-white/[0.02] border-transparent"
              )}>
                <div className="flex items-center gap-3.5 z-10 relative">
                  <item.icon size={16} className={cn(
                    "transition-transform group-hover:scale-110", 
                    isActive && "drop-shadow-[0_0_5px_rgba(0,245,255,0.8)]"
                  )} />
                  <span className="text-[11px] font-black tracking-wider uppercase italic">{item.label}</span>
                </div>
                {isActive && <div className="w-1 h-1 rounded-full bg-cyan-neon shadow-[0_0_5px_cyan]" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile & Footer */}
      <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
        <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-white/10 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg p-[1px] bg-gradient-to-tr from-cyan-neon to-blue-500">
              <div className="w-full h-full bg-[#0A0A0C] rounded-[7px] flex items-center justify-center font-black text-[10px] text-white">
                OP
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black text-white uppercase truncate">Bot_Operator_01</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full animate-pulse bg-cyan-neon" />
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest italic">Encrypted</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full py-4 text-white/20 hover:text-magenta-cyber bg-white/[0.02] hover:bg-magenta-cyber/5 border border-white/5 hover:border-magenta-cyber/20 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-[0.3em] text-[10px] font-black group"
        >
          <Power size={14} className="group-hover:rotate-90 transition-transform duration-500" />
          Disconnect
        </button>
      </div>
    </aside>
  );
}
