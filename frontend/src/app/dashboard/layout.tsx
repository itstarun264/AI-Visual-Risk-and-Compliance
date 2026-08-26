"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  ScanEye,
  LayoutDashboard,
  UserCircle,
  CircleDollarSign,
  BookOpen,
  CheckSquare,
  History,
  Eye,
  LogOut,
  ChevronDown,
  Server,
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const sidebarItems: SidebarItem[] = [
  { name: "Intelligence Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "User Profiling", href: "/dashboard/profile", icon: UserCircle },
  { name: "Financial Data", href: "/dashboard/financial", icon: CircleDollarSign },
  { name: "Study & Focus Data", href: "/dashboard/study", icon: BookOpen },
  { name: "Habits & Compliance", href: "/dashboard/habits", icon: CheckSquare },
  { name: "PostgreSQL Audit Trail", href: "/dashboard/audit", icon: History },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [dbActive, setDbActive] = useState<boolean | null>(null);
  const [dbStatus, setDbStatus] = useState<string>("Connecting...");
  const [navOpen, setNavOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  // Check Database health status dynamically
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await axios.get(`${API_URL}/health`);
        if (res.data && res.data.database && res.data.database.includes("Active")) {
          setDbActive(true);
          setDbStatus(res.data.database);
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
    // Poll health status every 8.5 seconds
    const interval = setInterval(checkHealth, 8500);
    return () => clearInterval(interval);
  }, [API_URL]);

  const closeNav = () => setNavOpen(false);
  const Navigation = () => (
    <>
      <div className="h-[88px] px-5 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
          <ScanEye className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-[15px] tracking-tight text-slate-900 dark:text-slate-100">Vantage AI</h1>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Risk intelligence</span>
        </div>
        <button onClick={closeNav} className="ml-auto lg:hidden p-2 text-slate-500 dark:text-slate-400" aria-label="Close navigation"><X className="w-5 h-5" /></button>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.13em] text-slate-400 dark:text-slate-500">Workspace</p>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeNav}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                {item.name}
              </Link>
            );
          })}
      </nav>
      <div className="m-3 mt-0 p-3.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-center shrink-0">
              <Server className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Database status</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    dbActive === true
                    ? "bg-emerald-500"
                      : dbActive === false
                      ? "bg-rose-500"
                      : "bg-amber-500 animate-pulse"
                  }`}
                />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                  {dbStatus}
                </span>
              </div>
            </div>
          </div>
      </div>
    </>
  );

  return (
    <div className="app-shell min-h-screen bg-[#f6f8fb] text-slate-900 dark:bg-[#070c17] dark:text-slate-100 transition-colors duration-300">
      {navOpen && <button onClick={closeNav} className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" aria-label="Close navigation overlay" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col bg-white border-r border-slate-200 dark:bg-slate-950 dark:border-slate-800 transition-transform lg:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Navigation />
      </aside>

      {/* Main Container */}
      <div className="min-h-screen lg:pl-[272px] flex flex-col">
        <header className="h-[72px] border-b border-slate-200 dark:border-slate-800 bg-white/90 backdrop-blur dark:bg-slate-950/90 px-4 sm:px-7 flex items-center justify-between sticky top-0 z-20">
          <div>
            <button onClick={() => setNavOpen(true)} className="mr-3 align-middle lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400" aria-label="Open navigation"><Menu className="w-5 h-5" /></button>
            <span className="hidden sm:inline text-[12px] text-slate-500 dark:text-slate-400">Risk & compliance workspace</span>
            <h2 className="inline sm:hidden text-sm font-bold text-slate-900 dark:text-slate-100">Vantage AI</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 text-slate-400 dark:text-slate-500"><Search className="w-4 h-4" /><span className="text-xs">Search</span></div>
            
            <button
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 rounded-lg transition-all"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <button className="p-2.5 text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 rounded-lg" aria-label="Notifications"><Bell className="w-4 h-4" /></button>
            
            <div className="flex items-center gap-2.5 sm:bg-slate-50 sm:border sm:border-slate-200 dark:sm:bg-slate-900/50 dark:sm:border-slate-800 px-1 sm:px-2 py-1 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-[11px] text-indigo-700 dark:text-indigo-400">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "AM"}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">{user?.name || "Inspector"}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 hidden sm:block" />
            </div>

            <button
              onClick={logout}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-rose-950/30 dark:hover:border-rose-900/50 transition-all text-slate-400 dark:text-slate-500 hover:text-rose-500"
              title="Logout session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-7 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
