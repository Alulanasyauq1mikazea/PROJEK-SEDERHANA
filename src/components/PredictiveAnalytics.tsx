import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Cpu,
  HardDrive,
  RefreshCw,
  Send,
  HelpCircle,
  FileText,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Flame,
  Activity,
  Server,
  Globe,
  Radio,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { NodeMetric, PredictiveAnalysisResult } from '../types';

interface PredictiveAnalyticsProps {
  nodes: NodeMetric[];
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ nodes }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'waf' | 'firewall' | 'server'>('all');
  const [analysisReport, setAnalysisReport] = useState<{
    overallHealthScore: number;
    criticalPredictions: PredictiveAnalysisResult[];
    aiExecutiveSummary: string;
    preventativeActions: string[];
    wafThreatForecast?: {
      projectedAttacksNext7Days: number;
      primaryThreatVector: string;
      sslExpiryRiskDays: number;
      wafRateLimitRisk: string;
    };
  }>({
    overallHealthScore: 84,
    criticalPredictions: [
      {
        nodeId: 'reverseproxy-crowdsec-gateway',
        nodeName: 'NPMPlus & CrowdSec WAF Gateway (VM ReverseProxy - PVE Dekanat)',
        riskScore: 82,
        predictedExhaustionDays: 9,
        predictedFailureType: 'WAF Rate-Limiting & SQLi/XSS Attack Velocity Surge',
        confidence: 91,
        trendDirection: 'increasing',
        anomalySummary: 'Pintu gerbang ReverseProxy (NPMPlus + CrowdSec LAPI) memproteksi traffic sebelum menuju backend. Pola request mencurigakan (SQL Injection & Bot probe) diproyeksikan naik +18.4% dalam 7 hari.',
        recommendedAction: 'Sinkronkan CrowdSec active decisions ke MikroTik RAW Address-List dan optimasi rate-limiting zone di NPMPlus.',
      },
      {
        nodeId: 'mikrotik-ccr1036',
        nodeName: 'MikroTik CCR1036-12G-4S (192.168.77.1)',
        riskScore: 76,
        predictedExhaustionDays: 18,
        predictedFailureType: 'Trafik Uplink Peak & NAT Connection State Load',
        confidence: 86,
        trendDirection: 'increasing',
        anomalySummary: 'Trafik sfp-sfpplus1 WAN Primary mencapai 382 Mbps pada jam sibuk perkuliahan di Gateway 192.168.77.1. Tabel connection tracker mencapai 48.000 entri.',
        recommendedAction: 'Pastikan FastTrack hardware acceleration aktif pada RouterOS CCR1036 untuk meringankan beban packet forwarding & NAT state table.',
      },
      {
        nodeId: 'pve-informatika-master',
        nodeName: 'PVE-Informatika (Master Node - 192.168.14.222)',
        riskScore: 18,
        predictedExhaustionDays: 120,
        predictedFailureType: 'Optimal Storage Headroom & Low Workload Load',
        confidence: 96,
        trendDirection: 'stable',
        anomalySummary: 'Kapasitas storage pool (Hardisk2-4 & local-lvm 7.12 TiB) dan utilisasi RAM beroperasi normal (Load ~18%). Alokasi VM 100 WAF stabil dengan performa optimal.',
        recommendedAction: 'Pertahankan snapshot berkala harian dan pantau utilisasi I/O disk bootdisk VM WAF.',
      },
      {
        nodeId: 'pve-dekanat-web',
        nodeName: 'PVE-Server - Dekanat / OJS & Web App',
        riskScore: 88,
        predictedExhaustionDays: 12,
        predictedFailureType: 'Log Disk Volume Saturation & Web Probe Latency',
        confidence: 94,
        trendDirection: 'increasing',
        anomalySummary: 'Kapasitas penyimpanan log sistem dan VM aktif meningkat +1.2%/hari. Respon HTTP portal terdeteksi perlu optimasi.',
        recommendedAction: 'Jalankan systemd logrotate pada VM aktif Dekanat dan konfigurasi rotasi berkala.',
      },
      {
        nodeId: 'pve-teknik-vms',
        nodeName: 'PVE-Teknik (fatek) / VM 105 PLTI & VM Guests',
        riskScore: 68,
        predictedExhaustionDays: 24,
        predictedFailureType: 'RAM Exhaustion & VM Offline Recovery Alert',
        confidence: 80,
        trendDirection: 'increasing',
        anomalySummary: 'Terdeteksi 5 VM offline pada Host PVE-Teknik (192.168.77.242) yang memerlukan verifikasi status.',
        recommendedAction: 'Periksa service qemu-guest-agent dan alokasi memori RAM di Proxmox VE Teknik.',
      },
    ],
    aiExecutiveSummary: 'Kapasitas infrastruktur 3 Node Proxmox VE (Informatika, Dekanat, Teknik), Router MikroTik CCR1036-12G-4S, dan Pintu Gerbang WAF NPMPlus + CrowdSec (VM ReverseProxy Dekanat) beroperasi stabil dengan indeks kesehatan 86/100. Rekomendasi prioritas mencakup penguatan aturan WAF Rate-Limiting terhadap serangan SQLi/Botnet serta aktivasi FastTrack MikroTik.',
    preventativeActions: [
      'Sinkronisasi IP penyerang berulang dari CrowdSec LAPI Bouncer ke MikroTik RAW Firewall Drop List',
      'Perketat Nginx WAF / NPMPlus rate-limiting zone pada endpoint /login dan /api publik',
      'Deploy FastTrack connection bypass rules pada MikroTik CCR1036-12G-4S Gateway (192.168.77.1)',
      'Verifikasi status VM offline pada Cluster PVE Dekanat dan PVE Teknik',
      'Pertahankan jadwal snapshot harian otomatis pada PVE-Informatika Master Node',
    ],
    wafThreatForecast: {
      projectedAttacksNext7Days: 1420,
      primaryThreatVector: 'Automated SQLi Probing & HTTP Flood',
      sslExpiryRiskDays: 48,
      wafRateLimitRisk: 'Moderate (Peak Hours 09:00 - 15:00)',
    },
  });

  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // Simulated 30-day capacity & security prediction curve
  const forecastCurve = [
    { day: 'Day 1', actualCpu: 42, predictedDisk: 54, predictedWafThreats: 180 },
    { day: 'Day 5', actualCpu: 45, predictedDisk: 58, predictedWafThreats: 240 },
    { day: 'Day 10', actualCpu: 52, predictedDisk: 64, predictedWafThreats: 360 },
    { day: 'Day 15', actualCpu: 60, predictedDisk: 72, predictedWafThreats: 510 },
    { day: 'Day 20', actualCpu: 74, predictedDisk: 82, predictedWafThreats: 720 },
    { day: 'Day 25', actualCpu: 85, predictedDisk: 91, predictedWafThreats: 980 },
    { day: 'Day 30', actualCpu: 96, predictedDisk: 99, predictedWafThreats: 1420 },
  ];

  const handleRunAiAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/predictive-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodesData: nodes }),
      });
      const result = await response.json();
      if (result.data) {
        setAnalysisReport(result.data);
      }
    } catch (err) {
      console.error('AI Predictive Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiagnoseCustomQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput) return;
    setIsDiagnosing(true);
    try {
      const response = await fetch('/api/ai/diagnose-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logEntry: { userQuery: aiPromptInput, time: new Date() } }),
      });
      const data = await response.json();
      setAiDiagnosisResult(data.diagnosis || 'Diagnosis completed.');
    } catch (err) {
      setAiDiagnosisResult('Analysis error. Please try again.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const filteredPredictions = analysisReport.criticalPredictions.filter((item) => {
    if (activeCategoryFilter === 'waf') {
      return item.nodeId.includes('waf') || item.nodeName.includes('WAF');
    }
    if (activeCategoryFilter === 'firewall') {
      return item.nodeId.includes('mikrotik') || item.nodeName.includes('CCR') || item.nodeName.includes('MikroTik');
    }
    if (activeCategoryFilter === 'server') {
      return item.nodeId.includes('pve') || item.nodeName.includes('PVE');
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-cyan-800/40 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-100">AI Predictive Analytics & Capacity Forecast</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Deep Neural Forecast: Prediksi saturasi Server Proxmox VE, Router MikroTik, dan Ancaman Keamanan WAF Gateway
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAiAnalysis}
          disabled={isLoading}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-cyan-900/30 transition flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Running Gemini AI Scan...' : 'Re-run Gemini AI Prediction'}</span>
        </button>
      </div>

      {/* Health Score & AI Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Predictive Infrastructure Health</span>
          <div className="relative flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-8 border-cyan-500/20 flex items-center justify-center">
              <span className="text-4xl font-extrabold text-cyan-400 font-mono">{analysisReport.overallHealthScore}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-300 font-semibold block">0 critical hardware failures predicted (7 hari)</span>
            <span className="text-[11px] text-amber-400/90 font-mono block">1 WAF Security anomaly velocity flagged</span>
          </div>
        </div>

        {/* AI Executive Summary & Preventative Action List */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Executive Summary & Recommendations</span>
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
            {analysisReport.aiExecutiveSummary}
          </p>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Recommended Preemptive Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analysisReport.preventativeActions.map((action, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-200 bg-slate-950/60 p-2 rounded-lg border border-slate-800/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED WAF & FIREWALL SECURITY FORECAST MODULE */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border border-rose-900/30 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-rose-900/20 gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>WAF & Firewall Security Threat Forecast</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  NPMPlus & CrowdSec (VM ReverseProxy PVE Dekanat)
                </span>
              </h3>
              <p className="text-xs text-slate-400">Prediksi tren serangan siber, laju blokir WAF / CrowdSec LAPI, dan estimasi beban firewall 7-30 hari ke depan</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>WAF MITIGATION ACTIVE</span>
          </span>
        </div>

        {/* 4 Threat Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono">Proyeksi Serangan (7 Hari)</span>
            <div className="text-2xl font-bold font-mono text-rose-400">
              ~{analysisReport.wafThreatForecast?.projectedAttacksNext7Days || 1420}{' '}
              <span className="text-xs font-normal text-rose-300/80">reqs</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Tren SQLi & Botnet Probe (+18.4%)</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono">Vektor Serangan Dominan</span>
            <div className="text-sm font-bold text-amber-300 truncate">
              {analysisReport.wafThreatForecast?.primaryThreatVector || 'Automated SQLi & HTTP Flood'}
            </div>
            <span className="text-[10px] text-slate-500 block">Target: /login, /api, /index.php/ojs</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono">WAF Rate-Limiting Risk</span>
            <div className="text-sm font-bold text-cyan-300">
              {analysisReport.wafThreatForecast?.wafRateLimitRisk || 'Moderate (Peak Hours)'}
            </div>
            <span className="text-[10px] text-slate-500 block">Zone: zone=waf_limit:10m rate=15r/s</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono">Masa Berlaku SSL / TLS</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {analysisReport.wafThreatForecast?.sslExpiryRiskDays || 48}{' '}
              <span className="text-xs font-normal text-emerald-300/80">Hari</span>
            </div>
            <span className="text-[10px] text-emerald-500/80 block">CertBot Auto-Renewal Valid ✅</span>
          </div>
        </div>
      </div>

      {/* 30-Day Predictive Capacity & Threat Curve */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>30-Day Resource & Threat Velocity Curve</span>
            </h3>
            <p className="text-xs text-slate-400">Proyeksi pertumbuhan beban CPU Server, Kapasitas Storage, dan Kecepatan Serangan WAF</p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              ● CPU (%)
            </span>
            <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              ● Disk (%)
            </span>
            <span className="text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              ● WAF Attacks (req/day)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="actualCpu" name="Predicted CPU Load (%)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="predictedDisk" name="Predicted Disk Usage (%)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical Predictions Breakdown Grid with Category Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Predicted Risk Items & Failure Timelines</span>
          </h3>

          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${activeCategoryFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Semua ({analysisReport.criticalPredictions.length})
            </button>
            <button
              onClick={() => setActiveCategoryFilter('waf')}
              className={`px-3 py-1 rounded-lg transition ${activeCategoryFilter === 'waf' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🛡️ WAF & Security
            </button>
            <button
              onClick={() => setActiveCategoryFilter('firewall')}
              className={`px-3 py-1 rounded-lg transition ${activeCategoryFilter === 'firewall' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🔥 Router & Firewall
            </button>
            <button
              onClick={() => setActiveCategoryFilter('server')}
              className={`px-3 py-1 rounded-lg transition ${activeCategoryFilter === 'server' ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🖥️ Proxmox Storage
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPredictions.map((item, idx) => {
            const isWaf = item.nodeId.includes('waf') || item.nodeName.includes('WAF');
            const isRouter = item.nodeId.includes('mikrotik') || item.nodeName.includes('CCR');

            const isOptimal = item.riskScore < 40;

            return (
              <div
                key={idx}
                className={`bg-slate-900/90 border rounded-2xl p-5 space-y-3 flex flex-col justify-between transition hover:border-slate-700 ${
                  isWaf
                    ? 'border-rose-500/30 shadow-lg shadow-rose-950/20'
                    : isRouter
                    ? 'border-amber-500/30'
                    : isOptimal
                    ? 'border-emerald-500/30'
                    : 'border-slate-800'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-100 text-sm leading-tight">{item.nodeName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-mono whitespace-nowrap border ${
                        item.riskScore > 80
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : item.riskScore > 50
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {isOptimal ? `Optimal: ${item.riskScore}/100` : `Risk: ${item.riskScore}/100`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        isWaf
                          ? 'bg-rose-500/20 text-rose-300'
                          : isRouter
                          ? 'bg-amber-500/20 text-amber-300'
                          : isOptimal
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {isWaf ? 'WAF & Security' : isRouter ? 'Firewall / NAT' : isOptimal ? 'Hypervisor Master' : 'Hypervisor VM'}
                    </span>
                    {item.predictedExhaustionDays && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Timeline: ~{item.predictedExhaustionDays} hari
                      </span>
                    )}
                  </div>

                  <div className={`text-xs font-semibold leading-snug ${isOptimal ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.predictedFailureType}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    {item.anomalySummary}
                  </p>
                </div>

                <div className="text-[11px] text-cyan-400 font-medium pt-2 border-t border-slate-800/60">
                  ⚡ Action: {item.recommendedAction}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gemini AI Incident Diagnostic Assistant */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-slate-100">Gemini AI Infrastructure & Security Assistant</h3>
        </div>

        <form onSubmit={handleDiagnoseCustomQuery} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask AI e.g. 'Bagaimana cara mitigasi serangan SQL Injection dan setting rate-limit di NPMPlus & CrowdSec VM ReverseProxy PVE Dekanat?'"
            value={aiPromptInput}
            onChange={(e) => setAiPromptInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="submit"
            disabled={isDiagnosing}
            className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isDiagnosing ? 'Thinking...' : 'Ask AI'}</span>
          </button>
        </form>

        {aiDiagnosisResult && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-mono">
            {aiDiagnosisResult}
          </div>
        )}
      </div>
    </div>
  );
};
