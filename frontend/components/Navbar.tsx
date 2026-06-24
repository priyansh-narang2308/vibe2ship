"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Map, LayoutDashboard, Trophy } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Report Issue", href: "/report", icon: ShieldAlert },
    { name: "Issues Map", href: "/map", icon: Map },
    { name: "Admin Portal", href: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer select-none">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white transition-transform duration-200 group-hover:scale-105">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span className="font-heading text-lg font-black tracking-tight text-slate-900">
            CivicPulse
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* XP Badge */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 select-none">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          <span>120 XP</span>
          <span className="text-slate-300 font-medium">&middot;</span>
          <span className="text-slate-400 font-medium">Lvl 3</span>
        </div>

      </div>
    </header>
  );
}
