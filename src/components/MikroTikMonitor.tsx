import React, { useState, useEffect } from 'react';
import {
  Router,
  Wifi,
  Activity,
  Cpu,
  HardDrive,
  Clock,
  Terminal,
  RefreshCw,
  Shield,
  Layers,
  CheckCircle2,
  Play,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  SlidersHorizontal,
  Globe,
  Filter,
  Network,
  ListFilter,
  Settings2,
  Maximize2,
  Zap,
  Radio,
  FileText,
  Users,
  LayoutGrid,
  GripVertical,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Move,
} from 'lucide-react';
import { NodeMetric } from '../types';

interface MikroTikMonitorProps {
  mikrotikNodes: NodeMetric[];
  onRefresh: () => void;
}

// Reusable Pagination Controls
const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}> = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
    <div>
      Menampilkan <span className="text-slate-200 font-bold">{totalItems === 0 ? 0 : startIndex}-{endIndex}</span> dari{' '}
      <span className="text-slate-200 font-bold">{totalItems}</span> entri
    </div>
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-1.5">
        <span>Baris per halaman:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => {
            onRowsPerPageChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 font-semibold">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

// Draggable Panel Container Component
const DraggablePanelWrapper: React.FC<{
  panelKey: string;
  index: number;
  totalPanels: number;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}> = ({
  panelKey,
  index,
  totalPanels,
  title,
  subtitle,
  icon,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  headerActions,
  children,
  fullWidth = false,
}) => {
  return (
    <div
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`bg-slate-900/90 border rounded-2xl p-5 space-y-4 transition-all duration-200 group ${
        fullWidth ? 'col-span-1 lg:col-span-2' : 'col-span-1'
      } ${
        isDragging
          ? 'opacity-40 border-dashed border-cyan-400 scale-[0.99] bg-slate-950/80 shadow-2xl'
          : isDragOver
          ? 'border-cyan-400 border-2 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/20'
          : 'border-slate-800/90 hover:border-slate-700'
      }`}
    >
      {/* Panel Top Control Bar with Drag Handle, Icon, Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5 min-w-0 w-full sm:w-auto">
          <div
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 group-hover:text-cyan-400 cursor-grab active:cursor-grabbing hover:bg-slate-700 transition flex items-center justify-center flex-shrink-0 select-none"
            title="Pegang icon ini untuk tarik & geser (drag & drop) posisi panel"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex-shrink-0">
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-slate-100 truncate">{title}</h3>
              <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700/60">
                #{index + 1}
              </span>
            </div>
            {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          {headerActions}

          {/* Up / Down Navigation Controls */}
          <div className="flex items-center space-x-1 pl-2 border-l border-slate-800/80 flex-shrink-0">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-slate-300 transition"
              title="Geser Panel ke Atas"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === totalPanels - 1}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-slate-300 transition"
              title="Geser Panel ke Bawah"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Panel Children Body with Text Selection Support */}
      <div className="select-text space-y-4">
        {children}
      </div>
    </div>
  );
};

