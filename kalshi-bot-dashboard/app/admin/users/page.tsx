"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  Zap, 
  Trash2,
  Lock,
  Pause,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardHeader } from "@/app/components/DashboardHeader";

const USERS_LIST = [
  { id: "UID-8012", name: "Alpha_Trader_99", status: "ACTIVE", type: "PREMIUM", profit: "+$12.4k", daysLeft: 12, uptime: "99.9%" },
  { id: "UID-8015", name: "Quantum_Node", status: "DORMANT", type: "TRIAL", profit: "+$45.8k", daysLeft: 1, uptime: "12.4%" },
  { id: "UID-8018", name: "Bravo_Strategic", status: "ACTIVE", type: "ENTERPRISE", profit: "+$2.1k", daysLeft: 28, uptime: "100%" },
  { id: "UID-8021", name: "Delta_Fleet_5", status: "ALERT", type: "PREMIUM", profit: "+$850", daysLeft: 15, uptime: "88.2%" },
  { id: "UID-8024", name: "Echo_Protocol", status: "ACTIVE", type: "ENTERPRISE", profit: "+$6.2k", daysLeft: 30, uptime: "99.8%" },
];

export default function UserManagementPage() {
  return (
    <div className="flex bg-[#08080A] text-foreground min-h-screen font-display">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto h-screen scrollbar-hide">
        <DashboardHeader title="Node Operator Management" />
        
        <div className="p-10 space-y-10 max-w-7xl mx-auto">
          {/* User Metrics Overview */}
          <div className="grid grid-cols-3 gap-6">
             <div className="glass-card p-8 rounded-[32px] border-white/5 flex flex-col gap-3 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Total Subscribers</span>
                <div className="flex items-baseline gap-4">
                   <h2 className="text-4xl font-black text-white tracking-tighter">1,242</h2>
                   <span className="text-[10px] font-black px-2 py-1 bg-magenta-cyber/10 text-magenta-cyber rounded-lg border border-magenta-cyber/20">+12.4% MoM</span>
                </div>
             </div>
             <div className="glass-card p-8 rounded-[32px] border-white/5 flex flex-col gap-3 relative overflow-hidden group">
                <div className="absolute inset-0 bg-magenta-cyber/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Active Fleet Nodes</span>
                <div className="flex items-baseline gap-4">
                   <h2 className="text-4xl font-black text-magenta-cyber tracking-tighter">852</h2>
                   <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">/ 1,242 total</span>
                </div>
             </div>
             <div className="glass-card p-8 rounded-[32px] border-white/5 flex flex-col gap-3 relative overflow-hidden group">
                <div className="absolute inset-0 bg-chart-red/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Expiring Slots (72h)</span>
                <div className="flex items-baseline gap-4">
                   <h2 className="text-4xl font-black text-chart-red tracking-tighter">42</h2>
                   <span className="text-[10px] font-black px-2 py-1 bg-chart-red/10 text-chart-red rounded-lg border border-chart-red/20 uppercase tracking-widest">Action</span>
                </div>
             </div>
          </div>

          {/* User Search Bar */}
          <div className="flex items-center justify-between glass-card p-6 rounded-[32px] border-white/5 shadow-2xl">
            <div className="relative flex-1 max-w-xl">
              <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                type="text" 
                placeholder="Search by UserID, NodeID, or Identity..." 
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-8 text-sm font-bold text-white outline-none focus:border-magenta-cyber/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[11px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-all">
                <Filter size={14} /> Global Filters
              </button>
              <button className="px-8 py-4 bg-magenta-cyber text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:scale-[1.02] transition-all">
                Add New Seat
              </button>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[40px] border-white/5 overflow-hidden shadow-2xl relative"
          >
            <div className="px-10 py-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <Users size={20} className="text-magenta-cyber" />
                 <h2 className="text-lg font-black uppercase tracking-tight text-white leading-none italic">Subscribed Fleet Nodes</h2>
              </div>
              <ShieldCheck size={18} className="text-white/20" />
            </div>
            
            <div className="p-0 overflow-x-auto overflow-y-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.01]">
                    <th className="px-10 py-6 text-[10px] font-black uppercase text-white/20 tracking-widest">Operator Identity</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase text-white/20 tracking-widest text-center">Status</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase text-white/20 tracking-widest text-center">Plan Tier</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase text-white/20 tracking-widest text-center font-mono">Net PnL</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase text-white/20 tracking-widest text-center">License Remaining</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase text-white/20 tracking-widest text-right">Node Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {USERS_LIST.map((user, i) => (
                    <tr key={i} className="group hover:bg-white/[0.01] transition-colors border-l-4 border-transparent hover:border-magenta-cyber/40">
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-white/80">{user.name}</span>
                           <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{user.id} • {user.uptime} Uptime</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center uppercase tracking-widest italic font-black text-[10px]">
                        <span className={cn(
                          "px-3 py-1 rounded-full border bg-white/[0.02]",
                          user.status === "ACTIVE" ? "text-cyan-neon border-cyan-neon/30" : 
                          user.status === "ALERT" ? "text-magenta-cyber border-magenta-cyber/30 animate-pulse" : "text-white/10 border-white/5"
                        )}>{user.status}</span>
                      </td>
                      <td className="px-10 py-8 text-center text-[11px] font-black text-white/40 uppercase tracking-widest">
                         {user.type}
                      </td>
                      <td className="px-10 py-8 text-center font-black text-chart-green text-sm font-mono">
                         {user.profit}
                      </td>
                      <td className="px-10 py-8 text-center">
                         <div className="flex flex-col items-center gap-2">
                           <span className={cn(
                             "text-[10px] font-black tracking-widest uppercase",
                             user.daysLeft <= 5 ? "text-magenta-cyber" : "text-white/20"
                           )}>{user.daysLeft} DAYS</span>
                           <div className="w-24 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(user.daysLeft/31)*100}%` }} className={cn("h-full", user.daysLeft <= 5 ? "bg-magenta-cyber" : "bg-cyan-neon/60")} />
                           </div>
                         </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <div className="flex items-center justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                            <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-white transition-colors">
                               {user.status === "ACTIVE" ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                            <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-magenta-cyber transition-colors">
                               <Lock size={16} />
                            </button>
                            <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-chart-red transition-colors">
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
