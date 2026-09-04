"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Activity,
  LayoutDashboard,
  UserCircle,
  CircleDollarSign,
  BookOpen,
  CheckSquare,
  History,
  LogOut,
  ChevronDown,
  Server,
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon,
  ChartNoAxesCombined
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const navigationGroups: { label: string; items: SidebarItem[] }[] = [
  { label: "Insights", items: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Forecasting", href: "/dashboard/forecast", icon: ChartNoAxesCombined },
  ]},
  { label: "Profile & data", items: [
    { name: "My Profile", href: "/dashboard/profile", icon: UserCircle },
    { name: "Financial Data", href: "/dashboard/financial", icon: CircleDollarSign },
    { name: "Study & Focus Data", href: "/dashboard/study", icon: BookOpen },
    { name: "Habits & Compliance", href: "/dashboard/habits", icon: CheckSquare },
  ]},
  { label: "Monitoring", items: [
    { name: "Active Alerts", href: "/dashboard/alerts", icon: Bell },
    { name: "Audit Trail", href: "/dashboard/audit", icon: History },
  ]},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [dbActive, setDbActive] = useState<boolean | null>(null);
  const [dbStatus, setDbStatus] = useState<string>("Connecting...");
  const [navOpen, setNavOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await axios.get(`${API_URL}/health`);
        if (res.data && res.data.database && res.data.database.includes("Active")) {
          setDbActive(true);
          setDbStatus("Connected & Syncing");
        } else {
          setDbActive(false);
          setDbStatus("Offline");
        }
      } catch (err) {
        setDbActive(false);
        setDbStatus("Offline");
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 8500);
    return () => clearInterval(interval);
  }, [API_URL]);

  const closeNav = () => setNavOpen(false);

  const Navigation = () => (
    <div className="flex flex-col h-full bg-surface/50 backdrop-blur-2xl border-r border-line/50">
      <div className="h-20 px-6 flex items-center gap-3 border-b border-line/50">
        <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white shadow-lg shadow-brand/20">
          <Activity size={20} />
        </div>
        <div>
          <h1 className="font-bold text-[15px] tracking-tight text-ink">Intelligence</h1>
          <span className="text-[11px] text-muted font-medium">Command Center</span>
        </div>
        <button onClick={closeNav} className="ml-auto lg:hidden p-2 text-muted hover:text-ink"><X size={20} /></button>
      </div>
      
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {navigationGroups.map((group) => (
        <div key={group.label} className="mb-5">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-muted">{group.label}</p>
          <div className="flex flex-col gap-1">
          {group.items.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={item.name}
              >
                <Link
                  href={item.href}
                  onClick={closeNav}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group relative overflow-hidden ${
                    isActive
                      ? "text-brand bg-brand/10 shadow-sm"
                      : "text-muted hover:bg-canvas hover:text-ink"
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute left-0 top-0 bottom-0 w-1 bg-brand rounded-r-full" 
                    />
                  )}
                  <Icon size={18} className={`relative z-10 transition-transform group-hover:scale-110 ${isActive ? "text-brand" : "text-muted"}`} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
          </div>
        </div>
        ))}
      </nav>

      <div className="p-4">
        <div className="p-4 rounded-2xl bg-canvas border border-line shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-50" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-surface border border-line flex items-center justify-center shrink-0">
              <Server size={18} className="text-brand" />
            </div>
            <div>
              <p className="text-[11px] text-muted font-semibold uppercase tracking-wider">System Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`relative flex h-2 w-2`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dbActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${dbActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </span>
                <span className="text-[12px] text-ink font-bold">
                  {dbStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas text-ink transition-colors duration-300">
      
      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {navOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNav} 
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm lg:hidden" 
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col transition-transform duration-300 lg:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Navigation />
      </aside>

      {/* Main Container */}
      <div className="min-h-screen lg:pl-[280px] flex flex-col relative z-10">
        
        {/* Top Header */}
        <header className="h-20 border-b border-line/50 bg-surface/50 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setNavOpen(true)} className="lg:hidden p-2 -ml-2 text-muted hover:text-ink transition-colors">
              <Menu size={24} />
            </button>
            <div>
              <span className="hidden sm:block text-xs font-semibold uppercase tracking-widest text-muted">Workspace</span>
              <h2 className="sm:hidden text-lg font-bold text-ink tracking-tight">Intelligence</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Functional Search */}
            <div className="relative group">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-canvas border border-line text-muted focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/50 transition-all">
                <Search size={14} className="text-muted group-focus-within:text-brand transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search overview, finance..." 
                  className="bg-transparent border-none outline-none text-xs text-ink w-48 placeholder-muted/70"
                />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface border border-line ml-2">⌘K</span>
              </div>
              <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-line/50 rounded-2xl shadow-2xl backdrop-blur-3xl opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-300 transform translate-y-2 group-focus-within:translate-y-0 p-2 z-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2 px-2">Quick Links</p>
                <div className="space-y-1">
                  <Link href="/dashboard" className="block px-3 py-2 text-xs font-medium text-ink hover:bg-brand/10 hover:text-brand rounded-lg transition-colors">Go to Intelligence Overview</Link>
                  <Link href="/dashboard/financial" className="block px-3 py-2 text-xs font-medium text-ink hover:bg-emerald-500/10 hover:text-emerald-500 rounded-lg transition-colors">Log Financial Entry</Link>
                  <Link href="/dashboard/habits" className="block px-3 py-2 text-xs font-medium text-ink hover:bg-violet-500/10 hover:text-violet-500 rounded-lg transition-colors">Check Habits Compliance</Link>
                  <Link href="/dashboard/forecast" className="block px-3 py-2 text-xs font-medium text-ink hover:bg-brand/10 hover:text-brand rounded-lg transition-colors">Open Forecasting</Link>
                </div>
              </div>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-2 text-muted hover:text-brand hover:bg-brand/10 rounded-full transition-all"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <Link href="/dashboard/alerts" aria-label="Open active alerts" className="relative p-2 text-muted hover:text-brand hover:bg-brand/10 rounded-full transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-surface" />
            </Link>
            
            <div className="h-8 w-px bg-line mx-1 hidden sm:block" />

            <Link href="/dashboard/profile" className="flex items-center gap-3 cursor-pointer group">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-ink leading-none mb-1 group-hover:text-brand transition-colors">{user?.name || "Operator"}</p>
                <p className="text-[10px] text-muted font-medium uppercase tracking-wider leading-none">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-violet-500 flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
                <span className="font-bold text-sm text-white">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "OP"}
                </span>
              </div>
            </Link>

            <button
              onClick={logout}
              className="p-2 ml-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 relative overflow-hidden">
          {/* Subtle page background decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[100px] pointer-events-none -z-10" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full relative z-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
