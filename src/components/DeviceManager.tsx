import React, { useState } from 'react';
import {
  Server,
  Router,
  HardDrive,
  Globe,
  Shield,
  Search,
  Plus,
  RefreshCw,
  Zap,
  Activity,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Terminal,
} from 'lucide-react';

export interface DeviceItem {
  id: string;
  name: string;
  ipAddress: string;
  macAddress: string;
  type: 'router' | 'server' | 'switch' | 'firewall' | 'iot';
  location: string;
  status: 'online' | 'warning' | 'offline';
  latencyMs: number;
  lastPing: string;
}

interface DeviceManagerProps {
  onNavigateTab?: (tab: string) => void;
}

export const DeviceManager: React.FC<DeviceManagerProps> = ({ onNavigateTab }) => {
  const [devices, setDevices] = useState<DeviceItem[]>([
    {
      id: 'dev-1',
      name: 'MikroTik CCR1036-12G-4S (Master)',
      ipAddress: '192.168.77.1',
      macAddress: 'D4:CA:6D:88:01:0A',
      type: 'router',
      location: 'Rack 01 - HQ DataCenter',
      status: 'online',
      latencyMs: 1.2,
      lastPing: 'Just now',
    },
    {
      id: 'dev-2',
      name: 'Dell PowerEdge R750 (Production DB)',
      ipAddress: '10.0.10.15',
      macAddress: '98:03:9B:44:12:FE',
      type: 'server',
      location: 'Rack 02 - Server Room',
      status: 'online',
      latencyMs: 2.4,
      lastPing: 'Just now',
    },
    {
      id: 'dev-3',
      name: 'Cisco Catalyst 9300 Core Switch',
      ipAddress: '192.168.88.2',
      macAddress: '00:1E:13:A1:88:22',
      type: 'switch',
      location: 'Rack 01 - Network Closet',
      status: 'online',
      latencyMs: 0.8,
      lastPing: '1 min ago',
    },
    {
      id: 'dev-4',
      name: 'FortiGate 100F Perimeter Firewall',
      ipAddress: '10.0.0.1',
      macAddress: '70:4C:A5:10:00:01',
      type: 'firewall',
      location: 'Rack 01 - Perimeter Guard',
      status: 'warning',
      latencyMs: 18.5,
      lastPing: '2 mins ago',
    },
    {
      id: 'dev-5',
      name: 'Raspberry Pi Environmental Sensor',
      ipAddress: '192.168.88.105',
      macAddress: 'DC:A6:32:90:11:44',
      type: 'iot',
      location: 'Server Room - Ceiling Alpha',
      status: 'offline',
      latencyMs: 0,
      lastPing: '12 mins ago',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [pingingDeviceId, setPingingDeviceId] = useState<string | null>(null);
  const [pingResultModal, setPingResultModal] = useState<{
    device: DeviceItem;
    rttList: number[];
  } | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    ipAddress: '',
    macAddress: '',
    type: 'router' as DeviceItem['type'],
    location: '',
  });

  const handleRunPingTest = (device: DeviceItem) => {
    setPingingDeviceId(device.id);

    setTimeout(() => {
      setPingingDeviceId(null);

      // Generate 4 RTT values
      const baseLat = device.status === 'offline' ? 0 : device.latencyMs || 2.5;
      const rttList =
        device.status === 'offline'
          ? [-1, -1, -1, -1]
          : [
              Number((baseLat + (Math.random() - 0.5) * 1.2).toFixed(1)),
              Number((baseLat + (Math.random() - 0.5) * 1.5).toFixed(1)),
              Number((baseLat + (Math.random() - 0.5) * 0.8).toFixed(1)),
              Number((baseLat + (Math.random() - 0.5) * 1.0).toFixed(1)),
            ];

      setPingResultModal({ device, rttList });
    }, 800);
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevice.name || !newDevice.ipAddress) return;

    const added: DeviceItem = {
      id: `dev-${Date.now()}`,
      name: newDevice.name,
      ipAddress: newDevice.ipAddress,
      macAddress: newDevice.macAddress || 'AA:BB:CC:11:22:33',
      type: newDevice.type,
      location: newDevice.location || 'Default Rack',
      status: 'online',
      latencyMs: 2.1,
      lastPing: 'Just added',
    };

    setDevices([added, ...devices]);
    setNewDevice({ name: '', ipAddress: '', macAddress: '', type: 'router', location: '' });
    setIsAddModalOpen(false);
  };

  const handleDeleteDevice = (id: string) => {
    setDevices(devices.filter((d) => d.id !== id));
  };

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ipAddress.includes(searchTerm) ||
      d.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || d.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-400" />
            Network Target Device Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola seluruh node router, server, switch, firewall, dan sensor IoT. Lakukan pengujian ICMP Ping live.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-950/50"
        >
          <Plus className="w-4 h-4" />
          Tambah Target Device Baru
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari IP, nama device, atau lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {['all', 'router', 'server', 'switch', 'firewall', 'iot'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                filterType === t
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((dev) => (
          <div
            key={dev.id}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">
                  {dev.type === 'router' && <Router className="w-5 h-5" />}
                  {dev.type === 'server' && <Server className="w-5 h-5" />}
                  {dev.type === 'switch' && <HardDrive className="w-5 h-5" />}
                  {dev.type === 'firewall' && <Shield className="w-5 h-5 text-purple-400" />}
                  {dev.type === 'iot' && <Zap className="w-5 h-5 text-amber-400" />}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-100 truncate max-w-[160px]">{dev.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono block">{dev.location}</span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                  dev.status === 'online'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : dev.status === 'warning'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {dev.status === 'online' && <CheckCircle2 className="w-3 h-3" />}
                {dev.status === 'warning' && <AlertTriangle className="w-3 h-3" />}
                {dev.status === 'offline' && <XCircle className="w-3 h-3" />}
                {dev.status.toUpperCase()}
              </span>
            </div>

            {/* IP & MAC Details */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">IP Address:</span>
                <span className="text-cyan-400 font-bold">{dev.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MAC Address:</span>
                <span className="text-slate-300">{dev.macAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Latency:</span>
                <span className="text-emerald-400">{dev.status === 'offline' ? 'N/A' : `${dev.latencyMs} ms`}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1 gap-2">
              <button
                onClick={() => handleRunPingTest(dev)}
                disabled={pingingDeviceId === dev.id}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1 transition"
              >
                {pingingDeviceId === dev.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                Ping Test
              </button>

              {onNavigateTab && (
                <button
                  onClick={() => {
                    if (dev.type === 'router') onNavigateTab('mikrotik');
                    else if (dev.type === 'server') onNavigateTab('servers');
                    else if (dev.type === 'firewall') onNavigateTab('waf');
                    else onNavigateTab('overview');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-semibold border border-slate-800 transition truncate"
                  title="Buka Halaman Monitor Khusus"
                >
                  {dev.type === 'router' && 'Open Router Tab'}
                  {dev.type === 'server' && 'Open Server Tab'}
                  {dev.type === 'firewall' && 'Open WAF Tab'}
                  {(dev.type === 'switch' || dev.type === 'iot') && 'Open Overview'}
                </button>
              )}

              <button
                onClick={() => handleDeleteDevice(dev.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                title="Hapus Device"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ping Result Modal */}
      {pingResultModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                ICMP Ping Test Result: {pingResultModal.device.name}
              </h3>
              <button
                onClick={() => setPingResultModal(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1.5">
              <p className="text-slate-400">
                PING {pingResultModal.device.ipAddress} ({pingResultModal.device.ipAddress}) 56(84) bytes of data.
              </p>
              {pingResultModal.rttList.map((rtt, idx) => (
                <p key={idx}>
                  {rtt < 0 ? (
                    <span className="text-rose-400">Request timeout for icmp_seq {idx + 1}</span>
                  ) : (
                    `64 bytes from ${pingResultModal.device.ipAddress}: icmp_seq=${idx + 1} ttl=64 time=${rtt} ms`
                  )}
                </p>
              ))}
              <div className="pt-2 border-t border-slate-900 text-slate-300">
                <p>--- {pingResultModal.device.ipAddress} ping statistics ---</p>
                <p>4 packets transmitted, 4 received, 0% packet loss</p>
              </div>
            </div>

            <button
              onClick={() => setPingResultModal(null)}
              className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Tutup Hasil Ping
            </button>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              Tambah Device Monitoring Baru
            </h3>

            <form onSubmit={handleAddDevice} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nama Device / Server</label>
                <input
                  type="text"
                  placeholder="Contoh: Router Mikrotik Core East"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">IP Address</label>
                  <input
                    type="text"
                    placeholder="192.168.1.1"
                    value={newDevice.ipAddress}
                    onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tipe Device</label>
                  <select
                    value={newDevice.type}
                    onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="router">Router</option>
                    <option value="server">Server</option>
                    <option value="switch">Switch</option>
                    <option value="firewall">Firewall</option>
                    <option value="iot">IoT / Sensor</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">MAC Address (Opsional)</label>
                <input
                  type="text"
                  placeholder="00:11:22:33:44:55"
                  value={newDevice.macAddress}
                  onChange={(e) => setNewDevice({ ...newDevice, macAddress: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Lokasi Penempatan</label>
                <input
                  type="text"
                  placeholder="Rack 01 - Server Room HQ"
                  value={newDevice.location}
                  onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold"
                >
                  Simpan Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
