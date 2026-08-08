import React, { useState } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  Terminal,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Box,
} from 'lucide-react';
import { NodeMetric } from '../types';

interface ServerVmMonitorProps {
  serverNodes: NodeMetric[];
  onRefresh: () => void;
}

export const ServerVmMonitor: React.FC<ServerVmMonitorProps> = ({ serverNodes, onRefresh }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(serverNodes[0]?.id || '');
  const [activeLog, setActiveLog] = useState<string>(
    `Aug 06 21:40:12 ubuntu-noble nginx[1240]: 2026/08/06 21:40:12 [notice] 1240#1240: signal process started\nAug 06 21:42:01 ubuntu-noble systemd[1]: Started Prometheus Node Exporter Daemon.\nAug 06 21:43:10 ubuntu-noble influxd[1820]: ts=2026-08-06T21:43:10Z lvl=info msg="Compacting commit log" log_id=0x1a`
  );

  const currentNode = serverNodes.find((s) => s.id === selectedNodeId) || serverNodes[0];

  const mountPoints = [
    { mount: '/', size: '100 GB', used: '54 GB', percent: 54, type: 'ext4' },
    { mount: '/var/log', size: '50 GB', used: '28 GB', percent: 56, type: 'ext4' },
    { mount: '/var/lib/influxdb', size: '200 GB', used: '124 GB', percent: 62, type: 'xfs' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Linux Server & Server VM Monitoring</h2>
            <p className="text-xs text-slate-400">Ubuntu 24.04 LTS (Noble Numbat), Proxmox VE & Systemd Services</p>
          </div>
        </div>

        {/* Server Picker */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={selectedNodeId}
            onChange={(e) => setSelectedNodeId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-blue-500 w-full md:w-auto"
          >
            {serverNodes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.ip})
              </option>
            ))}
          </select>
          <button onClick={onRefresh} className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl">
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Resource Metrics & Systemd Services */}
      {currentNode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">OS Platform</span>
              <Box className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-sm font-bold text-slate-100 font-mono">{currentNode.osName || 'Ubuntu 24.04 LTS'}</div>
            <div className="text-xs text-slate-400">IP: <span className="text-cyan-400 font-mono">{currentNode.ip}</span></div>
            <div className="text-xs text-slate-400">Uptime: <span className="text-slate-200 font-mono">{currentNode.uptime}</span></div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">CPU Load Average</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100">{currentNode.cpuUsage}%</div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-cyan-500" style={{ width: `${currentNode.cpuUsage}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">RAM Allocation</span>
              <HardDrive className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100">{currentNode.ramUsage}%</div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${currentNode.ramUsage}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Storage Volumes & Systemd Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Systemd Services Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Active Systemd Services</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">systemctl status</span>
          </div>

          <div className="divide-y divide-slate-800">
            {currentNode?.servicesRunning?.map((svc, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">{svc.name}</span>
                  <div className="text-[11px] text-slate-400">CPU: {svc.cpu}% • RAM: {svc.ram}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    {svc.status}
                  </span>
                  <button
                    onClick={() => setActiveLog(`[SYSTEMCTL] Service ${svc.name} reloaded cleanly at ${new Date().toLocaleTimeString()}`)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Reload Service"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disk Mount Points & Storage */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2 pb-2 border-b border-slate-800">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>Disk Mount Points (df -h)</span>
          </h3>

          <div className="space-y-3">
            {mountPoints.map((m, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-200">{m.mount} ({m.type})</span>
                  <span className="text-slate-400">{m.used} / {m.size} ({m.percent}%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${m.percent > 80 ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${m.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
