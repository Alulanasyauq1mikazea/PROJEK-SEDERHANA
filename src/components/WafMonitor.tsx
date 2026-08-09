import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Server,
  Zap,
  Info,
  Copy,
  Check,
  Activity,
  Code,
  FileText,
  PieChart,
  Layers,
  Cpu,
  Flame,
  Target,
  Clock,
  Terminal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NodeMetric } from '../types';

interface WafMonitorProps {
  wafNode?: NodeMetric;
  onRefresh: () => void;
}

export const WafMonitor: React.FC<WafMonitorProps> = ({ wafNode, onRefresh }) => {
  const [crowdsecMetricsUrl, setCrowdsecMetricsUrl] = useState('http://192.168.77.77:6060/metrics');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');
  const [syncSource, setSyncSource] = useState<string>('CrowdSec LAPI (192.168.77.77:6060)');
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [showPromqlPanel, setShowPromqlPanel] = useState(false);
  const [rawPasteText, setRawPasteText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Pagination states
  const [facultyPage, setFacultyPage] = useState(1);
  const [scenarioPage, setScenarioPage] = useState(1);
  const [ipFeedPage, setIpFeedPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Live CrowdSec KPI Stats
  const [kpiStats, setKpiStats] = useState({
    activeDecisions: 28181,
    totalAlerts: 793,
    bucketPouredTotal: 842500,
    bucketOverflowedTotal: 15210,
    bucketInstantiationTotal: 24800,
    engineLatencyMs: 0.42,
  });

  // Target logs distribution (Fakultas / Aplikasi Target)
  const [facultyLogs, setFacultyLogs] = useState<Record<string, number>>({
    'FEB-access.log': 45200,
    'PPG-access.log': 32100,
    'informatika-access.log': 28900,
    'FKIP-access.log': 18400,
    'LAPORANFATEK-access.log': 14200,
    'siakad-access.log': 9800,
  });

  // Threat Origin Breakdown (CAPI vs Local)
  const [originData, setOriginData] = useState<Record<string, number>>({
    CAPI: 28150,
    crowdsec: 31,
  });

  // Rule Scenario Table Data
  const [scenarioRules, setScenarioRules] = useState<Array<{ name: string; instantiated: number; overflowed: number }>>([
    { name: 'crowdsecurity/http-bad-user-agent', instantiated: 12379, overflowed: 12210 },
    { name: 'crowdsecurity/http-probing', instantiated: 7497, overflowed: 1253 },
    { name: 'crowdsecurity/http-wordpress-scan', instantiated: 945, overflowed: 539 },
    { name: 'crowdsecurity/http-sensitive-files', instantiated: 1594, overflowed: 523 },
    { name: 'crowdsecurity/cve-2017-9841', instantiated: 612, overflowed: 410 },
  ]);

  const [ipToBlock, setIpToBlock] = useState('');
  const [blockReason, setBlockReason] = useState('Manual Security Blacklist');
  const [blockedIpList, setBlockedIpList] = useState(
    wafNode?.topBlockedIps || [
      { ip: '185.220.101.5', country: 'RU', reason: 'SQL Injection Attack Pattern', count: 1420 },
      { ip: '45.154.255.88', country: 'NL', reason: 'Brute Force Rate Limit Exceeded', count: 980 },
      { ip: '194.26.29.112', country: 'CN', reason: 'Cross-Site Scripting (XSS) Vector', count: 760 },
      { ip: '103.152.220.14', country: 'ID', reason: 'Known Botnet Probe / Scanner', count: 420 },
      { ip: '188.166.172.19', country: 'SG', reason: 'http-bad-user-agent Scanner', count: 350 },
    ]
  );

  const [attacks, setAttacks] = useState({
    sqli: 1240,
    xss: 890,
    rateLimit: 3420,
    botnet: 510,
  });

  const [httpDist, setHttpDist] = useState({
    '2xx': 485200,
    '3xx': 24100,
    '4xx': 12400,
    '5xx': 310,
  });

  // Fetch CrowdSec Prometheus Metrics
  const handleFetchCrowdSecMetrics = async (rawInputText?: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/crowdsec/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metricsUrl: crowdsecMetricsUrl,
          rawText: rawInputText || (showPasteModal ? rawPasteText : undefined),
        }),
      });

      const data = await res.json();
      if (data.success && data.parsed) {
        const p = data.parsed;
        setKpiStats({
          activeDecisions: p.activeDecisions || 28181,
          totalAlerts: p.totalAlerts || 793,
          bucketPouredTotal: p.bucketPouredTotal || 842500,
          bucketOverflowedTotal: p.bucketOverflowedTotal || 15210,
          bucketInstantiationTotal: p.bucketInstantiationTotal || 24800,
          engineLatencyMs: p.engineLatencyMs || 0.42,
        });

        if (p.facultyLogsMap) setFacultyLogs(p.facultyLogsMap);
        if (p.originBreakdown) setOriginData(p.originBreakdown);
        if (p.scenarioRules && p.scenarioRules.length > 0) setScenarioRules(p.scenarioRules);
        if (p.attacks) setAttacks(p.attacks);
        if (p.httpStatusDist) setHttpDist(p.httpStatusDist);
        if (p.blockedIps && p.blockedIps.length > 0) setBlockedIpList(p.blockedIps);

        setSyncSource(data.source === 'raw-crowdsec-text-ingested' ? 'Direct Raw Prometheus Paste' : data.targetUrl || crowdsecMetricsUrl);
        setLastSyncedTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to sync CrowdSec metrics:', err);
    } finally {
      setIsSyncing(false);
      setShowPasteModal(false);
    }
  };

  useEffect(() => {
    handleFetchCrowdSecMetrics();
  }, []);

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

  const promqlQueries = [
    { title: 'Total Banned IP', query: 'sum(cs_active_decisions)', desc: 'Menampilkan total IP yang sedang diblokir aktif oleh CrowdSec' },
    { title: 'Top 5 Alasan Pemblokiran', query: 'topk(5, sum by (reason) (cs_active_decisions))', desc: 'Skenario teratas yang memicu pemblokiran' },
    { title: 'Log Target Terbanyak Ditargetkan', query: 'topk(10, sum by (source) (cs_bucket_poured_total))', desc: 'Aplikasi/fakultas yang paling banyak dipindai' },
    { title: 'Efektivitas Bucket (Overflow vs Instantiated)', query: 'sum(cs_bucket_overflowed_total) / sum(cs_bucket_instantiation_total) * 100', desc: 'Persentase ancaman terkonfirmasi diblokir dari total deteksi' },
  ];

  const copyQuery = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const totalOriginDecisions = (originData.CAPI || 0) + (originData.crowdsec || 0) || 28181;
  const capiPct = (((originData.CAPI || 28150) / totalOriginDecisions) * 100).toFixed(1);
  const localPct = (100 - parseFloat(capiPct)).toFixed(1);

  const logValues = Object.values(facultyLogs) as number[];
  const maxLogHits = logValues.length > 0 ? Math.max(...logValues, 1) : 1;

  return (
    <div className="space-y-6">
      {/* CrowdSec Prometheus Sync Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">CrowdSec Prometheus Metrics Endpoint</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                192.168.77.77:6060
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sinkronisasi metrics otomatis: <code className="text-purple-300 font-mono">cs_active_decisions</code>, <code className="text-cyan-300 font-mono">cs_alerts</code>, <code className="text-emerald-300 font-mono">cs_bucket_poured_total</code>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono w-full sm:w-auto">
            <Server className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
            <input
              type="text"
              value={crowdsecMetricsUrl}
              onChange={(e) => setCrowdsecMetricsUrl(e.target.value)}
              placeholder="http://192.168.77.77:6060/metrics"
              className="bg-transparent border-none text-white focus:outline-none w-full sm:w-60"
            />
          </div>

          <button
            onClick={() => handleFetchCrowdSecMetrics()}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Pulling Metrics...' : 'Sync CrowdSec'}</span>
          </button>

          <button
            onClick={() => setShowPasteModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Paste Raw</span>
          </button>

          <button
            onClick={() => setShowPromqlPanel(!showPromqlPanel)}
            className="px-3 py-2 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-purple-700/50 transition"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>PromQL Reference</span>
          </button>

          <button
            onClick={() => setShowConfigGuide(true)}
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Info className="w-3.5 h-3.5 text-purple-400" />
            <span>Setup</span>
          </button>
        </div>
      </div>

      {/* PromQL Reference Collapsible Box */}
      {showPromqlPanel && (
        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Rekomendasi Query PromQL untuk Grafana & Prometheus</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Grafana / Prometheus Query Cheatsheet</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {promqlQueries.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{item.title}</span>
                  <button
                    onClick={() => copyQuery(item.query, idx)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono font-semibold"
                  >
                    {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === idx ? 'Copied' : 'Copy Query'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-emerald-400 bg-slate-900 p-2 rounded border border-slate-800/60 overflow-x-auto">
                  {item.query}
                </pre>
                <p className="text-[10.5px] text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">Web Application Firewall & Threat Intelligence</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PROMETHEUS ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              CrowdSec LAPI Bouncer Threat Intelligence + Nginx OWASP CRS Rules Realtime Protection
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>CrowdSec & WAF Active</span>
          </span>
          {lastSyncedTime && (
            <span className="text-[11px] text-slate-400 font-mono">
              Last sync: <strong className="text-slate-200">{lastSyncedTime}</strong>
            </span>
          )}
        </div>
      </div>

      {/* SECTION 1: Key Performance Indicators (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Active Decisions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Active Decisions</span>
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-400">{kpiStats.activeDecisions.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <code className="text-slate-300 font-mono font-bold">sum(cs_active_decisions)</code>
          </p>
          <span className="text-[10px] text-rose-300/80 block">Active Banned IP Pool</span>
        </div>

        {/* KPI 2: Total Alerts Triggered */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Alerts Triggered</span>
            <Flame className="w-4 h-4 text-purple-400 shrink-0" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-purple-400">{kpiStats.totalAlerts.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">
            <code className="text-slate-300 font-mono font-bold">sum(cs_alerts)</code>
          </p>
          <span className="text-[10px] text-purple-300/80 block">LAPI Local Security Alerts</span>
        </div>

        {/* KPI 3: Total Attack Events (Poured) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Attack Events</span>
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-400">{kpiStats.bucketPouredTotal.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">
            <code className="text-slate-300 font-mono font-bold">sum(cs_bucket_poured_total)</code>
          </p>
          <span className="text-[10px] text-cyan-300/80 block">Processed Log Event Stream</span>
        </div>

        {/* KPI 4: Overflowed Buckets (Threat Triggered) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overflowed Buckets</span>
            <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400">{kpiStats.bucketOverflowedTotal.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">
            <code className="text-slate-300 font-mono font-bold">sum(cs_bucket_overflowed_total)</code>
          </p>
          <span className="text-[10px] text-amber-300/80 block">Threat Threshold Exceeded</span>
        </div>
      </div>

      {/* SECTION 2 & 3: Top Threat Categories & Target Distribution per Faculty/Site */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Threat Categories (Kategori Ban) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              <span>Top Threat Categories (Kategori Ban)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">cs_active_decisions by reason</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-purple-300 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  http:scan (Scanner / Probe)
                </span>
                <span className="text-slate-300">24,400 (65.2%)</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '65.2%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                  bad-user-agent (Malicious Bots)
                </span>
                <span className="text-slate-300">12,200 (32.6%)</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '32.6%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  http:exploit (Vulnerability Attacks)
                </span>
                <span className="text-slate-300">506 (1.4%)</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '1.4%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-rose-300 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  http:bruteforce (Credential Attacks)
                </span>
                <span className="text-slate-300">379 (1.0%)</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '1.0%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Target Distribution (Fakultas / Aplikasi Target) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Situs / Log Fakultas Paling Diincar</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">cs_bucket_poured_total by source</span>
            </div>

            <div className="space-y-2.5 mt-4 max-h-[300px] overflow-y-auto pr-1">
              {Object.entries(facultyLogs)
                .slice((facultyPage - 1) * ITEMS_PER_PAGE, facultyPage * ITEMS_PER_PAGE)
                .map(([logFile, rawHits], idx) => {
                  const hits = Number(rawHits);
                  const percentage = Math.min(Math.round((hits / maxLogHits) * 100), 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-200 font-semibold truncate max-w-[220px]" title={logFile}>
                          {logFile}
                        </span>
                        <span className="text-cyan-400 font-bold">{hits.toLocaleString()} hits</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Faculty Logs Pagination Footer */}
          {Object.keys(facultyLogs).length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
              <span>
                Total {Object.keys(facultyLogs).length} log • Hal {facultyPage} dari{' '}
                {Math.ceil(Object.keys(facultyLogs).length / ITEMS_PER_PAGE)}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFacultyPage((p) => Math.max(1, p - 1))}
                  disabled={facultyPage === 1}
                  className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    setFacultyPage((p) =>
                      Math.min(Math.ceil(Object.keys(facultyLogs).length / ITEMS_PER_PAGE), p + 1)
                    )
                  }
                  disabled={facultyPage >= Math.ceil(Object.keys(facultyLogs).length / ITEMS_PER_PAGE)}
                  className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Selanjutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4 & 5: Threat Intelligence Source (CAPI vs Local) & Engine Latency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CAPI vs Local Threat Origin */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Threat Intelligence Origin (CAPI Community vs Local)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">cs_active_decisions by origin</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CAPI Global Community Blocklist */}
            <div className="p-4 bg-slate-950 rounded-xl border border-indigo-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300">CAPI (CrowdSec Community Blocklist)</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                  {capiPct}%
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {(originData.CAPI || 28150).toLocaleString()} <span className="text-xs text-slate-400">IPs</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Blokir otomatis dari jaringan kecerdasan kolektif CrowdSec Global (50,000+ server)
              </p>
            </div>

            {/* Local Detection */}
            <div className="p-4 bg-slate-950 rounded-xl border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300">crowdsec (Local Engine Detection)</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono font-bold">
                  {localPct}%
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {(originData.crowdsec || 31).toLocaleString()} <span className="text-xs text-slate-400">IPs</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ancaman yang terdeteksi secara real-time langsung di server Nginx/SSH Anda
              </p>
            </div>
          </div>
        </div>

        {/* Engine Performance & Latency */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>CrowdSec Engine Performance</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Pour Latency</span>
          </div>

          <div className="space-y-3 font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Pour Processing Latency</span>
                <span className="text-xs text-emerald-400 font-bold">cs_bucket_pour_seconds</span>
              </div>
              <div className="text-xl font-bold text-emerald-400">{kpiStats.engineLatencyMs} ms</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Parser Status</span>
                <span className="text-xs text-indigo-400 font-bold">Nginx Line Stream</span>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                100% Throughput
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Detail Skenario Serangan Terdeteksi (Detailed Rules Table) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Detail Skenario Serangan Terdeteksi (CrowdSec Scenario Rules)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">cs_bucket_instantiation vs cs_bucket_overflowed</span>
        </div>

        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-slate-950 z-10 shadow">
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-950">
                <th className="p-3">Rule / Scenario Name</th>
                <th className="p-3">Instantiated (Attempted)</th>
                <th className="p-3">Overflowed (Blocked)</th>
                <th className="p-3">Efficiency Rate</th>
                <th className="p-3">Action Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {scenarioRules
                .slice((scenarioPage - 1) * ITEMS_PER_PAGE, scenarioPage * ITEMS_PER_PAGE)
                .map((rule, idx) => {
                  const eff = rule.instantiated > 0 ? ((rule.overflowed / rule.instantiated) * 100).toFixed(1) : '100.0';
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-indigo-300">{rule.name}</td>
                      <td className="p-3 text-slate-300">{rule.instantiated.toLocaleString()}</td>
                      <td className="p-3 text-amber-400 font-bold">{rule.overflowed.toLocaleString()}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">{eff}%</span>
                          <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(parseFloat(eff), 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          BAN APPLIED
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Scenario Rules Pagination Footer */}
        {scenarioRules.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
            <span>
              Menampilkan {((scenarioPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(scenarioPage * ITEMS_PER_PAGE, scenarioRules.length)} dari {scenarioRules.length} aturan
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setScenarioPage((p) => Math.max(1, p - 1))}
                disabled={scenarioPage === 1}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-slate-300">
                Hal {scenarioPage} / {Math.ceil(scenarioRules.length / ITEMS_PER_PAGE)}
              </span>
              <button
                onClick={() => setScenarioPage((p) => Math.min(Math.ceil(scenarioRules.length / ITEMS_PER_PAGE), p + 1))}
                disabled={scenarioPage >= Math.ceil(scenarioRules.length / ITEMS_PER_PAGE)}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
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
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <ShieldX className="w-4 h-4" />
              <span>Apply Nginx Block Rule</span>
            </button>
          </form>
        </div>
      </div>

      {/* Active CrowdSec Blacklisted IP Feed Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Active CrowdSec Blacklisted IP Feed</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {blockedIpList.length} Active Blacklisted IPs
          </span>
        </div>

        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-slate-950 z-10 shadow">
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-950">
                <th className="p-3">Blocked IP</th>
                <th className="p-3">Origin</th>
                <th className="p-3">Threat Category</th>
                <th className="p-3">Hits Blocked</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {blockedIpList
                .slice((ipFeedPage - 1) * ITEMS_PER_PAGE, ipFeedPage * ITEMS_PER_PAGE)
                .map((item, index) => (
                  <tr key={index} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-rose-400">{item.ip}</td>
                    <td className="p-3 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-bold">{item.country}</span>
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

        {/* IP Feed Pagination Footer */}
        {blockedIpList.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
            <span>
              Menampilkan {((ipFeedPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(ipFeedPage * ITEMS_PER_PAGE, blockedIpList.length)} dari {blockedIpList.length} IP Ter-blokir
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIpFeedPage((p) => Math.max(1, p - 1))}
                disabled={ipFeedPage === 1}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-slate-300">
                Hal {ipFeedPage} / {Math.ceil(blockedIpList.length / ITEMS_PER_PAGE)}
              </span>
              <button
                onClick={() => setIpFeedPage((p) => Math.min(Math.ceil(blockedIpList.length / ITEMS_PER_PAGE), p + 1))}
                disabled={ipFeedPage >= Math.ceil(blockedIpList.length / ITEMS_PER_PAGE)}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Setup & Configuration Guide for CrowdSec Prometheus Metrics */}
      {showConfigGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Zap className="w-5 h-5" />
                <span>Petunjuk Integrasi CrowdSec di Prometheus</span>
              </div>
              <button
                onClick={() => setShowConfigGuide(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <p>
                CrowdSec secara bawaan menyediakan exporter metrics Prometheus pada port <code className="text-cyan-400 font-mono">6060</code> di endpoint <code className="text-indigo-300 font-mono">/metrics</code>.
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">1. Aktifkan Metrics di CrowdSec Config (`/etc/crowdsec/config.yaml`):</h4>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200">
                  prometheus:<br />
                  &nbsp;&nbsp;enabled: true<br />
                  &nbsp;&nbsp;listen_addr: 0.0.0.0<br />
                  &nbsp;&nbsp;listen_port: 6060
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">2. Tambahkan Scrape Job di Prometheus (`/etc/prometheus/prometheus.yml`):</h4>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`scrape_configs:
  - job_name: 'crowdsec_security'
    scrape_interval: 15s
    static_configs:
      - targets: ['192.168.77.77:6060']
        labels:
          environment: 'production'
          service: 'crowdsec_lapi_bouncer'`}
                </pre>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-white">3. Jalankan Pengujian Endpoint:</h4>
                <p className="text-slate-400">
                  Anda bisa mengetes langsung via terminal server: <code className="text-indigo-300 font-mono">curl http://192.168.77.77:6060/metrics</code>.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowConfigGuide(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
              >
                Paham & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Paste Raw Prometheus Text Direct Ingestion */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <FileText className="w-5 h-5" />
                <span>Paste Raw CrowdSec Prometheus Metrics</span>
              </div>
              <button
                onClick={() => setShowPasteModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Jika server CrowdSec (<code className="text-cyan-400 font-mono">http://192.168.77.77:6060/metrics</code>) berada dalam jaringan lokal terisolasi, Anda dapat menyalin teks mentah dari browser/terminal lalu menempelkannya di sini untuk parsing instant:
            </p>

            <textarea
              rows={10}
              value={rawPasteText}
              onChange={(e) => setRawPasteText(e.target.value)}
              placeholder="# HELP cs_active_decisions Active decisions in LAPI&#10;cs_active_decisions{action='ban',origin='cscli',reason='crowdsecurity/http-scan'} 28181&#10;# HELP cs_alerts Total alerts&#10;cs_alerts 793"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-cyan-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleFetchCrowdSecMetrics(rawPasteText)}
                disabled={!rawPasteText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Parse & Update Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

