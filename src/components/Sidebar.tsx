import React from 'react';
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
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAlertCount: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertCount,
  isCollapsed,
  setIsCollapsed,
}) => {
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

  return (
    <aside
      className={`hidden md:flex flex-col bg-slate-950/95 border-r border-slate-800 text-slate-100 transition-all duration-300 ease-in-out sticky top-16 h-[calc(100vh-4rem)] z-30 flex-shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header / Collapse Toggle Bar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-900/80 bg-slate-900/40">
        {!isCollapsed && (
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 pl-2">
            Main Navigation
          </span>
        )}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className={`p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 transition flex items-center justify-center ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Buka Menu Sidebar (Expand)' : 'Tutup Menu Sidebar (Collapse)'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Navigation Items - Scrollable so it never cuts off if items are added */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-xl font-medium text-xs transition-all duration-200 group relative ${
                isCollapsed ? 'justify-center p-3' : 'justify-start px-3.5 py-2.5 space-x-3'
              } ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                }`}
              />

              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {/* Badges / Alerts */}
              {!isCollapsed && item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-xs">
                  {item.badge}
                </span>
              )}

              {!isCollapsed && item.alertCount ? (
                item.alertCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500 text-white font-bold animate-pulse">
                    {item.alertCount}
                  </span>
                )
              ) : null}

              {/* Dot badge indicator when collapsed */}
              {isCollapsed && item.alertCount ? (
                item.alertCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                )
              ) : null}

              {/* Tooltip on Collapsed Hover */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-slate-100 text-xs rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                  {item.badge && <span className="ml-1.5 text-cyan-400">({item.badge})</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Toggle Info */}
      <div className="p-3 border-t border-slate-900/80 bg-slate-900/30 text-[11px] font-mono text-slate-500 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate">Sidebar Active</span>
          </div>
        ) : (
          <div className="mx-auto w-2 h-2 rounded-full bg-emerald-500"></div>
        )}
      </div>
    </aside>
  );
};
