import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Copy,
  Check,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  ArrowRight,
  Code,
  Sparkles,
  Server,
  Network,
  RefreshCw,
  Terminal,
  FileJson,
  Shield,
  HelpCircle,
} from 'lucide-react';
import {
  CORE_PVE_METRIC_DICTIONARY,
  MetricDictionaryEntry,
  parsePvePrometheusToStandardSchema,
  PveStandardizedTelemetry,
} from '../utils/pveTelemetrySchema';

const SAMPLE_RAW_INFORMATIKA = `# HELP pve_up Node and guest status
# TYPE pve_up gauge
pve_up{id="node/informatika"} 1.0
pve_up{id="qemu/100"} 1.0
pve_up{id="qemu/101"} 1.0
pve_up{id="qemu/102"} 1.0
pve_up{id="qemu/103"} 1.0
pve_up{id="qemu/104"} 0.0
pve_up{id="qemu/105"} 1.0

# HELP pve_guest_info Guest information
# TYPE pve_guest_info gauge
pve_guest_info{id="qemu/100",name="DAS-WAF-X",node="informatika",tags="192.168.14.10",type="qemu"} 1.0
pve_guest_info{id="qemu/101",name="Informatika-LMS",node="informatika",tags="192.168.14.20",type="qemu"} 1.0
pve_guest_info{id="qemu/102",name="LMS-Informatika",node="informatika",tags="192.168.14.25",type="qemu"} 1.0
pve_guest_info{id="qemu/103",name="scedulesystem",node="informatika",tags="192.168.14.30",type="qemu"} 1.0
pve_guest_info{id="qemu/104",name="VPN-OPNsense",node="informatika",tags="192.168.14.254",type="qemu"} 1.0
pve_guest_info{id="qemu/105",name="SistemInformasiKelulusan",node="informatika",tags="192.168.14.15",type="qemu"} 1.0

# HELP pve_cpu_usage_ratio CPU usage ratio
# TYPE pve_cpu_usage_ratio gauge
pve_cpu_usage_ratio{id="node/informatika"} 0.04
pve_cpu_usage_limit{id="node/informatika"} 32.0
pve_cpu_usage_ratio{id="qemu/100"} 0.021
pve_cpu_usage_limit{id="qemu/100"} 4.0

# HELP pve_memory_usage_bytes Memory usage in bytes
# TYPE pve_memory_usage_bytes gauge
pve_memory_usage_bytes{id="node/informatika"} 1.9583860736e+10
pve_memory_size_bytes{id="node/informatika"} 3.354707968e+10
pve_memory_usage_bytes{id="qemu/100"} 4.294967296e+09
pve_memory_size_bytes{id="qemu/100"} 8.589934592e+09

# HELP pve_disk_usage_bytes Storage usage and total size in bytes
# TYPE pve_disk_usage_bytes gauge
pve_disk_usage_bytes{id="storage/informatika/Hardisk2"} 6.5446021693e+10
pve_disk_size_bytes{id="storage/informatika/Hardisk2"} 1.9653459968e+12
pve_disk_usage_bytes{id="storage/informatika/Hardisk3"} 0
pve_disk_size_bytes{id="storage/informatika/Hardisk3"} 1.9653459968e+12
pve_disk_usage_bytes{id="storage/informatika/Hardisk4"} 0
pve_disk_size_bytes{id="storage/informatika/Hardisk4"} 1.9653459968e+12
pve_disk_usage_bytes{id="storage/informatika/local-lvm"} 0
pve_disk_size_bytes{id="storage/informatika/local-lvm"} 1.8353459968e+12
pve_disk_usage_bytes{id="storage/informatika/local"} 1.7179869184e+10
pve_disk_size_bytes{id="storage/informatika/local"} 1.009317203e+11

# HELP pve_uptime_seconds Uptime in seconds
# TYPE pve_uptime_seconds gauge
pve_uptime_seconds{id="node/informatika"} 1.504484e+06
pve_version_info{release="9.2",version="9.2.2"} 1.0`;

