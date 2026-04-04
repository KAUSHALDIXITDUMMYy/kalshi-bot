"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Lock, Mail, ArrowRight, UserPlus, LogIn, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen grid place-items-center bg-[#08080A] relative overflow-hidden font-display p-6">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-neon opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-magenta-cyber opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-[440px] z-10"
      >
        {/* Card Frame */}
        <div className="glass-card rounded-2xl border border-white/5 shadow-2xl overflow-hidden p-8 sm:p-10 relative">
          {/* Header */}
          <div className="space-y-3 mb-10 text-center relative">
            <div className="w-12 h-12 bg-cyan-neon/10 border border-cyan-neon/30 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              {isLogin ? <LogIn className="text-cyan-neon" size={24} /> : <UserPlus className="text-cyan-neon" size={24} />}
            </div>
            <motion.h1 
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold tracking-tight text-white"
            >
              {isLogin ? "Kalshi Terminal" : "Initialize Access"}
            </motion.h1>
            <p className="text-neutral-400 font-medium text-sm">
              {isLogin ? "Secure node connection required" : "Create your operator credentials"}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2 overflow-hidden"
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-cyan-neon transition-colors">
                    <LogIn size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Operator Name"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-neon/50 focus:ring-1 focus:ring-cyan-neon/20 transition-all font-mono text-sm uppercase tracking-wider"
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-cyan-neon transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="Operator Email"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-neon/50 focus:ring-1 focus:ring-cyan-neon/20 transition-all font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-cyan-neon transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="Access Code"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-neon/50 focus:ring-1 focus:ring-cyan-neon/20 transition-all font-mono text-sm"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full cyber-button flex items-center justify-center gap-2 text-background font-bold uppercase tracking-widest text-sm rounded-xl py-4 group active:scale-[0.98]"
            >
              {isLogin ? "Authorize Session" : "Deploy Credentials"}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-4 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/60 hover:text-cyan-neon transition-colors text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 font-bold"
            >
              {isLogin ? "Need operator access? Request now" : "Back to terminal authorization"}
              <ChevronRight size={14} />
            </button>
            
            {isLogin && (
              <button className="text-white/30 hover:text-white/50 transition-colors text-xs font-mono uppercase">
                Lost access code? Init Reset
              </button>
            )}
          </div>
        </div>

        {/* Status Decoration */}
        <div className="mt-8 flex items-center justify-between text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] px-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-neon rounded-full animate-pulse shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
            System Secure
          </div>
          <div>v2.4.0-Alpha</div>
          <div className="flex items-center gap-2">
            Node: US-EAST-1
            <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
