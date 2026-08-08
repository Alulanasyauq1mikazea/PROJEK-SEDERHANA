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
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { NodeMetric, PredictiveAnalysisResult } from '../types';

interface PredictiveAnalyticsProps {
  nodes: NodeMetric[];
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ nodes }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<{
    overallHealthScore: number;
    criticalPredictions: PredictiveAnalysisResult[];
    aiExecutiveSummary: string;
    preventativeActions: string[];
  }>({
    overallHealthScore: 84,
    criticalPredictions: [
      {
        nodeId: 'node-web-e-learning',
        nodeName: 'LMS / E-Learning Server',
        riskScore: 88,
        predictedExhaustionDays: 12,
        predictedFailureType: 'SSL Expiration & Disk Volume Saturation',
        confidence: 94,
        trendDirection: 'increasing',
        anomalySummary: 'LMS SSL Certificate expires in 12 days. Disk usage is trending upward at +1.2%/day due to uncompressed log files.',
        recommendedAction: 'Automate certbot renewal hook and configure systemd logrotate for /var/log/nginx/',
      },
      {
        nodeId: 'node-mikrotik-02',
        nodeName: 'MikroTik RB5009UG+S+IN',
        riskScore: 76,
        predictedExhaustionDays: 18,
        predictedFailureType: 'CPU Overheat & NAT Connection Table Overflow',
        confidence: 86,
        trendDirection: 'increasing',
        anomalySummary: 'Branch office router CPU is sustained at 82% load with temperature reaching 56°C under peak student connection hours.',
        recommendedAction: 'Enable FastTrack hardware acceleration and clean dust from router rack ventilation filters.',
      },
      {
        nodeId: 'node-vm-database',
        nodeName: 'VM-DB01 (MySQL Master)',
        riskScore: 68,
        predictedExhaustionDays: 24,
        predictedFailureType: 'RAM Exhaustion & InnoDB Buffer Pool Swap Pressure',
        confidence: 80,
        trendDirection: 'increasing',
        anomalySummary: 'MySQL RAM usage is at 84% with high IOPS on InnoDB undo logs.',
        recommendedAction: 'Increase VM RAM allocation in Proxmox VE from 16GB to 24GB.',
      },
    ],
    aiExecutiveSummary: 'Infrastructure capacity is generally sound with an 84/100 health index. Urgent preemptive action is recommended for LMS SSL renewal and Branch MikroTik CPU offloading.',
    preventativeActions: [
      'Trigger certbot renew --nginx on Ubuntu 24.04 web host',
      'Deploy FastTrack connection bypass rules on MikroTik Branch Gateway',
      'Vacuum InfluxDB audit logs retention policy to 30 days to regain 18GB disk space',
    ],
  });

  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // Simulated 30-day capacity prediction curve
  const forecastCurve = [
    { day: 'Day 1', actualCpu: 42, predictedDisk: 54 },
    { day: 'Day 5', actualCpu: 45, predictedDisk: 58 },
    { day: 'Day 10', actualCpu: 52, predictedDisk: 64 },
    { day: 'Day 15', actualCpu: 60, predictedDisk: 72 },
    { day: 'Day 20', actualCpu: 74, predictedDisk: 82 },
    { day: 'Day 25', actualCpu: 85, predictedDisk: 91 },
    { day: 'Day 30', actualCpu: 96, predictedDisk: 99 },
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
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Machine learning models predicting system exhaustion, network bottlenecks, and hardware thermal risks
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
          <span className="text-xs text-slate-300">0 critical failures predicted in next 7 days</span>
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
            <div className="space-y-1.5">
              {analysisReport.preventativeActions.map((action, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Predictive Capacity Forecast Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>30-Day Resource Saturation Forecast</span>
            </h3>
            <p className="text-xs text-slate-400">Projected CPU and Storage volume exhaustion curves</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Threshold: 85% Warning / 95% Critical
          </span>
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

      {/* Critical Predictions Breakdown Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Predicted Risk Items & Failure Timelines</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysisReport.criticalPredictions.map((item, idx) => (
            <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-sm">{item.nodeName}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono border border-amber-500/20">
                  Risk: {item.riskScore}/100
                </span>
              </div>

              <div className="text-xs text-rose-400 font-semibold">{item.predictedFailureType}</div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                {item.anomalySummary}
              </p>

              <div className="text-[11px] text-cyan-400 font-medium">
                ⚡ Action: {item.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gemini AI Incident Diagnostic Assistant */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-slate-100">Gemini AI Infrastructure Assistant</h3>
        </div>

        <form onSubmit={handleDiagnoseCustomQuery} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask AI e.g. 'How to optimize Nginx WAF rate limiting for Ubuntu 24.04?'"
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
