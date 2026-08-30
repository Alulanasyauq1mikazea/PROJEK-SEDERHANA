import React, { useState } from 'react';
import {
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  Terminal,
  Send,
  Code,
  Shield,
  RefreshCw,
  Zap,
  Globe,
  Database,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  keySecret: string;
  scope: 'read' | 'write' | 'admin';
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

interface ApiSyncCenterProps {
  onAddAuditLog?: (action: string, category: string, details: string) => void;
}

export const ApiSyncCenter: React.FC<ApiSyncCenterProps> = ({ onAddAuditLog }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'key-1',
      name: 'Prometheus Ingestion Service',
      keySecret: 'nw_live_8f3910ab49c02d18471920acde',
      scope: 'write',
      createdAt: '2026-08-01 10:20:00',
      lastUsed: 'Just now',
      status: 'active',
    },
    {
      id: 'key-2',
      name: 'Grafana Dashboard Viewer',
      keySecret: 'nw_live_190a42b89c91024e81902cba81',
      scope: 'read',
      createdAt: '2026-08-05 14:15:30',
      lastUsed: '2 mins ago',
      status: 'active',
    },
    {
      id: 'key-3',
      name: 'Mobile Network Admin App',
      keySecret: 'nw_live_990141a0e9821422ab0012e11a',
      scope: 'admin',
      createdAt: '2026-08-10 09:00:12',
      lastUsed: '1 hour ago',
      status: 'active',
    },
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState<'read' | 'write' | 'admin'>('read');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sandbox State
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/telemetry');
  const [httpMethod, setHttpMethod] = useState<'GET' | 'POST' | 'DELETE'>('GET');
  const [sandboxApiKey, setSandboxApiKey] = useState('nw_live_990141a0e9821422ab0012e11a');
  const [requestPayload, setRequestPayload] = useState('{\n  "deviceIp": "192.168.88.1",\n  "pingCount": 4\n}');
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [isLoadingSandbox, setIsLoadingSandbox] = useState(false);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randomHash = Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      keySecret: `nw_live_${randomHash}`,
      scope: newKeyScope,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastUsed: 'Never',
      status: 'active',
    };

    setApiKeys([newKey, ...apiKeys]);
    if (onAddAuditLog) {
      onAddAuditLog('GENERATE_API_KEY', 'Security & API', `Dibuat API Key baru: ${newKeyName} [Scope: ${newKeyScope}]`);
    }
    setNewKeyName('');
    setIsModalOpen(false);
  };

  const handleRevokeKey = (id: string) => {
    const target = apiKeys.find((k) => k.id === id);
    setApiKeys(apiKeys.map((k) => (k.id === id ? { ...k, status: 'revoked' } : k)));
    if (onAddAuditLog && target) {
      onAddAuditLog('REVOKE_API_KEY', 'Security & API', `Revoked API Secret Key: ${target.name}`);
    }
  };

  const handleExecuteSandbox = async () => {
    setIsLoadingSandbox(true);
    setResponseOutput(null);
    setResponseStatus(null);

    // Simulate real REST API call to server.ts or internal mock endpoints
    setTimeout(() => {
      setIsLoadingSandbox(false);
      setResponseStatus(200);
      if (onAddAuditLog) {
        onAddAuditLog('EXECUTE_SANDBOX_API', 'API Sandbox', `Requested ${httpMethod} ${selectedEndpoint}`);
      }

      if (selectedEndpoint === '/api/v1/telemetry') {
        setResponseOutput(
          JSON.stringify(
            {
              status: 'success',
              timestamp: new Date().toISOString(),
              systemMetrics: {
                activeBandwidthMbps: { download: 412.5, upload: 184.2 },
                latencyMs: 3.4,
                packetLossPct: 0.0,
                connectedDevices: 48,
                cpuUsagePct: 28.4,
              },
            },
            null,
            2
          )
        );
      } else if (selectedEndpoint === '/api/v1/mikrotik/status') {
        setResponseOutput(
          JSON.stringify(
            {
              status: 'success',
              device: 'MikroTik CCR1036-12G-4S',
              routerOS: '7.15.2',
              identity: 'MikroTik-Master-CCR1036',
              activeInterfaces: [
                { name: 'ether1-WAN', speed: '10 Gbps', rxMbps: 412.5, txMbps: 184.2 },
                { name: 'ether2-LAN1', speed: '1 Gbps', rxMbps: 88.1, txMbps: 42.0 },
                { name: 'sfp-plus1', speed: '10 Gbps', rxMbps: 310.0, txMbps: 120.5 },
              ],
            },
            null,
            2
          )
        );
      } else if (selectedEndpoint === '/api/v1/alerts') {
        setResponseOutput(
          JSON.stringify(
            {
              status: 'success',
              totalAlerts: 3,
              activeCritical: 0,
              recentAlerts: [
                { id: 'alt-1', title: 'High CPU Spike on Server DB-01', severity: 'warning', time: '10 mins ago' },
                { id: 'alt-2', title: 'WAF Rate Limit Exceeded - 182.16.4.10', severity: 'info', time: '25 mins ago' },
              ],
            },
            null,
            2
          )
        );
      } else if (selectedEndpoint === '/api/v1/ping-test') {
        setResponseOutput(
          JSON.stringify(
            {
              status: 'success',
              target: '192.168.88.1',
              packetsSent: 4,
              packetsReceived: 4,
              lossPct: 0,
              minRttMs: 1.1,
              avgRttMs: 1.8,
              maxRttMs: 2.4,
            },
            null,
            2
          )
        );
      } else {
        setResponseOutput(
          JSON.stringify(
            {
              status: 'success',
              endpoint: selectedEndpoint,
              method: httpMethod,
              executedAt: new Date().toISOString(),
              message: 'Endpoint executed successfully.',
            },
            null,
            2
          )
        );
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Key className="w-6 h-6 text-cyan-400" />
            API Sync & Integration Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola API Keys, batasan hak akses (Scope), serta jalankan pengujian endpoint melalui Interactive REST API Sandbox.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-950/50"
        >
          <Plus className="w-4 h-4" />
          Generate New API Key
        </button>
      </div>

      {/* Grid: Key Management & Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Keys Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Active API Secret Keys
            </h2>
            <span className="text-xs text-slate-400 font-mono">Total: {apiKeys.length} Keys</span>
          </div>

          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className={`p-4 rounded-xl border transition ${
                  key.status === 'revoked'
                    ? 'bg-slate-950/50 border-slate-900 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-100">{key.name}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono rounded-full font-bold uppercase ${
                        key.scope === 'admin'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : key.scope === 'write'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {key.scope}
                    </span>
                  </div>
                  {key.status === 'active' ? (
                    <button
                      onClick={() => handleRevokeKey(key.id)}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-medium transition flex items-center gap-1"
                      title="Cabut / Revoke Key"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Revoke
                    </button>
                  ) : (
                    <span className="text-[10px] text-rose-400 font-semibold font-mono">REVOKED</span>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
                  <span className="text-cyan-400 flex-1 truncate">{key.keySecret}</span>
                  <button
                    onClick={() => handleCopy(key.id, key.keySecret)}
                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition"
                    title="Copy Key to Clipboard"
                  >
                    {copiedId === key.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500 font-mono">
                  <span>Dibuat: {key.createdAt}</span>
                  <span>Aktif Terakhir: {key.lastUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: REST API Sandbox Tester (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Interactive API Sandbox
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Live Mock Backend
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {/* Method & Endpoint Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Endpoint URL
              </label>
              <div className="flex gap-2">
                <select
                  value={httpMethod}
                  onChange={(e) => setHttpMethod(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <select
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="/api/v1/telemetry">/api/v1/telemetry</option>
                  <option value="/api/v1/mikrotik/status">/api/v1/mikrotik/status</option>
                  <option value="/api/v1/alerts">/api/v1/alerts</option>
                  <option value="/api/v1/ping-test">/api/v1/ping-test</option>
                </select>
              </div>
            </div>

            {/* Authorization Header */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                X-API-KEY Header
              </label>
              <input
                type="text"
                value={sandboxApiKey}
                onChange={(e) => setSandboxApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecuteSandbox}
              disabled={isLoadingSandbox}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50"
            >
              {isLoadingSandbox ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" /> Executing Request...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Execute API Request
                </>
              )}
            </button>

            {/* Response Console Window */}
            {responseStatus && (
              <div className="space-y-2 mt-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Response Console</span>
                  <span
                    className={`font-bold ${
                      responseStatus === 200 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    HTTP {responseStatus} OK
                  </span>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48 scrollbar-thin scrollbar-thumb-slate-800">
                  {responseOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Generate New Key */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              Generate API Secret Key Baru
            </h3>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nama Aplikasi / Penggunaan</label>
                <input
                  type="text"
                  placeholder="Contoh: Grafana Live Monitoring, Custom Python Agent"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Hak Akses Scope</label>
                <select
                  value={newKeyScope}
                  onChange={(e) => setNewKeyScope(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="read">Read-Only (Hanya Baca Metrics)</option>
                  <option value="write">Read & Write (Ingest Telemetry Data)</option>
                  <option value="admin">Full Admin Access (Kontrol Penuh Router & Server)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold"
                >
                  Buat Key Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
