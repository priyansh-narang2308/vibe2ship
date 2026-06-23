"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Map, LayoutDashboard, Trophy, Sparkles } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Report Issue", href: "/report", icon: ShieldAlert },
    { name: "Issues Map", href: "/map", icon: Map },
    { name: "Admin Portal", href: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-indigo-100/50 bg-white/70 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer select-none">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100/60 text-indigo-600 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105 group-hover:rotate-3 shadow-2xs">
            <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-indigo-400 opacity-75 group-hover:bg-indigo-200" />
            <Sparkles className="relative h-4.5 w-4.5 transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <span className="font-heading text-xl font-black tracking-tight text-slate-800">
            Civic<span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Pulse</span>
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-2xl px-4.5 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-y-[-1px]"
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? "text-white scale-110" : "text-slate-400 group-hover:text-slate-600"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Badging / Gamification Level Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-indigo-100/60 bg-linear-to-br from-indigo-50/50 to-purple-50/30 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover-lift cursor-pointer select-none">
            <Trophy className="h-4 w-4 text-amber-500 animate-bounce" style={{ animationDuration: '3s' }} />
            <span className="text-[11px] text-slate-500">Rep:</span>
            <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent font-extrabold">120 XP</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400 font-semibold text-[10px]">Level 3</span>
          </div>
        </div>

      </div>
    </header>
  );
}
