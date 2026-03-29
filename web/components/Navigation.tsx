'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Signal, LayoutDashboard, TrendingUp, Settings, Info } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/about', label: 'About', icon: Info },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Signal className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg">Adaptive Traffic</h1>
              <p className="text-slate-400 text-xs">Command Center</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs font-medium hidden sm:inline">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-800">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
