"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Lock, Mail, ArrowRight, LogIn, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("Connection error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="glass-card rounded-[40px] border border-white/5 shadow-2xl overflow-hidden p-8 sm:p-12 relative bg-white/[0.01]">
          <div className="space-y-3 mb-12 text-center">
            <div className="w-16 h-16 bg-cyan-neon/10 border border-cyan-neon/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_20px_rgba(0,245,255,0.2)]">
              <LogIn className="text-cyan-neon" size={28} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              Kalshi <span className="text-cyan-neon">Cmd</span>
            </h1>
            <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-[0.3em] italic">
              Administrative Authorization
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-magenta-cyber/10 border border-magenta-cyber/20 rounded-2xl text-magenta-cyber text-[10px] font-black uppercase tracking-widest text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/20 group-focus-within:text-cyan-neon transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="OPERATOR EMAIL"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-neon/50 focus:ring-1 focus:ring-cyan-neon/20 transition-all font-mono text-xs uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/20 group-focus-within:text-cyan-neon transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ACCESS CODE"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-neon/50 focus:ring-1 focus:ring-cyan-neon/20 transition-all font-mono text-xs uppercase tracking-widest"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full cyber-button flex items-center justify-center gap-3 text-background font-black uppercase tracking-[0.3em] text-xs rounded-2xl py-5 group active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-[0_0_20px_rgba(0,245,255,0.2)]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Establish Connection
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] leading-relaxed italic">
              Secure administrative access restricted to verified cluster operators.
            </p>
          </div>
        </div>

        {/* Status Footer */}
        <div className="mt-8 flex items-center justify-between text-[9px] font-mono text-white/10 uppercase tracking-[0.3em] px-4 italic">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-neon rounded-full animate-pulse shadow-[0_0_8px_#00F5FF]" />
            Node Secure
          </div>
          <div>v2.4-SECURE</div>
        </div>
      </motion.div>
    </div>
  );
}
