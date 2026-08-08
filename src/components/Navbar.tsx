import React, { useState } from 'react';
import { AntLogo } from './AntLogo';
import {
  Activity,
  Router,
  Server,
  ShieldCheck,
  Globe,
  Sparkles,
  FileText,
  Database,
  Bell,
  Sliders,
  Lock,
  Menu,
  X,
  RefreshCw,
  Clock,
  ShieldAlert,
  LogOut,
  User,
} from 'lucide-react';
import { SystemStatus, UserSecurityState } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus: SystemStatus;
  unreadAlertCount: number;
  userSecurity: UserSecurityState;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpen2FAModal: () => void;
  onLogout?: () => void;
  currentUser?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  unreadAlertCount,
  userSecurity,
  onRefresh,
  isRefreshing,
  onOpen2FAModal,
  onLogout,
  currentUser = 'daswafx',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'mikrotik', label: 'MikroTik Router', icon: Router },
    { id: 'servers', label: 'Servers & VMs', icon: Server },
    { id: 'waf', label: 'WAF Firewall', icon: ShieldCheck },
    { id: 'websites', label: 'Web & SSL', icon: Globe },
    { id: 'predictive', label: 'AI Predictive', icon: Sparkles, badge: 'Gemini AI' },
    { id: 'logs', label: 'InfluxDB Audit', icon: FileText },
    { id: 'backups', label: 'Daily Backups', icon: Database },
    { id: 'alerts', label: 'Alerts & Telegram', icon: Bell, alertCount: unreadAlertCount },
    { id: 'config', label: 'Prometheus & Grafana', icon: Sliders },
  ];

  const statusColorMap = {
    online: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500', label: 'System Normal' },
    warning: { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-500 animate-pulse', label: '2 Warnings Active' },
    critical: { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dot: 'bg-rose-500 animate-ping', label: 'Critical Action Needed' },
    offline: { bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20', dot: 'bg-gray-500', label: 'Offline Mode' },
  };

  const statusStyle = statusColorMap[systemStatus] || statusColorMap.online;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
              <AntLogo className="w-6 h-6 text-cyan-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-100">NetWatch<span className="text-cyan-400">Pro</span></span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">Ubuntu 24.04 + Nginx</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Unified Monitoring • Prometheus • SNMP • InfluxDB</p>
            </div>
          </div>

          {/* Right Status Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Global System Health Indicator */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium ${statusStyle.bg}`}>
              <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`}></span>
              <span>{statusStyle.label}</span>
            </div>

            {/* 2FA Status Pill */}
            <button
              onClick={onOpen2FAModal}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                userSecurity.is2FAEnabled
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/50'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{userSecurity.is2FAEnabled ? '2FA Enabled' : 'Enable 2FA'}</span>
            </button>

            {/* Logged in User Profile & Role Badge */}
            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-200 font-bold">{currentUser}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                  userSecurity.userRole === 'Viewer'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                }`}
              >
                {userSecurity.userRole === 'Viewer' ? 'Viewer (Read-Only)' : 'Super Admin'}
              </span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-medium transition"
                title="Keluar / Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}

            {/* Live Clock */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition disabled:opacity-50"
              title="Refresh Telemetry Data"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-900">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${statusStyle.bg}`}>
              <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`}></span>
              <span>{statusStyle.label}</span>
            </div>
            <button
              onClick={onOpen2FAModal}
              className={`px-3 py-1 rounded-lg border text-xs font-medium ${
                userSecurity.is2FAEnabled ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
              }`}
            >
              2FA: {userSecurity.is2FAEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-medium text-left transition ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 bg-slate-900/60 border border-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