export const MikroTikMonitor: React.FC<MikroTikMonitorProps> = ({ mikrotikNodes, onRefresh }) => {
  const [selectedRouterId, setSelectedRouterId] = useState<string>(mikrotikNodes[0]?.id || '');
  const currentRouter = mikrotikNodes.find((r) => r.id === selectedRouterId) || mikrotikNodes[0];

  // Configurable Dashboard Panels State
  const [activePanels, setActivePanels] = useState<{ [key: string]: boolean }>({
    overviewStats: true,
    interfacesTable: true,
    dhcpLeasesTable: true,
    ipAddresses: true,
    firewallRules: true,
    simpleQueues: true,
    arpNeighbors: true,
    hotspotSessions: false,
    systemLogs: true,
    terminalConsole: true,
  });

  // Reorderable Panel Sequence State
  const defaultPanelOrder = [
    'overviewStats',
    'interfacesTable',
    'dhcpLeasesTable',
    'ipAddresses',
    'firewallRules',
    'simpleQueues',
    'arpNeighbors',
    'hotspotSessions',
    'systemLogs',
    'terminalConsole',
  ];

  const [panelOrder, setPanelOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mikrotik_panel_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const missing = defaultPanelOrder.filter((k) => !parsed.includes(k));
          return [...parsed, ...missing];
        }
      }
    } catch (e) {
      // ignore
    }
    return defaultPanelOrder;
  });

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Drag & Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Search & Pagination States for Panels
  const [ifaceSearch, setIfaceSearch] = useState('');
  const [ifaceTypeFilter, setIfaceTypeFilter] = useState('all');
  const [ifacePage, setIfacePage] = useState(1);
  const [ifaceRows, setIfaceRows] = useState(5);

  const [dhcpSearch, setDhcpSearch] = useState('');
  const [dhcpPage, setDhcpPage] = useState(1);
  const [dhcpRows, setDhcpRows] = useState(5);

  const [fwSearch, setFwSearch] = useState('');
  const [fwPage, setFwPage] = useState(1);
  const [fwRows, setFwRows] = useState(5);

  const [ipSearch, setIpSearch] = useState('');
  const [ipPage, setIpPage] = useState(1);
  const [ipRows, setIpRows] = useState(5);

  const [queueSearch, setQueueSearch] = useState('');
  const [queuePage, setQueuePage] = useState(1);
  const [queueRows, setQueueRows] = useState(5);

  const [arpSearch, setArpSearch] = useState('');
  const [arpPage, setArpPage] = useState(1);
  const [arpRows, setArpRows] = useState(5);

  const [logSearch, setLogSearch] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [logRows, setLogRows] = useState(5);

  const [userSessionSearch, setUserSessionSearch] = useState('');
  const [userSessionPage, setUserSessionPage] = useState(1);
  const [userSessionRows, setUserSessionRows] = useState(5);

  // Terminal state
  const [terminalCommand, setTerminalCommand] = useState('/system resource print');
  const [terminalOutput, setTerminalOutput] = useState<string>(
    `[admin@MikroTik-CCR2004] > /system resource print\n            uptime: 142d18h32m10s\n           version: 7.15.2 (stable)\n        build-time: Jun/12/2026 14:10:02\n       factory-software: 7.10\n       free-memory: 3.8GiB\n      total-memory: 4.0GiB\n               cpu: ARM64-16Core\n         cpu-count: 16\n     cpu-frequency: 1700MHz\n          cpu-load: 34%\n    free-hdd-space: 112.4MiB\n   total-hdd-space: 128.0MiB\n  architecture-name: arm64\n         board-name: CCR2004-16G-2S+\n           platform: MikroTik`
  );

  // REST API Test State
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{
    status: 'idle' | 'success' | 'failed';
    mode?: string;
    targetHost?: string;
    details?: string;
    rawJson?: any;
  }>({ status: 'idle' });

  const handleTestRealApi = async () => {
    setIsTestingApi(true);
    try {
      const res = await fetch('/api/mikrotik/resource');
      const data = await res.json();
      setApiTestResult({
        status: 'success',
        mode: data.mode,
        targetHost: data.host || data.targetHost || '192.168.77.1',
        details:
          data.mode === 'live_routeros_rest'
            ? 'Terhubung LANGSUNG ke RouterOS via REST API (port 80)!'
            : 'Berhasil merespon dari backend NetWatch dengan mode Konfigurasi IP Live 192.168.77.1.',
        rawJson: data,
      });
    } catch (err: any) {
      setApiTestResult({
        status: 'failed',
        details: `Gagal menghubungi backend API NetWatch: ${err?.message || 'Network Error'}`,
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Comprehensive MikroTik Datasets
  const allInterfaces = [
    { name: 'sfp-sfpplus1 (WAN Primary)', type: 'sfp', status: 'Up', speed: '10 Gbps', rx: '382.4 Mbps', tx: '168.2 Mbps', mtu: 1500, rxPackets: '4,281,920/s', txPackets: '1,920,410/s' },
    { name: 'sfp-sfpplus2 (WAN Backup)', type: 'sfp', status: 'Up', speed: '10 Gbps', rx: '0.2 Mbps', tx: '0.1 Mbps', mtu: 1500, rxPackets: '1,200/s', txPackets: '800/s' },
    { name: 'ether1-gateway (Trunk Uplink)', type: 'ether', status: 'Up', speed: '1 Gbps', rx: '100.1 Mbps', tx: '46.9 Mbps', mtu: 1500, rxPackets: '1,120,400/s', txPackets: '510,200/s' },
    { name: 'ether2-server-farm', type: 'ether', status: 'Up', speed: '1 Gbps', rx: '85.4 Mbps', tx: '112.0 Mbps', mtu: 1500, rxPackets: '980,100/s', txPackets: '1,240,000/s' },
    { name: 'ether3-cctv-nvr', type: 'ether', status: 'Up', speed: '1 Gbps', rx: '42.1 Mbps', tx: '2.4 Mbps', mtu: 1500, rxPackets: '320,100/s', txPackets: '45,000/s' },
    { name: 'ether4-wifi-ap-main', type: 'ether', status: 'Up', speed: '1 Gbps', rx: '145.8 Mbps', tx: '92.3 Mbps', mtu: 1500, rxPackets: '1,890,000/s', txPackets: '1,120,000/s' },
    { name: 'ether5-backup-nas', type: 'ether', status: 'Up', speed: '1 Gbps', rx: '12.0 Mbps', tx: '250.4 Mbps', mtu: 1500, rxPackets: '110,000/s', txPackets: '2,900,000/s' },
    { name: 'ether6-lab-komputer-ft', type: 'ether', status: 'Up', speed: '1 Gbps', rx: '68.2 Mbps', tx: '34.1 Mbps', mtu: 1500, rxPackets: '540,000/s', txPackets: '280,000/s' },
    { name: 'ether7-gedung-rektorat', type: 'ether', status: 'Up', speed: '1 Gbps', rx: '28.5 Mbps', tx: '19.2 Mbps', mtu: 1500, rxPackets: '210,000/s', txPackets: '150,000/s' },
    { name: 'ether8-gedung-perpus', type: 'ether', status: 'Up', speed: '1 Gbps', rx: '18.1 Mbps', tx: '12.0 Mbps', mtu: 1500, rxPackets: '140,000/s', txPackets: '90,000/s' },
    { name: 'ether9-fakultas-teknik', type: 'ether', status: 'Up', speed: '1 Gbps', rx: '95.0 Mbps', tx: '50.4 Mbps', mtu: 1500, rxPackets: '890,000/s', txPackets: '480,000/s' },
    { name: 'ether10-fakultas-mipa', type: 'ether', status: 'Up', speed: '1 Gbps', rx: '44.2 Mbps', tx: '22.1 Mbps', mtu: 1500, rxPackets: '380,000/s', txPackets: '190,000/s' },
    { name: 'ether11-fakultas-ekonomi', type: 'ether', status: 'Up', speed: '1 Gbps', rx: '31.0 Mbps', tx: '15.5 Mbps', mtu: 1500, rxPackets: '290,000/s', txPackets: '140,000/s' },
    { name: 'ether12-voip-asterisk', type: 'ether', status: 'Up', speed: '100 Mbps', rx: '4.2 Mbps', tx: '4.2 Mbps', mtu: 1500, rxPackets: '85,000/s', txPackets: '85,000/s' },
    { name: 'ether13-mgmt-console', type: 'ether', status: 'Up', speed: '100 Mbps', rx: '0.1 Mbps', tx: '0.1 Mbps', mtu: 1500, rxPackets: '1,200/s', txPackets: '1,100/s' },
    { name: 'ether14-hotspot-portal', type: 'ether', status: 'Up', speed: '1 Gbps', rx: '110.4 Mbps', tx: '78.2 Mbps', mtu: 1500, rxPackets: '1,200,000/s', txPackets: '850,000/s' },
    { name: 'ether15-iot-sensors', type: 'ether', status: 'Up', speed: '100 Mbps', rx: '1.2 Mbps', tx: '0.4 Mbps', mtu: 1500, rxPackets: '12,000/s', txPackets: '4,000/s' },
    { name: 'ether16-spare-uplink', type: 'ether', status: 'Down', speed: '1 Gbps', rx: '0 Mbps', tx: '0 Mbps', mtu: 1500, rxPackets: '0/s', txPackets: '0/s' },
    { name: 'bridge1-lan (Main Bridge)', type: 'bridge', status: 'Up', speed: '1 Gbps', rx: '240.5 Mbps', tx: '180.2 Mbps', mtu: 1500, rxPackets: '2,800,000/s', txPackets: '2,100,000/s' },
    { name: 'vlan10-mgmt (Management)', type: 'vlan', status: 'Up', speed: '1 Gbps', rx: '1.5 Mbps', tx: '0.8 Mbps', mtu: 1500, rxPackets: '15,000/s', txPackets: '8,000/s' },
    { name: 'vlan20-staff (Dosen & Staf)', type: 'vlan', status: 'Up', speed: '1 Gbps', rx: '62.0 Mbps', tx: '41.2 Mbps', mtu: 1500, rxPackets: '510,000/s', txPackets: '380,000/s' },
    { name: 'vlan30-student (Mahasiswa)', type: 'vlan', status: 'Up', speed: '1 Gbps', rx: '180.4 Mbps', tx: '120.1 Mbps', mtu: 1500, rxPackets: '1,950,000/s', txPackets: '1,400,000/s' },
    { name: 'vlan40-voip (IP Telephony)', type: 'vlan', status: 'Up', speed: '1 Gbps', rx: '8.4 Mbps', tx: '8.4 Mbps', mtu: 1500, rxPackets: '95,000/s', txPackets: '95,000/s' },
    { name: 'vlan50-servers (Data Center)', type: 'vlan', status: 'Up', speed: '10 Gbps', rx: '210.8 Mbps', tx: '310.2 Mbps', mtu: 1500, rxPackets: '2,200,000/s', txPackets: '3,100,000/s' },
    { name: 'wireguard-site2site (Tunnel Campus B)', type: 'tunnel', status: 'Up', speed: '1 Gbps', rx: '14.2 Mbps', tx: '22.8 Mbps', mtu: 1420, rxPackets: '180,000/s', txPackets: '240,000/s' },
    { name: 'pppoe-out1 (ISP Speednet)', type: 'pppoe', status: 'Up', speed: '1 Gbps', rx: '380.0 Mbps', tx: '165.0 Mbps', mtu: 1492, rxPackets: '4,100,000/s', txPackets: '1,800,000/s' },
  ];

  const allDhcpLeases = [
    { ip: '192.168.77.105', mac: 'BC:D1:D3:44:11:A2', hostname: 'PC-Admin-DC01', status: 'bound', expires: '07h 42m' },
    { ip: '192.168.77.112', mac: '70:85:C2:A1:33:FF', hostname: 'AccessPoint-Floor2', status: 'bound', expires: '11h 10m' },
    { ip: '192.168.77.140', mac: 'E4:5F:01:88:99:CC', hostname: 'IP-Camera-Entrance', status: 'bound', expires: '23h 59m' },
    { ip: '192.168.77.188', mac: 'AC:87:A3:12:34:56', hostname: 'Nginx-ReverseProxy', status: 'bound (static)', expires: 'never' },
    { ip: '192.168.77.12', mac: '00:1A:2B:3C:4D:5E', hostname: 'Server-Proxmox-Node1', status: 'bound (static)', expires: 'never' },
    { ip: '192.168.77.15', mac: '00:1A:2B:3C:4D:5F', hostname: 'Server-NAS-Synology', status: 'bound (static)', expires: 'never' },
    { ip: '192.168.77.201', mac: '90:B6:86:12:88:AA', hostname: 'Laptop-Dekan-FT', status: 'bound', expires: '02h 15m' },
    { ip: '192.168.77.210', mac: '34:E6:D7:99:00:11', hostname: 'SmartTV-R-Rapat', status: 'bound', expires: '05h 00m' },
    { ip: '192.168.77.225', mac: 'D8:50:E6:77:88:99', hostname: 'Printer-Laser-Rektorat', status: 'bound (static)', expires: 'never' },
    { ip: '192.168.77.230', mac: '50:C7:BF:11:22:33', hostname: 'Fingerprint-Absen-Lobi', status: 'bound', expires: '18h 30m' },
    { ip: '192.168.77.240', mac: '18:60:B1:44:55:66', hostname: 'AccessControl-Gate', status: 'bound', expires: '12h 00m' },
    { ip: '192.168.77.250', mac: '78:8A:20:99:88:77', hostname: 'Backup-NAS-Office', status: 'bound', expires: '09h 45m' },
    { ip: '192.168.77.101', mac: '12:34:56:78:9A:BC', hostname: 'PC-Lab-Komputer-01', status: 'bound', expires: '01h 20m' },
    { ip: '192.168.77.102', mac: '12:34:56:78:9A:BD', hostname: 'PC-Lab-Komputer-02', status: 'bound', expires: '01h 25m' },
    { ip: '192.168.77.103', mac: '12:34:56:78:9A:BE', hostname: 'PC-Lab-Komputer-03', status: 'bound', expires: '01h 30m' },
    { ip: '192.168.77.104', mac: '12:34:56:78:9A:BF', hostname: 'PC-Lab-Komputer-04', status: 'bound', expires: '01h 35m' },
  ];

  const allFirewallRules = [
    { chain: 'input', action: 'accept', protocol: 'icmp', port: 'any', src: '192.168.77.0/24', comment: 'Allow Ping LAN Gateway' },
    { chain: 'input', action: 'accept', protocol: 'tcp', port: '8728, 80, 443, 22', src: '192.168.77.0/24', comment: 'Allow Admin Management (API, Winbox, REST)' },
    { chain: 'input', action: 'drop', protocol: 'all', port: 'any', src: '0.0.0.0/0', comment: 'Drop Invalid & Unsolicited External Packets' },
    { chain: 'forward', action: 'fasttrack', protocol: 'tcp, udp', port: 'any', src: 'any', comment: 'FastTrack Established & Related Connections' },
    { chain: 'forward', action: 'accept', protocol: 'all', port: 'any', src: 'any', comment: 'Accept Established & Related Connections' },
    { chain: 'srcnat (NAT)', action: 'masquerade', protocol: 'all', port: 'any', src: '192.168.77.0/24', comment: 'WAN Masquerade Primary (sfp-sfpplus1)' },
    { chain: 'dstnat (NAT)', action: 'dst-nat', protocol: 'tcp', port: '443', src: '0.0.0.0/0', comment: 'WAF Reverse Proxy Port Forward -> 192.168.77.188:443' },
    { chain: 'dstnat (NAT)', action: 'dst-nat', protocol: 'udp', port: '51820', src: '0.0.0.0/0', comment: 'WireGuard Site-to-Site VPN Service Port' },
    { chain: 'forward', action: 'drop', protocol: 'all', port: 'any', src: '10.30.0.0/20', comment: 'Block Guest Mahasiswa to Management VLAN10' },
    { chain: 'input', action: 'drop', protocol: 'all', port: 'any', src: 'blacklist-botnet', comment: 'Block Known DDoS & Botnet IP List' },
  ];

  const allIpAddresses = [
    { address: '192.168.77.1/24', network: '192.168.77.0', interfaceName: 'bridge1-lan', flags: 'DAC (Dynamic, Active, Connected)', comment: 'Main LAN Gateway' },
    { address: '10.10.10.1/24', network: '10.10.10.0', interfaceName: 'vlan10-mgmt', flags: 'DAC', comment: 'Management Network' },
    { address: '10.20.0.1/22', network: '10.20.0.0', interfaceName: 'vlan20-staff', flags: 'DAC', comment: 'Dosen & Staf Office Subnet' },
    { address: '10.30.0.1/20', network: '10.30.0.0', interfaceName: 'vlan30-student', flags: 'DAC', comment: 'Campus Mahasiswa Hotspot Pool' },
    { address: '10.50.0.1/24', network: '10.50.0.0', interfaceName: 'vlan50-servers', flags: 'DAC', comment: 'Data Center Internal DMZ' },
    { address: '10.200.0.1/30', network: '10.200.0.0', interfaceName: 'wireguard-site2site', flags: 'DAC', comment: 'Site-to-Site Tunnel Campus B' },
    { address: '202.152.10.42/30', network: '202.152.10.40', interfaceName: 'sfp-sfpplus1', flags: 'Static WAN', comment: 'ISP Primary Dedicated IP' },
    { address: '0.0.0.0/0 (Default Route)', network: '0.0.0.0', interfaceName: 'Gateway: 202.152.10.41', flags: 'Active Static Route', comment: 'Primary WAN Gateway Route' },
  ];

  const allSimpleQueues = [
    { name: 'Q-Rektorat-VVIP', target: '192.168.77.200/29', maxLimit: '100M / 100M', burst: '200M / 200M', priority: '1 (Highest)', packets: '2,480,100' },
    { name: 'Q-Server-Farm-DMZ', target: 'vlan50-servers', maxLimit: '500M / 500M', burst: '1G / 1G', priority: '2 (High)', packets: '12,980,400' },
    { name: 'Q-Staff-Dosen-Office', target: 'vlan20-staff', maxLimit: '30M / 30M', burst: '50M / 50M', priority: '3 (Medium)', packets: '4,120,000' },
    { name: 'Q-Lab-Komputer-FT', target: 'ether6-lab-komputer-ft', maxLimit: '50M / 50M', burst: '80M / 80M', priority: '4 (Normal)', packets: '3,800,900' },
    { name: 'Q-WiFi-Mahasiswa-Public', target: 'vlan30-student', maxLimit: '10M / 10M', burst: '20M / 20M', priority: '8 (Lowest)', packets: '18,400,200' },
    { name: 'Q-IPTV-VoIP-Priority', target: 'vlan40-voip', maxLimit: '20M / 20M', burst: '30M / 30M', priority: '1 (Highest)', packets: '950,000' },
  ];

  const allArpNeighbors = [
    { ip: '192.168.77.105', mac: 'BC:D1:D3:44:11:A2', interfaceName: 'bridge1-lan', identity: 'PC-Admin-DC01', protocol: 'ARP' },
    { ip: '192.168.77.112', mac: '70:85:C2:A1:33:FF', interfaceName: 'ether4-wifi-ap-main', identity: 'UniFi-6-Pro-AP', protocol: 'MNDP (MikroTik Neighbor)' },
    { ip: '192.168.77.2', mac: 'D4:CA:6D:12:34:56', interfaceName: 'sfp-sfpplus1', identity: 'CCR1036-Core-Switch', protocol: 'CDP/LLDP' },
    { ip: '192.168.77.188', mac: 'AC:87:A3:12:34:56', interfaceName: 'ether2-server-farm', identity: 'Ubuntu-Nginx-WAF', protocol: 'ARP' },
    { ip: '10.10.10.5', mac: 'CC:2D:E0:11:22:33', interfaceName: 'vlan10-mgmt', identity: 'CRS328-24P-4S+ Core Switch', protocol: 'MNDP' },
  ];

  const allSystemLogs = [
    { time: '10:14:22', topics: 'system, info', message: "User 'admin' logged in from 192.168.77.105 via WinBox/API", severity: 'info' },
    { time: '10:12:05', topics: 'dhcp, info', message: 'dhcp1 assigned 192.168.77.201 to 90:B6:86:12:88:AA (Laptop-Dekan)', severity: 'info' },
    { time: '09:55:40', topics: 'firewall, warning', message: 'input: drop ICMP flood attack from 185.220.101.5', severity: 'warning' },
    { time: '09:30:12', topics: 'interface, info', message: 'sfp-sfpplus1 link up (speed 10G, full duplex)', severity: 'info' },
    { time: '08:45:00', topics: 'wireguard, info', message: 'wireguard-site2site handshake succeeded with 10.200.0.2:51820', severity: 'info' },
    { time: '08:00:10', topics: 'system, warning', message: 'CPU temperature 48°C within normal operational threshold', severity: 'info' },
  ];

  const allHotspotSessions = [
    { user: 'dosen_komputer_01', ip: '10.20.2.14', uptime: '06h 40m', bytes: '1.2 GB / 4.8 GB', service: 'PPPoE' },
    { user: 'mahasiswa_2024_99', ip: '10.30.5.88', uptime: '02h 10m', bytes: '450 MB / 1.1 GB', service: 'Hotspot' },
    { user: 'staf_rektorat_05', ip: '10.20.1.12', uptime: '14h 50m', bytes: '8.5 GB / 12.1 GB', service: 'PPPoE' },
  ];

  // Filtering Functions
  const filteredInterfaces = allInterfaces.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(ifaceSearch.toLowerCase());
    const matchesType = ifaceTypeFilter === 'all' || item.type === ifaceTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredDhcp = allDhcpLeases.filter(
    (item) =>
      item.ip.includes(dhcpSearch) ||
      item.mac.toLowerCase().includes(dhcpSearch.toLowerCase()) ||
      item.hostname.toLowerCase().includes(dhcpSearch.toLowerCase())
  );

  const filteredFw = allFirewallRules.filter(
    (item) =>
      item.comment.toLowerCase().includes(fwSearch.toLowerCase()) ||
      item.chain.toLowerCase().includes(fwSearch.toLowerCase()) ||
      item.action.toLowerCase().includes(fwSearch.toLowerCase())
  );

  const filteredIp = allIpAddresses.filter(
    (item) =>
      item.address.includes(ipSearch) ||
      item.interfaceName.toLowerCase().includes(ipSearch.toLowerCase()) ||
      item.comment.toLowerCase().includes(ipSearch.toLowerCase())
  );

  const filteredQueues = allSimpleQueues.filter(
    (item) =>
      item.name.toLowerCase().includes(queueSearch.toLowerCase()) ||
      item.target.toLowerCase().includes(queueSearch.toLowerCase())
  );

  const filteredArp = allArpNeighbors.filter(
    (item) =>
      item.ip.includes(arpSearch) ||
      item.identity.toLowerCase().includes(arpSearch.toLowerCase()) ||
      item.mac.toLowerCase().includes(arpSearch.toLowerCase())
  );

  const filteredLogs = allSystemLogs.filter(
    (item) =>
      item.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      item.topics.toLowerCase().includes(logSearch.toLowerCase())
  );

  const filteredSessions = allHotspotSessions.filter(
    (item) =>
      item.user.toLowerCase().includes(userSessionSearch.toLowerCase()) ||
      item.ip.includes(userSessionSearch)
  );

  // Pagination Slice Calculators
  const getPaginated = <T,>(data: T[], page: number, rows: number) => {
    const totalPages = Math.max(1, Math.ceil(data.length / rows));
    const validPage = Math.min(page, totalPages);
    const startIndex = (validPage - 1) * rows;
    const endIndex = Math.min(startIndex + rows, data.length);
    return {
      paginated: data.slice(startIndex, endIndex),
      totalPages,
      validPage,
      totalItems: data.length,
      startIndex: data.length === 0 ? 0 : startIndex + 1,
      endIndex,
    };
  };

  const pagIface = getPaginated(filteredInterfaces, ifacePage, ifaceRows);
  const pagDhcp = getPaginated(filteredDhcp, dhcpPage, dhcpRows);
  const pagFw = getPaginated(filteredFw, fwPage, fwRows);
  const pagIp = getPaginated(filteredIp, ipPage, ipRows);
  const pagQueue = getPaginated(filteredQueues, queuePage, queueRows);
  const pagArp = getPaginated(filteredArp, arpPage, arpRows);
  const pagLog = getPaginated(filteredLogs, logPage, logRows);
  const pagSession = getPaginated(filteredSessions, userSessionPage, userSessionRows);

  const handleRunScript = () => {
    let output = `[admin@MikroTik] > ${terminalCommand}\n`;
    if (terminalCommand.includes('resource')) {
      output += `uptime: ${currentRouter?.uptime}\nversion: ${currentRouter?.routerOSVersion}\ncpu-load: ${currentRouter?.cpuUsage}%\nfree-memory: 3.8GiB`;
    } else if (terminalCommand.includes('interface')) {
      output += `Flags: R - RUNNING\n #   NAME                  TYPE       ACTUAL-MTU  L2MTU\n 0 R sfp-sfpplus1         ether      1500        1580\n 1 R ether1-gateway       ether      1500        1580\n 2 R bridge1-lan          bridge     1500        1580`;
    } else if (terminalCommand.includes('export') || terminalCommand.includes('backup')) {
      output += `# RouterOS script export backup generated\n/ip address add address=${currentRouter?.ip}/24 interface=bridge1-lan\n/snmp set enabled=yes contact="sysadmin@unmus.ac.id"`;
    } else {
      output += `Command executed successfully. Target: ${currentRouter?.ip} via SNMP / WinBox API.`;
    }
    setTerminalOutput(output);
  };

  const togglePanel = (panelKey: string) => {
    setActivePanels((prev) => ({
      ...prev,
      [panelKey]: !prev[panelKey],
    }));
  };

  // Reordering Logic for Main Dashboard
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropVisibleIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropVisibleIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const visiblePanelKeys = panelOrder.filter((k) => activePanels[k]);
    const sourceKey = visiblePanelKeys[draggedIndex];
    const targetKey = visiblePanelKeys[dropVisibleIndex];

    const sourceOrderIdx = panelOrder.indexOf(sourceKey);
    const targetOrderIdx = panelOrder.indexOf(targetKey);

    if (sourceOrderIdx !== -1 && targetOrderIdx !== -1) {
      const newOrder = [...panelOrder];
      const [removed] = newOrder.splice(sourceOrderIdx, 1);
      newOrder.splice(targetOrderIdx, 0, removed);
      setPanelOrder(newOrder);
      localStorage.setItem('mikrotik_panel_order', JSON.stringify(newOrder));
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const movePanelInVisibleList = (visibleIndex: number, direction: 'up' | 'down') => {
    const targetVisibleIndex = direction === 'up' ? visibleIndex - 1 : visibleIndex + 1;
    const visiblePanelKeys = panelOrder.filter((k) => activePanels[k]);
    if (targetVisibleIndex < 0 || targetVisibleIndex >= visiblePanelKeys.length) return;

    const sourceKey = visiblePanelKeys[visibleIndex];
    const targetKey = visiblePanelKeys[targetVisibleIndex];

    const sourceOrderIdx = panelOrder.indexOf(sourceKey);
    const targetOrderIdx = panelOrder.indexOf(targetKey);

    if (sourceOrderIdx !== -1 && targetOrderIdx !== -1) {
      const newOrder = [...panelOrder];
      const temp = newOrder[sourceOrderIdx];
      newOrder[sourceOrderIdx] = newOrder[targetOrderIdx];
      newOrder[targetOrderIdx] = temp;
      setPanelOrder(newOrder);
      localStorage.setItem('mikrotik_panel_order', JSON.stringify(newOrder));
    }
  };

  const movePanelInGlobalOrder = (globalIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? globalIndex - 1 : globalIndex + 1;
    if (targetIndex < 0 || targetIndex >= panelOrder.length) return;

    const newOrder = [...panelOrder];
    const temp = newOrder[globalIndex];
    newOrder[globalIndex] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setPanelOrder(newOrder);
    localStorage.setItem('mikrotik_panel_order', JSON.stringify(newOrder));
  };

  const resetPanelOrder = () => {
    setPanelOrder(defaultPanelOrder);
    localStorage.removeItem('mikrotik_panel_order');
  };

  // Panel Metadata Mapping
  const panelMetaMap: {
    [key: string]: {
      title: string;
      subtitle: string;
      icon: any;
      fullWidth?: boolean;
    };
  } = {
    overviewStats: {
      title: 'Ringkasan Resource & Uptime RouterOS',
      subtitle: 'CPU, RAM, Suhu Hardware, Total Port Interface, & Active Leases',
      icon: Cpu,
      fullWidth: true,
    },
    interfacesTable: {
      title: 'Interface Link Status & Throughput Traffic',
      subtitle: 'Lengkap dengan port Ether1-16, SFP+, VLAN, Bridge, WireGuard, PPPoE',
      icon: Layers,
      fullWidth: true,
    },
    dhcpLeasesTable: {
      title: 'Active DHCP Leases Table',
      subtitle: 'Daftar IP address, MAC Address, Hostname, & Masa Berlaku Lease Client',
      icon: Wifi,
      fullWidth: false,
    },
    ipAddresses: {
      title: 'IP Address List & Subnet Routes',
      subtitle: 'Daftar IP Address Terpasang di Interface & Status Dynamic/Static',
      icon: Globe,
      fullWidth: false,
    },
    firewallRules: {
      title: 'IP Firewall Filter & NAT Rules',
      subtitle: 'Aturan Input, Forward, FastTrack, Masquerade NAT & Dst-NAT Port Forward',
      icon: Shield,
      fullWidth: false,
    },
    simpleQueues: {
      title: 'Simple Queues Bandwidth Limiter',
      subtitle: 'Manajemen Bandwidth Target IP, VLAN, Rate Limit Upload/Download',
      icon: Zap,
      fullWidth: false,
    },
    arpNeighbors: {
      title: 'ARP Table & MNDP/LLDP Neighbors',
      subtitle: 'Daftar Perangkat Terdeteksi via Protocol ARP, MNDP, CDP & LLDP',
      icon: Network,
      fullWidth: false,
    },
    hotspotSessions: {
      title: 'Active PPPoE & Hotspot User Sessions',
      subtitle: 'Sesi Pengguna Berjalan, IP Address, Uptime & Penggunaan Data',
      icon: Users,
      fullWidth: false,
    },
    systemLogs: {
      title: 'RouterOS System Logs Stream',
      subtitle: 'Log Event Real-Time System, DHCP Assigned, Firewall Drops, & Login',
      icon: FileText,
      fullWidth: false,
    },
    terminalConsole: {
      title: 'RouterOS Terminal API Console',
      subtitle: 'Eksekusi Perintah Command Line (CLI) & Script RouterOS',
      icon: Terminal,
      fullWidth: false,
    },
  };

  const visiblePanelKeys = panelOrder.filter((k) => activePanels[k]);

  return (
    <div className="space-y-6">
      {/* Header & Router Selection Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Router className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-100">MikroTik RouterOS Monitoring</h2>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-mono">SNMP & REST API</span>
            </div>
            <p className="text-xs text-slate-400">Real-time bandwidth, full interface metrics, DHCP, IP, Firewall & Queues</p>
          </div>
        </div>

        {/* Action Controls: Router Picker, Panel Customizer, API Test Button */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedRouterId}
            onChange={(e) => setSelectedRouterId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono flex-1 md:flex-initial"
          >
            {mikrotikNodes.map((router) => (
              <option key={router.id} value={router.id}>
                {router.name} ({router.ip})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition border border-slate-700"
            title="Tambah atau pilih & atur urutan panel widget"
          >
            <Settings2 className="w-4 h-4 text-cyan-400" />
            <span>Atur & Geser Widget</span>
          </button>

          <button
            type="button"
            onClick={handleTestRealApi}
            disabled={isTestingApi}
            className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center space-x-1.5 transition disabled:opacity-50"
            title="Uji Koneksi REST API Router"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingApi ? 'animate-spin' : ''}`} />
            <span>{isTestingApi ? 'Mengecek...' : 'Cek API Router'}</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
            title="Poll SNMP Now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drag & Drop Instruction Hint Banner */}
      <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-cyan-300 font-mono">
        <div className="flex items-center space-x-2">
          <GripVertical className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>
            <strong className="text-cyan-200 font-sans">Panel Bisa Digeser (Drag & Drop):</strong> Pegang handle{' '}
            <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 border border-slate-700">⠿</code> atau klik panah{' '}
            <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 border border-slate-700">▲ ▼</code> di setiap header panel untuk mengubah tata letak.
          </span>
        </div>
        <button
          type="button"
          onClick={resetPanelOrder}
          className="text-[11px] text-cyan-400 hover:text-cyan-200 underline font-sans flex items-center space-x-1 flex-shrink-0 ml-2"
          title="Reset urutan posisi panel ke default"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Urutan</span>
        </button>
      </div>

      {/* API Test Status Result Alert */}
      {apiTestResult.status !== 'idle' && (
        <div
          className={`p-4 rounded-2xl border text-xs font-mono space-y-2 ${
            apiTestResult.status === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center justify-between font-bold text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Status Koneksi API NetWatch Server &rarr; {apiTestResult.targetHost}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-300">
              Mode: {apiTestResult.mode}
            </span>
          </div>
          <p>{apiTestResult.details}</p>
          {apiTestResult.rawJson && (
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-32">
              <pre>{JSON.stringify(apiTestResult.rawJson, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* REORDERABLE PANELS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visiblePanelKeys.map((key, visibleIdx) => {
          const meta = panelMetaMap[key];
          if (!meta) return null;
          const IconComponent = meta.icon;

          const isDragging = draggedIndex === visibleIdx;
          const isDragOver = dragOverIndex === visibleIdx;

          // Render Header Actions & Body Content based on key
          let headerActions: React.ReactNode = null;
          let panelBody: React.ReactNode = null;

          if (key === 'overviewStats') {
            panelBody = currentRouter ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>CPU Core Load</span>
                    <Cpu className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-100">{currentRouter.cpuUsage}%</div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${currentRouter.cpuUsage > 80 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                      style={{ width: `${currentRouter.cpuUsage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>RAM Allocation</span>
                    <HardDrive className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-100">{currentRouter.ramUsage}%</div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${currentRouter.ramUsage}%` }}></div>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>CPU Temp / Uptime</span>
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-100">{currentRouter.temperature || 41}°C</div>
                  <div className="text-xs text-slate-400 font-mono truncate">Uptime: {currentRouter.uptime}</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Total Interfaces / Leases</span>
                    <Wifi className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-100">{allInterfaces.length} Port / {allDhcpLeases.length} Lease</div>
                  <div className="text-xs text-emerald-400 font-mono">RouterOS {currentRouter.routerOSVersion}</div>
                </div>
              </div>
            ) : null;
          } else if (key === 'interfacesTable') {
            headerActions = (
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari port/vlan..."
                    value={ifaceSearch}
                    onChange={(e) => {
                      setIfaceSearch(e.target.value);
                      setIfacePage(1);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <select
                  value={ifaceTypeFilter}
                  onChange={(e) => {
                    setIfaceTypeFilter(e.target.value);
                    setIfacePage(1);
                  }}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="all">Semua Tipe ({allInterfaces.length})</option>
                  <option value="ether">Ethernet Port</option>
                  <option value="sfp">SFP / SFP+</option>
                  <option value="vlan">VLAN Subnet</option>
                  <option value="bridge">Bridge</option>
                  <option value="tunnel">WireGuard / Tunnel</option>
                  <option value="pppoe">PPPoE WAN</option>
                </select>
              </div>
            );

            panelBody = (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/60">
                        <th className="p-3">Interface Name</th>
                        <th className="p-3">Tipe</th>
                        <th className="p-3">Link Status</th>
                        <th className="p-3">Speed Rate</th>
                        <th className="p-3">Rx Traffic (In)</th>
                        <th className="p-3">Tx Traffic (Out)</th>
                        <th className="p-3">Packets Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {pagIface.paginated.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-500">
                            Tidak ada interface yang cocok dengan pencarian "{ifaceSearch}"
                          </td>
                        </tr>
                      ) : (
                        pagIface.paginated.map((iface, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition">
                            <td className="p-3 font-semibold text-slate-200">{iface.name}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase text-[10px]">
                                {iface.type}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] border ${
                                  iface.status === 'Up'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}
                              >
                                {iface.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300">{iface.speed}</td>
                            <td className="p-3 text-cyan-400 font-bold">{iface.rx}</td>
                            <td className="p-3 text-blue-400 font-bold">{iface.tx}</td>
                            <td className="p-3 text-slate-400">{iface.rxPackets}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <PaginationControls
                  currentPage={pagIface.validPage}
                  totalPages={pagIface.totalPages}
                  totalItems={pagIface.totalItems}
                  startIndex={pagIface.startIndex}
                  endIndex={pagIface.endIndex}
                  rowsPerPage={ifaceRows}
                  onPageChange={setIfacePage}
                  onRowsPerPageChange={setIfaceRows}
                />
              </>
            );
          } else if (key === 'dhcpLeasesTable') {
            headerActions = (
              <div className="relative w-full sm:w-44">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari IP / Host..."
                  value={dhcpSearch}
                  onChange={(e) => {
                    setDhcpSearch(e.target.value);
                    setDhcpPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            );

            panelBody = (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="pb-2">IP Address</th>
                        <th className="pb-2">MAC Address</th>
                        <th className="pb-2">Hostname</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {pagDhcp.paginated.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-500">
                            Tidak ada lease ditemukan
                          </td>
                        </tr>
                      ) : (
                        pagDhcp.paginated.map((l, i) => (
                          <tr key={i} className="hover:bg-slate-800/30">
                            <td className="py-2.5 text-cyan-300 font-bold">{l.ip}</td>
                            <td className="py-2.5 text-slate-400 text-[11px]">{l.mac}</td>
                            <td className="py-2.5 text-slate-200">{l.hostname}</td>
                            <td className="py-2.5 text-emerald-400">{l.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <PaginationControls
                  currentPage={pagDhcp.validPage}
                  totalPages={pagDhcp.totalPages}
                  totalItems={pagDhcp.totalItems}
                  startIndex={pagDhcp.startIndex}
                  endIndex={pagDhcp.endIndex}
                  rowsPerPage={dhcpRows}
                  onPageChange={setDhcpPage}
                  onRowsPerPageChange={setDhcpRows}
                />
              </>
            );
          } else if (key === 'ipAddresses') {
            headerActions = (
              <div className="relative w-full sm:w-44">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter IP / interface..."
                  value={ipSearch}
                  onChange={(e) => {
                    setIpSearch(e.target.value);
                    setIpPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            );

            panelBody = (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="pb-2">Address / Subnet</th>
                        <th className="pb-2">Interface</th>
                        <th className="pb-2">Flags</th>
                        <th className="pb-2">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {pagIp.paginated.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-500">
                            Tidak ada IP yang cocok
                          </td>
                        </tr>
                      ) : (
                        pagIp.paginated.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-2.5 text-emerald-300 font-bold">{item.address}</td>
                            <td className="py-2.5 text-cyan-400">{item.interfaceName}</td>
                            <td className="py-2.5 text-slate-400 text-[10px]">{item.flags}</td>
                            <td className="py-2.5 text-slate-300">{item.comment}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <PaginationControls
                  currentPage={pagIp.validPage}
                  totalPages={pagIp.totalPages}
                  totalItems={pagIp.totalItems}
                  startIndex={pagIp.startIndex}
                  endIndex={pagIp.endIndex}
                  rowsPerPage={ipRows}
                  onPageChange={setIpPage}
                  onRowsPerPageChange={setIpRows}
                />
              </>
            );
          } else if (key === 'firewallRules') {
            headerActions = (
              <div className="relative w-full sm:w-44">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari rule firewall..."
                  value={fwSearch}
                  onChange={(e) => {
                    setFwSearch(e.target.value);
                    setFwPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            );

            panelBody = (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="pb-2">Chain</th>
                        <th className="pb-2">Action</th>
                        <th className="pb-2">Proto/Port</th>
                        <th className="pb-2">Description / Comment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {pagFw.paginated.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-500">
                            Tidak ada firewall rule ditemukan
                          </td>
                        </tr>
                      ) : (
                        pagFw.paginated.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-2.5 text-slate-300">{item.chain}</td>
                            <td className="py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                                  item.action.includes('drop')
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : item.action.includes('accept')
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-blue-500/20 text-blue-300'
                                }`}
                              >
                                {item.action}
                              </span>
                            </td>
                            <td className="py-2.5 text-cyan-400">{item.protocol}:{item.port}</td>
                            <td className="py-2.5 text-slate-200">{item.comment}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <PaginationControls
                  currentPage={pagFw.validPage}
                  totalPages={pagFw.totalPages}
                  totalItems={pagFw.totalItems}
                  startIndex={pagFw.startIndex}
                  endIndex={pagFw.endIndex}
                  rowsPerPage={fwRows}
                  onPageChange={setFwPage}
                  onRowsPerPageChange={setFwRows}
                />
              </>
            );
          } else if (key === 'simpleQueues') {
            headerActions = (
              <div className="relative w-full sm:w-44">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari queue..."
                  value={queueSearch}
                  onChange={(e) => {
                    setQueueSearch(e.target.value);
                    setQueuePage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            );

            panelBody = (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="pb-2">Queue Name</th>
                        <th className="pb-2">Target</th>
                        <th className="pb-2">Max Limit (Up/Down)</th>
                        <th className="pb-2">Burst</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {pagQueue.paginated.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-500">
                            Tidak ada queue ditemukan
                          </td>
                        </tr>
                      ) : (
                        pagQueue.paginated.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-2.5 text-slate-200 font-bold">{item.name}</td>
                            <td className="py-2.5 text-cyan-400">{item.target}</td>
                            <td className="py-2.5 text-yellow-300">{item.maxLimit}</td>
                            <td className="py-2.5 text-slate-400 text-[11px]">{item.burst}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <PaginationControls
                  currentPage={pagQueue.validPage}
                  totalPages={pagQueue.totalPages}
                  totalItems={pagQueue.totalItems}
                  startIndex={pagQueue.startIndex}
                  endIndex={pagQueue.endIndex}
                  rowsPerPage={queueRows}
                  onPageChange={setQueuePage}
                  onRowsPerPageChange={setQueueRows}
                />
              </>
            );
          } else if (key === 'arpNeighbors') {
            headerActions = (
              <div className="relative w-full sm:w-44">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari ARP / tetangga..."
                  value={arpSearch}
                  onChange={(e) => {
                    setArpSearch(e.target.value);
                    setArpPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            );

            panelBody = (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="pb-2">IP Address</th>
                        <th className="pb-2">MAC Address</th>
                        <th className="pb-2">Interface</th>
                        <th className="pb-2">Device / Identity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {pagArp.paginated.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-500">
                            Tidak ada entri ARP ditemukan
                          </td>
                        </tr>
                      ) : (
                        pagArp.paginated.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-2.5 text-cyan-300 font-bold">{item.ip}</td>
                            <td className="py-2.5 text-slate-400 text-[11px]">{item.mac}</td>
                            <td className="py-2.5 text-slate-300">{item.interfaceName}</td>
                            <td className="py-2.5 text-purple-300 font-semibold">{item.identity}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <PaginationControls
                  currentPage={pagArp.validPage}
                  totalPages={pagArp.totalPages}
                  totalItems={pagArp.totalItems}
                  startIndex={pagArp.startIndex}
                  endIndex={pagArp.endIndex}
                  rowsPerPage={arpRows}
                  onPageChange={setArpPage}
                  onRowsPerPageChange={setArpRows}
                />
              </>
            );
          } else if (key === 'hotspotSessions') {
            headerActions = (
              <div className="relative w-full sm:w-44">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari user / IP..."
                  value={userSessionSearch}
                  onChange={(e) => {
                    setUserSessionSearch(e.target.value);
                    setUserSessionPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            );

            panelBody = (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="pb-2">Username</th>
                        <th className="pb-2">Assigned IP</th>
                        <th className="pb-2">Uptime</th>
                        <th className="pb-2">Traffic In/Out</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {pagSession.paginated.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-500">
                            Tidak ada user aktif
                          </td>
                        </tr>
                      ) : (
                        pagSession.paginated.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-2.5 text-slate-200 font-bold">{item.user}</td>
                            <td className="py-2.5 text-cyan-300">{item.ip}</td>
                            <td className="py-2.5 text-emerald-400">{item.uptime}</td>
                            <td className="py-2.5 text-slate-400">{item.bytes}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <PaginationControls
                  currentPage={pagSession.validPage}
                  totalPages={pagSession.totalPages}
                  totalItems={pagSession.totalItems}
                  startIndex={pagSession.startIndex}
                  endIndex={pagSession.endIndex}
                  rowsPerPage={userSessionRows}
                  onPageChange={setUserSessionPage}
                  onRowsPerPageChange={setUserSessionRows}
                />
              </>
            );
          } else if (key === 'systemLogs') {
            headerActions = (
              <div className="relative w-full sm:w-44">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari log event..."
                  value={logSearch}
                  onChange={(e) => {
                    setLogSearch(e.target.value);
                    setLogPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            );

            panelBody = (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="pb-2">Waktu</th>
                        <th className="pb-2">Topics</th>
                        <th className="pb-2">Pesan Event Log</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {pagLog.paginated.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-slate-500">
                            Tidak ada log ditemukan
                          </td>
                        </tr>
                      ) : (
                        pagLog.paginated.map((l, i) => (
                          <tr key={i} className="hover:bg-slate-800/30">
                            <td className="py-2 text-slate-400">{l.time}</td>
                            <td className="py-2 text-cyan-400">{l.topics}</td>
                            <td
                              className={`py-2 ${
                                l.severity === 'warning' ? 'text-amber-300 font-semibold' : 'text-slate-200'
                              }`}
                            >
                              {l.message}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <PaginationControls
                  currentPage={pagLog.validPage}
                  totalPages={pagLog.totalPages}
                  totalItems={pagLog.totalItems}
                  startIndex={pagLog.startIndex}
                  endIndex={pagLog.endIndex}
                  rowsPerPage={logRows}
                  onPageChange={setLogPage}
                  onRowsPerPageChange={setLogRows}
                />
              </>
            );
          } else if (key === 'terminalConsole') {
            headerActions = (
              <span className="text-xs text-slate-400 font-mono px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg">
                {currentRouter?.ip}
              </span>
            );

            panelBody = (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={terminalCommand}
                    onChange={(e) => setTerminalCommand(e.target.value)}
                    placeholder="/interface print ATAU /system resource print"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleRunScript}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-xs text-emerald-400 h-48 overflow-y-auto whitespace-pre">
                  {terminalOutput}
                </div>
              </div>
            );
          }

          return (
            <DraggablePanelWrapper
              key={key}
              panelKey={key}
              index={visibleIdx}
              totalPanels={visiblePanelKeys.length}
              title={meta.title}
              subtitle={meta.subtitle}
              icon={<IconComponent className="w-5 h-5 text-cyan-400" />}
              isDragging={isDragging}
              isDragOver={isDragOver}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onMoveUp={() => movePanelInVisibleList(visibleIdx, 'up')}
              onMoveDown={() => movePanelInVisibleList(visibleIdx, 'down')}
              headerActions={headerActions}
              fullWidth={meta.fullWidth}
            >
              {panelBody}
            </DraggablePanelWrapper>
          );
        })}
      </div>

      {/* MODAL: CUSTOMIZER & REORDER PANEL WIDGET */}
      {isCustomizerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <LayoutGrid className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">Atur & Geser Posisi Widget Dashboard</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Gunakan ikon pegangan <code className="text-cyan-300">⠿</code> atau tombol <code className="text-cyan-300">▲ ▼</code> untuk memindahkan urutan panel, serta centang panel yang ingin Anda aktifkan:
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {panelOrder.map((key, orderIdx) => {
                const meta = panelMetaMap[key];
                if (!meta) return null;
                const IconComponent = meta.icon;

                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      activePanels[key]
                        ? 'bg-slate-800/80 border-cyan-500/40 text-slate-100'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div className="p-1 text-slate-500 hover:text-cyan-400 flex-shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <IconComponent className={`w-4 h-4 ${activePanels[key] ? 'text-cyan-400' : 'text-slate-500'} flex-shrink-0`} />
                      <span className="text-xs font-medium truncate">{meta.title}</span>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="flex items-center space-x-1 border-r border-slate-700/60 pr-2">
                        <button
                          type="button"
                          onClick={() => movePanelInGlobalOrder(orderIdx, 'up')}
                          disabled={orderIdx === 0}
                          className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition"
                          title="Ke Atas"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePanelInGlobalOrder(orderIdx, 'down')}
                          disabled={orderIdx === panelOrder.length - 1}
                          className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition"
                          title="Ke Bawah"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="checkbox"
                        checked={!!activePanels[key]}
                        onChange={() => togglePanel(key)}
                        className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={resetPanelOrder}
                className="text-xs text-cyan-400 hover:underline font-mono flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Layout & Urutan</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCustomizerOpen(false)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition"
              >
                Selesai & Simpan Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
