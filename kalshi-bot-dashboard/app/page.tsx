"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Monitor, ShieldCheck, LogIn, ChevronRight, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#08080A] flex flex-col items-center justify-center p-6 font-display relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-neon opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative"
      >
        <div className="w-16 h-16 bg-cyan-neon/10 border border-cyan-neon/30 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(0,245,255,0.15)]">
          <Zap className="text-cyan-neon" size={32} />
        </div>
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          Kalshi RFQ Pro
        </h1>
        <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-[10px]">
          Next-Generation Liquidity Provisioning Bot
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full relative">
        {[
          { 
            label: "Authorization", 
            href: "/auth/login", 
            icon: LogIn, 
            desc: "Secure login & operator provisioning",
            color: "text-white/40 group-hover:text-cyan-neon"
          },
          { 
            label: "User Node", 
            href: "/user/dashboard", 
            icon: Monitor, 
            desc: "Individual bot monitoring & control",
            color: "text-white/40 group-hover:text-cyan-neon"
          },
          { 
            label: "Command Center", 
            href: "/admin/dashboard", 
            icon: ShieldCheck, 
            desc: "Global fleet monitoring & audit logs",
            color: "text-white/40 group-hover:text-magenta-cyber"
          },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={item.href} className="group glass-card p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center hover:border-white/10 transition-all hover:-translate-y-1 shadow-2xl h-full select-none">
              <div className={cn("p-4 rounded-2xl bg-white/[0.03] border border-white/5 mb-6 group-hover:scale-110 transition-transform", item.color)}>
                <item.icon size={28} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white mb-2 group-hover:text-white transition-colors">
                {item.label}
              </h2>
              <p className="text-[10px] font-bold text-neutral-500 leading-relaxed uppercase tracking-tight">
                {item.desc}
              </p>
              
              <div className="mt-8 flex items-center gap-1.5 text-[8px] font-black uppercase text-neutral-600 group-hover:text-neutral-400 transition-colors tracking-[0.2em]">
                Initialize Connection
                <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 flex items-center gap-4 text-[10px] font-mono text-white/10 uppercase tracking-[0.4em] pt-8 border-t border-white/[0.02] w-full max-w-lg justify-center">
        <span>ESTABLISHING SECURE_NODE...</span>
        <span className="w-1.5 h-1.5 bg-cyan-neon/20 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

// Utility for this specific file since it's the root
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
