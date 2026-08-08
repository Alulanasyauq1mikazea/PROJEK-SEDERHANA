import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertOctagon,
  Globe,
  Filter,
  Plus,
  Trash2,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';
import { NodeMetric } from '../types';

interface WafMonitorProps {
  wafNode?: NodeMetric;
  onRefresh: () => void;
}

export const WafMonitor: React.FC<WafMonitorProps> = ({ wafNode, onRefresh }) => {
  const [ipToBlock, setIpToBlock] = useState('');
  const [blockReason, setBlockReason] = useState('Manual Security Blacklist');
  const [blockedIpList, setBlockedIpList] = useState(
    wafNode?.topBlockedIps || [
      { ip: '185.220.101.5', country: 'RU', reason: 'SQL Injection Attack Pattern', count: 1420 },
      { ip: '45.154.255.88', country: 'NL', reason: 'Brute Force Rate Limit Exceeded', count: 980 },
      { ip: '194.26.29.112', country: 'CN', reason: 'Cross-Site Scripting (XSS) Vector', count: 760 },
      { ip: '103.152.220.14', country: 'ID', reason: 'Known Botnet Probe / Scanner', count: 420 },
    ]
  );

  const attacks = wafNode?.attacksToday || {
    sqli: 1240,
    xss: 890,
    rateLimit: 3420,
    botnet: 510,
  };

  const httpDist = wafNode?.httpStatusDist || {
    '2xx': 485200,
    '3xx': 24100,
    '4xx': 12400,
    '5xx': 310,
  };

  const handleAddBlockIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipToBlock) return;
    setBlockedIpList([
      { ip: ipToBlock, country: 'MANUAL', reason: blockReason, count: 1 },
      ...blockedIpList,
    ]);
    setIpToBlock('');
  };

  const handleRemoveIp = (ip: string) => {
    setBlockedIpList(blockedIpList.filter((item) => item.ip !== ip));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Web Application Firewall (WAF)</h2>
            <p className="text-xs text-slate-400">Nginx ModSecurity OWASP Core Rule Set (CRS v3.3) Protection</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>WAF Filtering Active</span>
          </span>
        </div>
      </div>

      {/* Attack Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider">SQL Injection (SQLi)</span>
          <div className="text-2xl font-bold font-mono text-purple-400">{attacks.sqli.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Blocked via Rule #942100</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Cross-Site Scripting (XSS)</span>
          <div className="text-2xl font-bold font-mono text-cyan-400">{attacks.xss.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Blocked via Rule #941100</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Rate Limit / Brute Force</span>
          <div className="text-2xl font-bold font-mono text-amber-400">{attacks.rateLimit.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Nginx limit_req zone=one</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Botnet & Scanners</span>
          <div className="text-2xl font-bold font-mono text-rose-400">{attacks.botnet.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">User-Agent & IP Threat Intelligence</p>
        </div>
      </div>

      {/* HTTP Status Code Distribution & Add IP Rule Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* HTTP Status Breakdown */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2 pb-2 border-b border-slate-800">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            <span>Nginx Traffic HTTP Status Distribution</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-emerald-400 font-bold">2xx SUCCESS</span>
              <div className="text-lg font-bold text-slate-100 mt-1">{httpDist['2xx'].toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-blue-400 font-bold">3xx REDIRECT</span>
              <div className="text-lg font-bold text-slate-100 mt-1">{httpDist['3xx'].toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-amber-400 font-bold">4xx BLOCKED</span>
              <div className="text-lg font-bold text-slate-100 mt-1">{httpDist['4xx'].toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-rose-400 font-bold">5xx ERROR</span>
              <div className="text-lg font-bold text-slate-100 mt-1">{httpDist['5xx'].toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Add Blacklist Rule */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Add IP Blacklist Rule</span>
          </h3>

          <form onSubmit={handleAddBlockIp} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Target IP Address</label>
              <input
                type="text"
                placeholder="e.g., 185.220.101.5"
                value={ipToBlock}
                onChange={(e) => setIpToBlock(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Blocking Reason</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5"
            >
              <ShieldX className="w-4 h-4" />
              <span>Apply Nginx Block Rule</span>
            </button>
          </form>
        </div>
      </div>

      {/* Top Blocked IP Feed Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2 pb-2 border-b border-slate-800">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Active WAF Blacklisted IP Feed</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/60">
                <th className="p-3">Blocked IP</th>
                <th className="p-3">Origin</th>
                <th className="p-3">Threat Category</th>
                <th className="p-3">Hits Blocked</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {blockedIpList.map((item, index) => (
                <tr key={index} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-rose-400">{item.ip}</td>
                  <td className="p-3 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px]">{item.country}</span>
                  </td>
                  <td className="p-3 text-slate-200">{item.reason}</td>
                  <td className="p-3 text-cyan-400 font-bold">{item.count.toLocaleString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleRemoveIp(item.ip)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-950/40 transition"
                      title="Unblock IP"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
