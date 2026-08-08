import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Database,
  ShieldAlert,
  Info,
  AlertTriangle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { InfluxAuditLog } from '../types';

interface AuditLogViewerProps {
  logs: InfluxAuditLog[];
  onRefresh: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs, onRefresh }) => {
  const [logList, setLogList] = useState<InfluxAuditLog[]>(logs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const filteredLogs = logList.filter((log) => {
    const matchesQuery =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.sourceIp.includes(searchQuery) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.nodeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
    return matchesQuery && matchesSeverity;
  });

  const handleExportCsv = () => {
    const headers = 'ID,Timestamp,Measurement,Source IP,User,Severity,Action,Details,Node\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.measurement}","${l.sourceIp}","${l.user}","${l.severity}","${l.action.replace(
            /"/g,
            '""'
          )}","${l.details.replace(/"/g, '""')}","${l.nodeName}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netwatch_influxdb_audit_logs_${Date.now()}.csv`;
    a.click();
  };

  const severityBadge = (sev: InfluxAuditLog['severity']) => {
    switch (sev) {
      case 'INFO':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'WARN':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'ERROR':
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'SECURITY':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">InfluxDB Audit Log & System Activity</h2>
            <p className="text-xs text-slate-400">Timeseries audit store for SSH auth, WAF blocks, SNMP traps, and admin actions</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition border border-slate-700 w-full md:w-auto justify-center"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button onClick={onRefresh} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl" title="Sync Logs">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by IP, user, action, node or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          {['ALL', 'INFO', 'WARN', 'SECURITY', 'CRITICAL'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap ${
                selectedSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/60">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Node / Host</th>
                <th className="p-3">Source IP & User</th>
                <th className="p-3">Action & Event</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${severityBadge(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-3 text-slate-200 font-semibold">{log.nodeName}</td>
                    <td className="p-3 text-cyan-400">
                      {log.sourceIp} <span className="text-slate-400">({log.user})</span>
                    </td>
                    <td className="p-3 text-slate-100 font-medium">{log.action}</td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No activity logs match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
