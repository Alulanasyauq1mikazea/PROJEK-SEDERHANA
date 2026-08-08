import React from 'react';
import {
  Router,
  Server,
  ShieldCheck,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertTriangle,
  Send,
  Zap,
  TrendingUp,
  Cpu,
  HardDrive,
  Clock,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { NodeMetric, MetricTimeSeriesPoint, SystemAlert } from '../types';

interface OverviewDashboardProps {
  nodes: NodeMetric[];
  timeSeries: MetricTimeSeriesPoint[];
  alerts: SystemAlert[];
  onNavigateTab: (tab: string) => void;
  onSendTestTelegramAlert: () => void;
  isTestingTelegram: boolean;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  nodes,
  timeSeries,
  alerts,
  onNavigateTab,
  onSendTestTelegramAlert,
  isTestingTelegram,
}) => {
  const mikrotikNodes = nodes.filter((n) => n.category === 'mikrotik');
  const serverNodes = nodes.filter((n) => n.category === 'server' || n.category === 'vm');
  const wafNode = nodes.find((n) => n.category === 'waf');
  const websiteNodes = nodes.filter((n) => n.category === 'website');

  const totalRx = mikrotikNodes.reduce((acc, curr) => acc + (curr.rxSpeedMbps || 0), 0);
  const totalTx = mikrotikNodes.reduce((acc, curr) => acc + (curr.txSpeedMbps || 0), 0);
  const totalBlockedAttacks = wafNode?.blockedRequestsTotal || 142850;
  const activeAlerts = alerts.filter((a) => a.status === 'active');

  return (
    <div className="space-y-6">
      {/* Active Incident Ticker Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-amber-200 text-sm">System Alerts Detected ({activeAlerts.length})</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">Real-Time</span>
              </div>
              <p className="text-xs text-amber-300/80 mt-0.5">
                {activeAlerts[0]?.title}: {activeAlerts[0]?.message}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button
              onClick={() => onNavigateTab('alerts')}
              className="px-3.5 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-900 text-amber-200 text-xs font-medium border border-amber-700/50 transition w-full md:w-auto text-center"
            >
              View Alert Rules
            </button>
            <button
              onClick={onSendTestTelegramAlert}
              disabled={isTestingTelegram}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition flex items-center justify-center space-x-1.5 w-full md:w-auto disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isTestingTelegram ? 'Sending...' : 'Test Telegram Alert'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. MikroTik Router Metrics */}
        <div
          onClick={() => onNavigateTab('mikrotik')}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition cursor-pointer group shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition">
              <Router className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
              SNMP Connected
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">MikroTik Routers</h3>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-slate-100 font-mono">{(totalRx + totalTx).toFixed(1)}</span>
              <span className="text-xs text-slate-400 font-mono">Mbps Combined</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-1 text-emerald-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{totalRx.toFixed(1)} Mbps In</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{totalTx.toFixed(1)} Mbps Out</span>
            </div>
          </div>
        </div>

        {/* 2. Ubuntu Servers & VMs */}
        <div
          onClick={() => onNavigateTab('servers')}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition cursor-pointer group shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition">
              <Server className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono border border-blue-500/20">
              Ubuntu 24.04 + VM
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Servers & VMs</h3>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-slate-100 font-mono">3 Nodes</span>
              <span className="text-xs text-slate-400">Prometheus Node Export</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Avg CPU: 61%</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              <span>RAM: 78%</span>
            </span>
          </div>
        </div>

        {/* 3. WAF Web Application Firewall */}
        <div
          onClick={() => onNavigateTab('waf')}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition cursor-pointer group shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-mono border border-purple-500/20">
              ModSecurity Active
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">WAF Threat Blocked</h3>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-slate-100 font-mono">{totalBlockedAttacks.toLocaleString()}</span>
              <span className="text-xs text-slate-400">Attacks Filtered</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="text-purple-400">SQLi & XSS Filtered</span>
            <span className="text-slate-300 font-mono">1,240 SQLi Today</span>
          </div>
        </div>

        {/* 4. Websites & SSL Expiration */}
        <div
          onClick={() => onNavigateTab('websites')}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition cursor-pointer group shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition">
              <Globe className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono border border-amber-500/20">
              SSL Warning (12d)
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Website Uptime & SSL</h3>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-slate-100 font-mono">99.98%</span>
              <span className="text-xs text-slate-400">Avg Response 28ms</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="text-emerald-400">HTTP 200 OK</span>
            <span className="text-amber-400 font-medium">LMS SSL: 12 days left</span>
          </div>
        </div>
      </div>

      {/* Charts Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Real-Time Network Bandwidth & Latency Area Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-semibold text-slate-100">Live Infrastructure Traffic & Throughput</h2>
              </div>
              <p className="text-xs text-slate-400">Real-time SNMP / Prometheus polling stream (30s interval)</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center space-x-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                <span>Rx Speed (In)</span>
              </span>
              <span className="flex items-center space-x-1 text-blue-500">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                <span>Tx Speed (Out)</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="bandwidthIn" name="Bandwidth In (Mbps)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRx)" />
                <Area type="monotone" dataKey="bandwidthOut" name="Bandwidth Out (Mbps)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTx)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WAF Blocked Attacks & CPU Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-semibold text-slate-100">WAF Blocked Threat Rate</h2>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              ModSecurity
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                />
                <Bar dataKey="wafBlocked" name="Blocked Threats" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* All Nodes Quick Overview Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Monitored Infrastructure Nodes Status</h2>
            <p className="text-xs text-slate-400">Live monitoring for MikroTik Routers, Ubuntu 24 Servers, WAF Firewall & Websites</p>
          </div>
          <button
            onClick={() => onNavigateTab('predictive')}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium transition flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Run Gemini AI Diagnostic</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <div
              key={node.id}
              onClick={() => onNavigateTab(node.category === 'server' || node.category === 'vm' ? 'servers' : node.category)}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {node.category === 'mikrotik' && <Router className="w-4 h-4 text-cyan-400" />}
                  {node.category === 'server' && <Server className="w-4 h-4 text-blue-400" />}
                  {node.category === 'vm' && <Server className="w-4 h-4 text-indigo-400" />}
                  {node.category === 'waf' && <ShieldCheck className="w-4 h-4 text-purple-400" />}
                  {node.category === 'website' && <Globe className="w-4 h-4 text-amber-400" />}
                  <span className="font-semibold text-slate-200 text-xs truncate max-w-[180px]">{node.name}</span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                    node.status === 'online'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {node.status.toUpperCase()}
                </span>
              </div>

              {/* Resource Progress Bars */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>CPU Usage</span>
                    <span className="font-mono text-slate-200">{node.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        node.cpuUsage > 80 ? 'bg-rose-500' : node.cpuUsage > 60 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${node.cpuUsage}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>RAM Utilization</span>
                    <span className="font-mono text-slate-200">{node.ramUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        node.ramUsage > 80 ? 'bg-rose-500' : node.ramUsage > 60 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${node.ramUsage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Footer IP & Ping info */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                <span>IP: {node.ip}</span>
                <span>Latency: {node.latencyMs}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