export const PrometheusSchemaDictionary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dictionary' | 'inspector' | 'tester'>('dictionary');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customPrometheusText, setCustomPrometheusText] = useState<string>(SAMPLE_RAW_INFORMATIKA);
  const [selectedNodeTab, setSelectedNodeTab] = useState<'informatika' | 'dekanat' | 'fatek' | 'simlitabmas' | 'backup'>('informatika');

  const groups = ['All', 'Health & State', 'Identity & Metadata', 'CPU Processing', 'RAM Memory', 'Datacenter Storage', 'Network & Uptime'];

  const filteredDictionary = useMemo(() => {
    return CORE_PVE_METRIC_DICTIONARY.filter((item) => {
      const matchGroup = selectedGroup === 'All' || item.group === selectedGroup;
      const matchSearch =
        item.metricName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mappedField.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.targetScope.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [searchQuery, selectedGroup]);

  const parsedStandardTelemetry: PveStandardizedTelemetry[] = useMemo(() => {
    return parsePvePrometheusToStandardSchema(customPrometheusText, selectedNodeTab);
  }, [customPrometheusText, selectedNodeTab]);

  const activeTelemetry = parsedStandardTelemetry[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Data Architecture & Schema Mapping
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PVE 9.2.2 / 8.x Ready
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Database className="w-6 h-6 text-indigo-400" />
              Kamus Pemetaan Metrik Inti (PVE Core Metric Schema)
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Standardisasi pemanggilan data telemetri Proxmox VE ke dalam 6 kelompok acuan data kunci. 
              Memudahkan pemanggilan metrik CPU, RAM, Storage Datacenter, Status VM, dan Network tanpa memproses baris mentah yang berlebih.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => setActiveTab('dictionary')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'dictionary'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Kamus Metrik (6 Kelompok)
              </button>
              <button
                onClick={() => setActiveTab('inspector')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'inspector'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Live Schema Inspector
              </button>
              <button
                onClick={() => setActiveTab('tester')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'tester'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Prometheus Parser Tester
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: KAMUS PEMETAAN METRIK */}
      {activeTab === 'dictionary' && (
        <div className="space-y-6">
          {/* 6 Quick Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: '1. Health & State', count: '2 Metrik', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { title: '2. Identity Info', count: '2 Metrik', icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
              { title: '3. CPU Processor', count: '2 Metrik', icon: Cpu, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { title: '4. RAM Memory', count: '2 Metrik', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
              { title: '5. Datacenter HD', count: '2 Metrik', icon: HardDrive, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
              { title: '6. Traffic & Uptime', count: '3 Metrik', icon: Network, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
            ].map((card, i) => (
              <div
                key={i}
                onClick={() => setSelectedGroup(selectedGroup === card.title.split('. ')[1] ? 'All' : card.title.split('. ')[1])}
                className={`p-3.5 rounded-xl border transition cursor-pointer hover:scale-[1.02] ${card.bg}`}
              >
                <card.icon className={`w-5 h-5 ${card.color} mb-1.5`} />
                <div className="text-xs font-bold text-slate-200 truncate">{card.title}</div>
                <div className="text-[11px] text-slate-400 font-mono">{card.count}</div>
              </div>
            ))}
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari metrik (misal: pve_cpu, storage, ram)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {groups.map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-2.5 py-1 text-xs rounded-md transition font-medium ${
                    selectedGroup === grp
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Table */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-semibold">Kelompok & Metrik</th>
                    <th className="py-3 px-4 font-semibold">Scope Target</th>
                    <th className="py-3 px-4 font-semibold">Tipe & Satuan</th>
                    <th className="py-3 px-4 font-semibold">Rumus Konversi</th>
                    <th className="py-3 px-4 font-semibold">Target Properti Schema</th>
                    <th className="py-3 px-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredDictionary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-300 font-mono text-xs">{item.metricName}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {item.group}
                          </span>
                        </div>
                        <div className="text-[11px] font-sans text-slate-400 mt-1 max-w-sm">
                          {item.description}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 text-[11px]">
                          {item.targetScope}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="text-slate-200">{item.unit}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{item.metricType}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <code className="text-amber-300/90 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30 text-[11px] block max-w-xs truncate">
                          {item.conversionFormula}
                        </code>
                      </td>

                      <td className="py-3.5 px-4">
                        <code className="text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-900/30 text-[11px]">
                          {item.mappedField}
                        </code>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleCopy(item.exampleRaw, `dict-${idx}`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-[11px]"
                          title="Salin contoh baris Prometheus mentah"
                        >
                          {copiedKey === `dict-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          Contoh
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SCHEMA INSPECTOR */}
      {activeTab === 'inspector' && (
        <div className="space-y-6">
          {/* Node Tab Selection */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">Pilih Node Cluster untuk Inspect:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'informatika', label: 'PVE-Informatika (Master)', ip: '192.168.14.222' },
                { id: 'dekanat', label: 'PVE-Dekanat (pve)', ip: '192.168.77.29' },
                { id: 'fatek', label: 'PVE-Teknik (fatek)', ip: '192.168.77.30' },
                { id: 'simlitabmas', label: 'PVE-Simlitabmas', ip: '192.168.77.99' },
              ].map((node) => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeTab(node.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
                    selectedNodeTab === node.id
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{node.label}</span>
                  <span className="text-[10px] font-mono opacity-70">({node.ip})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Object Showcase */}
          {activeTelemetry && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: UI Metric Cards */}
              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div>
                      <h3 className="font-bold text-white text-sm">{activeTelemetry.nodeDisplayName}</h3>
                      <p className="text-[11px] font-mono text-slate-400">{activeTelemetry.ip} • {activeTelemetry.pveVersion}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {activeTelemetry.status.toUpperCase()}
                    </span>
                  </div>

                  {/* 3 Core Bars */}
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span className="flex items-center gap-1.5 text-amber-300">
                          <Cpu className="w-3.5 h-3.5" /> CPU Processing
                        </span>
                        <span className="font-bold text-white">{activeTelemetry.cpu.usagePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.max(2, activeTelemetry.cpu.usagePercent)}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">32 Cores Datacenter Load</div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span className="flex items-center gap-1.5 text-purple-300">
                          <Layers className="w-3.5 h-3.5" /> RAM Memory
                        </span>
                        <span className="font-bold text-white">{activeTelemetry.ram.usedGb} / {activeTelemetry.ram.totalGb} GiB ({activeTelemetry.ram.usagePercent}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-purple-400 h-full rounded-full" style={{ width: `${activeTelemetry.ram.usagePercent}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span className="flex items-center gap-1.5 text-teal-300">
                          <HardDrive className="w-3.5 h-3.5" /> Datacenter Storage
                        </span>
                        <span className="font-bold text-white">{activeTelemetry.storage.usedGb} GB / {activeTelemetry.storage.totalTb} TiB ({activeTelemetry.storage.usagePercent}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-teal-400 h-full rounded-full" style={{ width: `${Math.max(2, activeTelemetry.storage.usagePercent)}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Storage Pools Breakdown */}
                  {activeTelemetry.storage.pools.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Storage Pools Terdeteksi:</div>
                      <div className="space-y-1.5">
                        {activeTelemetry.storage.pools.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] font-mono bg-slate-950/60 px-2 py-1 rounded border border-slate-800">
                            <span className="text-indigo-300">{p.name} ({p.type})</span>
                            <span className="text-slate-300">{p.usedGb > 0 ? `${p.usedGb} GB` : '0 GB'} / {p.sizeTb} TiB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VM List */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                        Virtual Machines ({activeTelemetry.vmsSummary.running} Aktif / {activeTelemetry.vmsSummary.total} Total)
                      </span>
                    </div>
                    <div className="space-y-1">
                      {activeTelemetry.vms.slice(0, 5).map((vm) => (
                        <div key={vm.vmid} className="flex items-center justify-between text-[11px] font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          <span className="text-slate-200 truncate max-w-[120px]">{vm.name}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${vm.status === 'running' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {vm.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle & Right Column: Standardized JSON Output */}
              <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-full font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <FileJson className="w-4 h-4" />
                    <span className="font-semibold text-white">Standar JSON Output (PveStandardizedTelemetry)</span>
                  </div>
                  <button
                    onClick={() => handleCopy(JSON.stringify(activeTelemetry, null, 2), 'json-copy')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition flex items-center gap-1.5"
                  >
                    {copiedKey === 'json-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Salin JSON Schema
                  </button>
                </div>

                <div className="flex-1 overflow-auto bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 max-h-[500px]">
                  <pre className="text-emerald-300 text-[11px] leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(activeTelemetry, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROMETHEUS PARSER TESTER / PLAYGROUND */}
      {activeTab === 'tester' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Raw Prometheus Text */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <h3 className="font-semibold text-white text-sm">Input Raw Prometheus Stream (PVE-Exporter)</h3>
                </div>
                <button
                  onClick={() => setCustomPrometheusText(SAMPLE_RAW_INFORMATIKA)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset Sample
                </button>
              </div>

              <textarea
                value={customPrometheusText}
                onChange={(e) => setCustomPrometheusText(e.target.value)}
                rows={18}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500 resize-none"
                placeholder="Paste baris metrik Prometheus di sini..."
              />
            </div>

            {/* Live Transformation Result */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-white text-sm">Hasil Transformasi Kamus Standar</h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {parsedStandardTelemetry.length} Node Terparse
                </span>
              </div>

              <div className="flex-1 overflow-auto bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-200">
                <pre className="text-cyan-300 whitespace-pre-wrap">
                  {JSON.stringify(parsedStandardTelemetry, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
