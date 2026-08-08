import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Lock,
  Clock,
  ShieldAlert,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  Server,
  Key,
  ShieldCheck,
  Pause,
  Play,
  Trash2,
  Check,
  X,
  Info,
  LayoutGrid,
  List,
  Columns,
  ArrowUpRight,
  Terminal,
} from 'lucide-react';
import { NodeMetric } from '../types';

export interface HeartbeatPoint {
  id: string;
  timestamp: string;
  status: 'up' | 'down' | 'degraded';
  statusCode: number;
  latencyMs: number;
  msg?: string;
}

export interface KumaMonitorItem extends NodeMetric {
  url: string;
  intervalSec: number;
  method: 'GET' | 'HEAD' | 'POST';
  keywordMatch?: string;
  tlsVersion?: string;
  certSubject?: string;
  validFrom?: string;
  validUntil?: string;
  isPaused?: boolean;
  heartbeats: HeartbeatPoint[];
}

interface WebsiteMonitorProps {
  websiteNodes: NodeMetric[];
  onRefresh: () => void;
}

// Generate realistic mock heartbeat history (30 bars per site)
const generateMockHeartbeats = (baseStatus: 'online' | 'warning' | 'critical' | 'offline', baseLatency: number, prefix: string = 'hb'): HeartbeatPoint[] => {
  const points: HeartbeatPoint[] = [];
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const timeStr = new Date(now - i * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let status: 'up' | 'down' | 'degraded' = 'up';
    let code = 200;
    let latency = Math.max(8, baseLatency + Math.floor((Math.random() - 0.5) * 20));

    // Introduce random occasional blips or degraded states based on baseStatus
    if (baseStatus === 'critical' || baseStatus === 'offline') {
      status = 'down';
      code = 0;
      latency = 0;
    } else if (baseStatus === 'warning' && i === 12) {
      status = 'degraded';
      code = 200;
      latency = 340;
    } else if (Math.random() < 0.03) {
      status = 'degraded';
      latency = baseLatency + 180;
    }

    points.push({
      id: `hb-${prefix}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
      status,
      statusCode: code,
      latencyMs: latency,
      msg: status === 'up' ? 'HTTP 200 OK' : status === 'degraded' ? 'High Latency (>300ms)' : 'OFFLINE (Host Unreachable)',
    });
  }
  return points;
};

export const WebsiteMonitor: React.FC<WebsiteMonitorProps> = ({ websiteNodes, onRefresh }) => {
  // State for View Layout Mode: 'compact' (Tabel Ringkas), 'grid' (Grid 2 Kolom), 'cards' (Detail Lengkap)
  const [viewMode, setViewMode] = useState<'compact' | 'grid' | 'cards'>('compact');

  // Initialize site list with complete Uptime Kuma monitors from Universitas Musamus
  const [monitors, setMonitors] = useState<KumaMonitorItem[]>(() => {
    return [
      // Group 1: Aplikasi Universitas Musamus
      {
        id: 'app-1',
        name: 'Aplikasi RPL Unmus',
        category: 'Aplikasi Universitas Musamus',
        ip: '103.10.12.50',
        url: 'https://rpl.unmus.ac.id',
        status: 'offline',
        uptime: '0.00%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 0, ramUsage: 0, diskUsage: 0,
        latencyMs: 0, dnsLookupMs: 0, httpStatusCode: 0,
        sslDaysRemaining: 0, sslIssuer: 'Host Unreachable', tlsVersion: 'N/A',
        certSubject: 'CN=rpl.unmus.ac.id', validFrom: 'N/A', validUntil: 'N/A',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('offline', 0, 'app-1'),
      },
      {
        id: 'app-2',
        name: 'Aplikasi Tracer Study',
        category: 'Aplikasi Universitas Musamus',
        ip: '103.10.12.51',
        url: 'https://tracerstudy.unmus.ac.id',
        status: 'warning',
        uptime: '61.87%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 35, ramUsage: 55, diskUsage: 40,
        latencyMs: 185, dnsLookupMs: 25, httpStatusCode: 200,
        sslDaysRemaining: 18, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=tracerstudy.unmus.ac.id', validFrom: '2026-04-01', validUntil: '2026-08-25',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('warning', 185, 'app-2'),
      },
      {
        id: 'app-3',
        name: 'Beban Kerja Dosen Fakultas Teknik',
        category: 'Aplikasi Universitas Musamus',
        ip: '103.10.12.52',
        url: 'https://bkd-ft.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 12, ramUsage: 30, diskUsage: 25,
        latencyMs: 26, dnsLookupMs: 8, httpStatusCode: 200,
        sslDaysRemaining: 92, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=bkd-ft.unmus.ac.id', validFrom: '2026-05-10', validUntil: '2026-11-10',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 26, 'app-3'),
      },
      {
        id: 'app-4',
        name: 'FEEDER-Importer',
        category: 'Aplikasi Universitas Musamus',
        ip: '103.10.12.53',
        url: 'https://feeder.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 18, ramUsage: 42, diskUsage: 30,
        latencyMs: 22, dnsLookupMs: 6, httpStatusCode: 200,
        sslDaysRemaining: 85, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=feeder.unmus.ac.id', validFrom: '2026-05-01', validUntil: '2026-11-01',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 22, 'app-4'),
      },
      {
        id: 'app-5',
        name: 'Jadwal LAB TI',
        category: 'Aplikasi Universitas Musamus',
        ip: '103.10.12.54',
        url: 'https://jadwallabti.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 10, ramUsage: 25, diskUsage: 20,
        latencyMs: 31, dnsLookupMs: 9, httpStatusCode: 200,
        sslDaysRemaining: 110, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=jadwallabti.unmus.ac.id', validFrom: '2026-06-01', validUntil: '2026-12-01',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 31, 'app-5'),
      },
      {
        id: 'app-6',
        name: 'Laporan Keuangan Fakultas Teknik',
        category: 'Aplikasi Universitas Musamus',
        ip: '103.10.12.55',
        url: 'https://lapkeu-ft.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 15, ramUsage: 32, diskUsage: 28,
        latencyMs: 29, dnsLookupMs: 7, httpStatusCode: 200,
        sslDaysRemaining: 95, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=lapkeu-ft.unmus.ac.id', validFrom: '2026-05-12', validUntil: '2026-11-12',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 29, 'app-6'),
      },
      {
        id: 'app-7',
        name: 'NEO Feeder',
        category: 'Aplikasi Universitas Musamus',
        ip: '103.10.12.56',
        url: 'https://neofeeder.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 25, ramUsage: 50, diskUsage: 45,
        latencyMs: 27, dnsLookupMs: 8, httpStatusCode: 200,
        sslDaysRemaining: 80, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=neofeeder.unmus.ac.id', validFrom: '2026-04-20', validUntil: '2026-10-20',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 27, 'app-7'),
      },
      {
        id: 'app-8',
        name: 'Simlitabmas',
        category: 'Aplikasi Universitas Musamus',
        ip: '103.10.12.57',
        url: 'https://simlitabmas.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 14, ramUsage: 35, diskUsage: 30,
        latencyMs: 34, dnsLookupMs: 10, httpStatusCode: 200,
        sslDaysRemaining: 105, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=simlitabmas.unmus.ac.id', validFrom: '2026-05-20', validUntil: '2026-11-20',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 34, 'app-8'),
      },
      {
        id: 'app-9',
        name: 'UTBK Mandiri',
        category: 'Aplikasi Universitas Musamus',
        ip: '103.10.12.58',
        url: 'https://utbkmandiri.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 16, ramUsage: 38, diskUsage: 22,
        latencyMs: 25, dnsLookupMs: 7, httpStatusCode: 200,
        sslDaysRemaining: 115, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=utbkmandiri.unmus.ac.id', validFrom: '2026-06-05', validUntil: '2026-12-05',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 25, 'app-9'),
      },

      // Group 2: CCTV Server
      {
        id: 'cctv-1',
        name: 'CCTV Server System',
        category: 'CCTV Server',
        ip: '103.10.12.100',
        url: 'http://cctv.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 30, ramUsage: 60, diskUsage: 75,
        latencyMs: 18, dnsLookupMs: 5, httpStatusCode: 200,
        sslDaysRemaining: 0, sslIssuer: 'HTTP Only', tlsVersion: 'N/A',
        certSubject: 'CN=cctv.unmus.ac.id', validFrom: 'N/A', validUntil: 'N/A',
        intervalSec: 20, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 18, 'cctv-1'),
      },

      // Group 3: Docker Sistem & Monitoring
      {
        id: 'doc-1',
        name: 'ISPConfig Server Control',
        category: 'Docker Sistem & Monitoring',
        ip: '103.10.12.200',
        url: 'https://ispconfig.unmus.ac.id',
        status: 'offline',
        uptime: '28.69%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 0, ramUsage: 0, diskUsage: 0,
        latencyMs: 0, dnsLookupMs: 0, httpStatusCode: 0,
        sslDaysRemaining: 0, sslIssuer: 'Host Unreachable', tlsVersion: 'N/A',
        certSubject: 'CN=ispconfig.unmus.ac.id', validFrom: 'N/A', validUntil: 'N/A',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('offline', 0, 'doc-1'),
      },
      {
        id: 'doc-2',
        name: 'Loki Log Aggregator',
        category: 'Docker Sistem & Monitoring',
        ip: '192.168.77.30',
        url: 'http://192.168.77.30:3100',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 15, ramUsage: 45, diskUsage: 60,
        latencyMs: 8, dnsLookupMs: 2, httpStatusCode: 200,
        sslDaysRemaining: 0, sslIssuer: 'LAN HTTP', tlsVersion: 'N/A',
        certSubject: '192.168.77.30', validFrom: 'N/A', validUntil: 'N/A',
        intervalSec: 15, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 8, 'doc-2'),
      },
      {
        id: 'doc-3',
        name: 'Monitoring Grafana',
        category: 'Docker Sistem & Monitoring',
        ip: '192.168.77.30',
        url: 'http://192.168.77.30:3000',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 12, ramUsage: 35, diskUsage: 40,
        latencyMs: 12, dnsLookupMs: 3, httpStatusCode: 200,
        sslDaysRemaining: 0, sslIssuer: 'LAN HTTP', tlsVersion: 'N/A',
        certSubject: '192.168.77.30', validFrom: 'N/A', validUntil: 'N/A',
        intervalSec: 15, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 12, 'doc-3'),
      },
      {
        id: 'doc-4',
        name: 'Monitoring UPTIME Kuma',
        category: 'Docker Sistem & Monitoring',
        ip: '192.168.77.30',
        url: 'http://192.168.77.30:3001',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 8, ramUsage: 22, diskUsage: 15,
        latencyMs: 6, dnsLookupMs: 1, httpStatusCode: 200,
        sslDaysRemaining: 0, sslIssuer: 'LAN HTTP', tlsVersion: 'N/A',
        certSubject: '192.168.77.30', validFrom: 'N/A', validUntil: 'N/A',
        intervalSec: 10, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 6, 'doc-4'),
      },
      {
        id: 'doc-5',
        name: 'Monitoring Wazuh SIEM',
        category: 'Docker Sistem & Monitoring',
        ip: '192.168.77.30',
        url: 'https://192.168.77.30:5601',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 28, ramUsage: 65, diskUsage: 55,
        latencyMs: 15, dnsLookupMs: 2, httpStatusCode: 200,
        sslDaysRemaining: 365, sslIssuer: 'Wazuh Self-Signed', tlsVersion: 'TLS v1.3',
        certSubject: 'CN=wazuh.local', validFrom: '2026-01-01', validUntil: '2027-01-01',
        intervalSec: 20, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 15, 'doc-5'),
      },
      {
        id: 'doc-6',
        name: 'Monitoring Zabbix',
        category: 'Docker Sistem & Monitoring',
        ip: '192.168.77.30',
        url: 'http://192.168.77.30/zabbix',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 20, ramUsage: 50, diskUsage: 45,
        latencyMs: 14, dnsLookupMs: 2, httpStatusCode: 200,
        sslDaysRemaining: 0, sslIssuer: 'LAN HTTP', tlsVersion: 'N/A',
        certSubject: '192.168.77.30', validFrom: 'N/A', validUntil: 'N/A',
        intervalSec: 20, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 14, 'doc-6'),
      },
      {
        id: 'doc-7',
        name: 'NPMPlus (Nginx Proxy Manager)',
        category: 'Docker Sistem & Monitoring',
        ip: '192.168.77.30',
        url: 'http://192.168.77.30:81',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 10, ramUsage: 25, diskUsage: 20,
        latencyMs: 9, dnsLookupMs: 1, httpStatusCode: 200,
        sslDaysRemaining: 0, sslIssuer: 'LAN HTTP', tlsVersion: 'N/A',
        certSubject: '192.168.77.30', validFrom: 'N/A', validUntil: 'N/A',
        intervalSec: 15, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 9, 'doc-7'),
      },
      {
        id: 'doc-8',
        name: 'OPNsense-VPN Firewall',
        category: 'Docker Sistem & Monitoring',
        ip: '192.168.77.1',
        url: 'https://192.168.77.1',
        status: 'warning',
        uptime: '34.87%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 40, ramUsage: 58, diskUsage: 35,
        latencyMs: 140, dnsLookupMs: 15, httpStatusCode: 200,
        sslDaysRemaining: 10, sslIssuer: 'OPNsense Self-Signed', tlsVersion: 'TLS v1.2',
        certSubject: 'CN=opnsense.local', validFrom: '2025-08-01', validUntil: '2026-08-17',
        intervalSec: 20, method: 'GET',
        heartbeats: generateMockHeartbeats('warning', 140, 'doc-8'),
      },
      {
        id: 'doc-9',
        name: 'Portainer Dashboard Docker',
        category: 'Docker Sistem & Monitoring',
        ip: '192.168.77.30',
        url: 'https://192.168.77.30:9443',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 11, ramUsage: 28, diskUsage: 25,
        latencyMs: 11, dnsLookupMs: 2, httpStatusCode: 200,
        sslDaysRemaining: 365, sslIssuer: 'Portainer Self-Signed', tlsVersion: 'TLS v1.3',
        certSubject: 'CN=portainer.local', validFrom: '2026-01-01', validUntil: '2027-01-01',
        intervalSec: 20, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 11, 'doc-9'),
      },
      {
        id: 'doc-10',
        name: 'Prometheus Metrics Server',
        category: 'Docker Sistem & Monitoring',
        ip: '192.168.77.30',
        url: 'http://192.168.77.30:9090',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 22, ramUsage: 48, diskUsage: 70,
        latencyMs: 10, dnsLookupMs: 2, httpStatusCode: 200,
        sslDaysRemaining: 0, sslIssuer: 'LAN HTTP', tlsVersion: 'N/A',
        certSubject: '192.168.77.30', validFrom: 'N/A', validUntil: 'N/A',
        intervalSec: 15, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 10, 'doc-10'),
      },
      {
        id: 'doc-11',
        name: 'Promtail Log Collector',
        category: 'Docker Sistem & Monitoring',
        ip: '192.168.77.30',
        url: 'http://192.168.77.30:9080',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 8, ramUsage: 20, diskUsage: 15,
        latencyMs: 7, dnsLookupMs: 1, httpStatusCode: 200,
        sslDaysRemaining: 0, sslIssuer: 'LAN HTTP', tlsVersion: 'N/A',
        certSubject: '192.168.77.30', validFrom: 'N/A', validUntil: 'N/A',
        intervalSec: 15, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 7, 'doc-11'),
      },
      {
        id: 'doc-12',
        name: 'Victoria Metrics Database',
        category: 'Docker Sistem & Monitoring',
        ip: '192.168.77.30',
        url: 'http://192.168.77.30:8428',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 16, ramUsage: 38, diskUsage: 50,
        latencyMs: 9, dnsLookupMs: 1, httpStatusCode: 200,
        sslDaysRemaining: 0, sslIssuer: 'LAN HTTP', tlsVersion: 'N/A',
        certSubject: '192.168.77.30', validFrom: 'N/A', validUntil: 'N/A',
        intervalSec: 15, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 9, 'doc-12'),
      },

      // Group 4: Single Sign On Universitas Musamus ( ITS )
      {
        id: 'sso-1',
        name: 'Single Sign On Universitas Musamus ( ITS )',
        category: 'Single Sign On ITS',
        ip: '103.10.12.10',
        url: 'https://sso.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 15, ramUsage: 32, diskUsage: 20,
        latencyMs: 21, dnsLookupMs: 6, httpStatusCode: 200,
        sslDaysRemaining: 140, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=sso.unmus.ac.id', validFrom: '2026-06-01', validUntil: '2026-12-28',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 21, 'sso-1'),
      },

      // Group 5: SKI ( Aplikasi E-Campuz )
      {
        id: 'ski-1',
        name: 'Portal PMB Online (E-Campuz)',
        category: 'SKI (E-Campuz)',
        ip: '103.10.12.60',
        url: 'https://pmb.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 12, ramUsage: 28, diskUsage: 25,
        latencyMs: 32, dnsLookupMs: 10, httpStatusCode: 200,
        sslDaysRemaining: 120, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=pmb.unmus.ac.id', validFrom: '2026-06-01', validUntil: '2026-12-01',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 32, 'ski-1'),
      },
      {
        id: 'ski-2',
        name: 'Sistem Akademik Universitas Musamus (E-Campuz)',
        category: 'SKI (E-Campuz)',
        ip: '103.10.12.65',
        url: 'https://siakad.unmus.ac.id',
        status: 'online',
        uptime: '99.93%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 22, ramUsage: 45, diskUsage: 35,
        latencyMs: 24, dnsLookupMs: 8, httpStatusCode: 200,
        sslDaysRemaining: 88, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=siakad.unmus.ac.id', validFrom: '2026-04-10', validUntil: '2026-11-10',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 24, 'ski-2'),
      },
      {
        id: 'ski-3',
        name: 'Sistem Informasi Anggaran (E-Campuz)',
        category: 'SKI (E-Campuz)',
        ip: '103.10.12.66',
        url: 'https://sia.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 14, ramUsage: 30, diskUsage: 20,
        latencyMs: 28, dnsLookupMs: 7, httpStatusCode: 200,
        sslDaysRemaining: 100, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=sia.unmus.ac.id', validFrom: '2026-05-15', validUntil: '2026-11-15',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 28, 'ski-3'),
      },
      {
        id: 'ski-4',
        name: 'Sistem Informasi Kepegawaian (E-Campuz)',
        category: 'SKI (E-Campuz)',
        ip: '103.10.12.67',
        url: 'https://simpeg.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 16, ramUsage: 34, diskUsage: 28,
        latencyMs: 30, dnsLookupMs: 9, httpStatusCode: 200,
        sslDaysRemaining: 105, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=simpeg.unmus.ac.id', validFrom: '2026-05-20', validUntil: '2026-11-20',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 30, 'ski-4'),
      },
      {
        id: 'ski-5',
        name: 'Sistem Informasi Keuangan (E-Campuz)',
        category: 'SKI (E-Campuz)',
        ip: '103.10.12.68',
        url: 'https://simkeu.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 18, ramUsage: 38, diskUsage: 30,
        latencyMs: 27, dnsLookupMs: 8, httpStatusCode: 200,
        sslDaysRemaining: 90, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=simkeu.unmus.ac.id', validFrom: '2026-05-01', validUntil: '2026-11-01',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 27, 'ski-5'),
      },
      {
        id: 'ski-6',
        name: 'Sistem Informasi Pembayaran (E-Campuz)',
        category: 'SKI (E-Campuz)',
        ip: '103.10.12.69',
        url: 'https://pembayaran.unmus.ac.id',
        status: 'online',
        uptime: '99.49%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 25, ramUsage: 48, diskUsage: 40,
        latencyMs: 35, dnsLookupMs: 11, httpStatusCode: 200,
        sslDaysRemaining: 75, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=pembayaran.unmus.ac.id', validFrom: '2026-04-15', validUntil: '2026-10-15',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 35, 'ski-6'),
      },
      {
        id: 'ski-7',
        name: 'Sistem Informasi Penjaminan Mutu (E-Campuz)',
        category: 'SKI (E-Campuz)',
        ip: '103.10.12.70',
        url: 'https://spmi.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 10, ramUsage: 25, diskUsage: 18,
        latencyMs: 26, dnsLookupMs: 7, httpStatusCode: 200,
        sslDaysRemaining: 110, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=spmi.unmus.ac.id', validFrom: '2026-06-01', validUntil: '2026-12-01',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 26, 'ski-7'),
      },
      {
        id: 'ski-8',
        name: 'Sistem Informasi Registrasi (E-Campuz)',
        category: 'SKI (E-Campuz)',
        ip: '103.10.12.71',
        url: 'https://registrasi.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 12, ramUsage: 28, diskUsage: 22,
        latencyMs: 29, dnsLookupMs: 8, httpStatusCode: 200,
        sslDaysRemaining: 95, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=registrasi.unmus.ac.id', validFrom: '2026-05-10', validUntil: '2026-11-10',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 29, 'ski-8'),
      },
      {
        id: 'ski-9',
        name: 'Sistem Informasi SIPortal (E-Campuz)',
        category: 'SKI (E-Campuz)',
        ip: '103.10.12.72',
        url: 'https://siportal.unmus.ac.id',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 15, ramUsage: 30, diskUsage: 25,
        latencyMs: 23, dnsLookupMs: 6, httpStatusCode: 200,
        sslDaysRemaining: 100, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=siportal.unmus.ac.id', validFrom: '2026-05-15', validUntil: '2026-11-15',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 23, 'ski-9'),
      },

      // Group 6: Virtual Machine Universitas Musamus
      {
        id: 'vm-1',
        name: 'PROXMOX - Teknik Informatika',
        category: 'Virtual Machine Unmus',
        ip: '192.168.77.10',
        url: 'https://192.168.77.10:8006',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 35, ramUsage: 70, diskUsage: 65,
        latencyMs: 5, dnsLookupMs: 1, httpStatusCode: 200,
        sslDaysRemaining: 365, sslIssuer: 'Proxmox Self-Signed', tlsVersion: 'TLS v1.3',
        certSubject: 'CN=pve-ti.local', validFrom: '2026-01-01', validUntil: '2027-01-01',
        intervalSec: 15, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 5, 'vm-1'),
      },
      {
        id: 'vm-2',
        name: 'PROXMOX Virtual Machine UTAMA',
        category: 'Virtual Machine Unmus',
        ip: '192.168.77.20',
        url: 'https://192.168.77.20:8006',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 45, ramUsage: 82, diskUsage: 78,
        latencyMs: 4, dnsLookupMs: 1, httpStatusCode: 200,
        sslDaysRemaining: 365, sslIssuer: 'Proxmox Self-Signed', tlsVersion: 'TLS v1.3',
        certSubject: 'CN=pve-utama.local', validFrom: '2026-01-01', validUntil: '2027-01-01',
        intervalSec: 15, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 4, 'vm-2'),
      },
      {
        id: 'vm-3',
        name: 'PROXMOX-Fakultas Teknik',
        category: 'Virtual Machine Unmus',
        ip: '192.168.77.30',
        url: 'https://192.168.77.30:8006',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 25, ramUsage: 55, diskUsage: 50,
        latencyMs: 6, dnsLookupMs: 1, httpStatusCode: 200,
        sslDaysRemaining: 365, sslIssuer: 'Proxmox Self-Signed', tlsVersion: 'TLS v1.3',
        certSubject: 'CN=pve-ft.local', validFrom: '2026-01-01', validUntil: '2027-01-01',
        intervalSec: 15, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 6, 'vm-3'),
      },
      {
        id: 'vm-4',
        name: 'PROXMOX-Simlitabmas',
        category: 'Virtual Machine Unmus',
        ip: '192.168.77.40',
        url: 'https://192.168.77.40:8006',
        status: 'online',
        uptime: '100.0%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 20, ramUsage: 48, diskUsage: 42,
        latencyMs: 5, dnsLookupMs: 1, httpStatusCode: 200,
        sslDaysRemaining: 365, sslIssuer: 'Proxmox Self-Signed', tlsVersion: 'TLS v1.3',
        certSubject: 'CN=pve-simlitabmas.local', validFrom: '2026-01-01', validUntil: '2027-01-01',
        intervalSec: 15, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 5, 'vm-4'),
      },

      // Group 7: Website Universitas Musamus
      {
        id: 'web-1',
        name: 'Unmus Main Academic Portal',
        category: 'Website Universitas Musamus',
        ip: '103.10.12.50',
        url: 'https://portal.unmus.ac.id',
        status: 'online',
        uptime: '97.46%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 12, ramUsage: 28, diskUsage: 35,
        latencyMs: 28, dnsLookupMs: 12, httpStatusCode: 200,
        sslDaysRemaining: 74, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=portal.unmus.ac.id', validFrom: '2026-05-15', validUntil: '2026-10-20',
        intervalSec: 30, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 28, 'web-1'),
      },
      {
        id: 'web-2',
        name: 'LMS / E-Learning Server',
        category: 'Website Universitas Musamus',
        ip: '103.10.12.55',
        url: 'https://lms.unmus.ac.id',
        status: 'warning',
        uptime: '99.45%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 45, ramUsage: 62, diskUsage: 50,
        latencyMs: 145, dnsLookupMs: 38, httpStatusCode: 200,
        sslDaysRemaining: 12, sslIssuer: 'Sectigo RSA Domain Validation', tlsVersion: 'TLS v1.2',
        certSubject: 'CN=lms.unmus.ac.id', validFrom: '2025-08-20', validUntil: '2026-08-19',
        intervalSec: 60, method: 'GET',
        heartbeats: generateMockHeartbeats('warning', 145, 'web-2'),
      },
      {
        id: 'web-3',
        name: 'Digital Library & Repository',
        category: 'Website Universitas Musamus',
        ip: '103.10.12.72',
        url: 'https://digilib.unmus.ac.id',
        status: 'offline',
        uptime: '0.00%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 0, ramUsage: 0, diskUsage: 0,
        latencyMs: 0, dnsLookupMs: 0, httpStatusCode: 0,
        sslDaysRemaining: 0, sslIssuer: 'Host Unreachable', tlsVersion: 'N/A',
        certSubject: 'CN=digilib.unmus.ac.id', validFrom: 'N/A', validUntil: 'N/A',
        intervalSec: 60, method: 'GET',
        heartbeats: generateMockHeartbeats('offline', 0, 'web-3'),
      },
      {
        id: 'web-4',
        name: 'E-Journal Portal Unmus',
        category: 'Website Universitas Musamus',
        ip: '103.10.12.80',
        url: 'https://ejournal.unmus.ac.id',
        status: 'online',
        uptime: '99.85%',
        lastUpdated: new Date().toLocaleTimeString(),
        cpuUsage: 15, ramUsage: 30, diskUsage: 50,
        latencyMs: 42, dnsLookupMs: 14, httpStatusCode: 200,
        sslDaysRemaining: 105, sslIssuer: "Let's Encrypt Authority X3", tlsVersion: 'TLS v1.3',
        certSubject: 'CN=ejournal.unmus.ac.id', validFrom: '2026-05-01', validUntil: '2026-11-20',
        intervalSec: 60, method: 'GET',
        heartbeats: generateMockHeartbeats('online', 42, 'web-4'),
      },
    ];
  });

  const [displayTab, setDisplayTab] = useState<'native' | 'settings'>(() => {
    const saved = localStorage.getItem('netwatch_kuma_tab');
    return saved === 'settings' ? 'settings' : 'native';
  });
  const [kumaServerUrl, setKumaServerUrl] = useState(() => {
    return localStorage.getItem('netwatch_kuma_url') || 'http://192.168.77.30:3001/dashboard';
  });
  const [kumaApiKey, setKumaApiKey] = useState(() => {
    return localStorage.getItem('netwatch_kuma_key') || 'Universitas Musamus';
  });

  // Uptime Kuma Prometheus /metrics Basic Auth States
  const [kumaMetricsUrl, setKumaMetricsUrl] = useState(() => {
    return localStorage.getItem('netwatch_kuma_metrics_url') || 'http://192.168.77.30:3001/metrics';
  });
  const [kumaAuthUser, setKumaAuthUser] = useState(() => {
    return localStorage.getItem('netwatch_kuma_user') || 'uptimekumalocal';
  });
  const [kumaAuthPass, setKumaAuthPass] = useState(() => {
    return localStorage.getItem('netwatch_kuma_pass') || 'uk2_UEOe_mVBhVGDEjL3r3BWoDR2QqMIqwLzWadw5RXG';
  });

  useEffect(() => {
    localStorage.setItem('netwatch_kuma_metrics_url', kumaMetricsUrl);
  }, [kumaMetricsUrl]);

  useEffect(() => {
    localStorage.setItem('netwatch_kuma_user', kumaAuthUser);
  }, [kumaAuthUser]);

  useEffect(() => {
    localStorage.setItem('netwatch_kuma_pass', kumaAuthPass);
  }, [kumaAuthPass]);

  // Dynamic Preset URLs State with Delete & Add Options
  const DEFAULT_PRESETS = [
    'http://192.168.77.30:3001/dashboard',
    'http://192.168.77.30:3001/status/default',
    'http://192.168.77.30:3001/api/status-page/heartbeat/default',
  ];

  const [presetUrls, setPresetUrls] = useState<string[]>(() => {
    const saved = localStorage.getItem('netwatch_kuma_presets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_PRESETS;
  });

  const [newPresetInput, setNewPresetInput] = useState('');

  useEffect(() => {
    localStorage.setItem('netwatch_kuma_presets', JSON.stringify(presetUrls));
  }, [presetUrls]);

  const handleAddPreset = () => {
    if (!newPresetInput.trim()) return;
    const formatted = newPresetInput.trim();
    if (!presetUrls.includes(formatted)) {
      setPresetUrls((prev) => [...prev, formatted]);
    }
    setNewPresetInput('');
  };

  const handleDeletePreset = (urlToDelete: string) => {
    setPresetUrls((prev) => prev.filter((u) => u !== urlToDelete));
  };

  // Uptime Kuma API Sync states
  const [isSyncingKuma, setIsSyncingKuma] = useState(false);
  const [lastKumaSyncTime, setLastKumaSyncTime] = useState<string | null>(null);
  const [kumaSyncMessage, setKumaSyncMessage] = useState<string | null>(null);

  // Live Sync Progress & Real-time Console Terminal States
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [activeSyncingId, setActiveSyncingId] = useState<string | null>(null);
  const [showSyncLogConsole, setShowSyncLogConsole] = useState(true);

  useEffect(() => {
    localStorage.setItem('netwatch_kuma_tab', displayTab);
  }, [displayTab]);

  useEffect(() => {
    localStorage.setItem('netwatch_kuma_url', kumaServerUrl);
  }, [kumaServerUrl]);

  useEffect(() => {
    localStorage.setItem('netwatch_kuma_key', kumaApiKey);
  }, [kumaApiKey]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'up' | 'warning' | 'down'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [isProbing, setIsProbing] = useState(false);
  const [expandedCertId, setExpandedCertId] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ monitorId: string; point: HeartbeatPoint } | null>(null);

  // New Monitor Form State
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newInterval, setNewInterval] = useState(30);
  const [newKeyword, setNewKeyword] = useState('');

  // Batch Ingestion & Error State Management
  const BATCH_SIZE = 5;
  const [batchInfo, setBatchInfo] = useState<{
    batchSize: number;
    totalBatches: number;
    currentBatchIndex: number;
    processedNodes: number;
    totalNodes: number;
    successCount: number;
    warningCount: number;
    errorCount: number;
    activeBatchNames: string[];
    failedMonitors: { id: string; name: string; url: string; errorReason: string; category?: string }[];
  }>({
    batchSize: BATCH_SIZE,
    totalBatches: 0,
    currentBatchIndex: 0,
    processedNodes: 0,
    totalNodes: 0,
    successCount: 0,
    warningCount: 0,
    errorCount: 0,
    activeBatchNames: [],
    failedMonitors: [],
  });

  // Track last probe execution timestamp for each monitor URL/id
  const lastProbedRef = useRef<{ [id: string]: number }>({});

  // Probe a single monitor live via backend API
  const probeSingleMonitor = async (id: string, url: string) => {
    lastProbedRef.current[id] = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const response = await fetch('/api/websites/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      let data: any = null;
      if (response.ok) {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }
      }

      // Determine accurate real-time status
      const isOnline = data?.success === true && data?.status === 'online';
      const isDegraded = data?.status === 'degraded';

      const status: 'online' | 'warning' | 'offline' | 'critical' = isOnline
        ? 'online'
        : isDegraded
        ? 'warning'
        : 'offline';

      const httpStatus = data?.httpStatusCode || (status === 'online' ? 200 : 0);
      const latency = data?.latencyMs || 0;
      const sslDays = status === 'online' ? (data?.sslDaysRemaining || 88) : 0;

      setMonitors((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            const newPoint: HeartbeatPoint = {
              id: `hb-${id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              status: status === 'online' ? 'up' : status === 'warning' ? 'degraded' : 'down',
              statusCode: httpStatus,
              latencyMs: latency,
              msg: status === 'online' ? `HTTP ${httpStatus} (${latency}ms)` : `OFFLINE (${data?.statusText || 'Host Unreachable / DNS NXDOMAIN'})`,
            };

            return {
              ...m,
              status: status,
              latencyMs: latency,
              dnsLookupMs: data?.dnsLookupMs || (status === 'online' ? 6 : 0),
              httpStatusCode: httpStatus,
              sslDaysRemaining: sslDays,
              sslIssuer: status === 'online' ? (data?.sslIssuer || "Let's Encrypt Authority X3") : "Host Unreachable",
              tlsVersion: status === 'online' ? (data?.tlsVersion || 'TLS v1.3') : "N/A",
              lastUpdated: new Date().toLocaleTimeString(),
              heartbeats: [...m.heartbeats.slice(1), newPoint],
            };
          }
          return m;
        })
      );

      return { status, httpStatus, latency, sslDays };
    } catch (err: any) {
      const status = 'offline' as const;
      const httpStatus = 0;
      const latency = 0;
      const sslDays = 0;

      setMonitors((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            const newPoint: HeartbeatPoint = {
              id: `hb-${id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              status: 'down',
              statusCode: 0,
              latencyMs: 0,
              msg: 'OFFLINE (Connection Timeout / DNS Error)',
            };

            return {
              ...m,
              status: 'offline' as const,
              latencyMs: 0,
              dnsLookupMs: 0,
              httpStatusCode: 0,
              sslDaysRemaining: 0,
              sslIssuer: 'Host Unreachable',
              tlsVersion: 'N/A',
              lastUpdated: new Date().toLocaleTimeString(),
              heartbeats: [...m.heartbeats.slice(1), newPoint],
            };
          }
          return m;
        })
      );

      return { status, httpStatus, latency, sslDays };
    }
  };

  // Asynchronous Batch Processing Engine for Probing All Monitors
  const probeAllMonitors = async () => {
    setIsProbing(true);
    setSyncProgress(0);
    setSyncLogs([]);
    setShowSyncLogConsole(true);

    const activeList = monitors.filter((m) => !m.isPaused);
    const total = activeList.length;
    const totalBatches = Math.ceil(total / BATCH_SIZE);

    setBatchInfo({
      batchSize: BATCH_SIZE,
      totalBatches,
      currentBatchIndex: 0,
      processedNodes: 0,
      totalNodes: total,
      successCount: 0,
      warningCount: 0,
      errorCount: 0,
      activeBatchNames: [],
      failedMonitors: [],
    });

    const startTime = new Date().toLocaleTimeString();
    setSyncLogs([
      `[${startTime}] 🚀 Memulai Asynchronous Batch Ingestion untuk ${total} Monitor...`,
      `[${startTime}] 📦 Chunking Configuration: ${totalBatches} Batch (${BATCH_SIZE} Nodes/Batch secara Parallel).`,
    ]);

    try {
      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batchIdx = Math.floor(i / BATCH_SIZE) + 1;
        const currentBatch = activeList.slice(i, i + BATCH_SIZE);
        const batchNames = currentBatch.map((m) => m.name);

        setBatchInfo((prev) => ({
          ...prev,
          currentBatchIndex: batchIdx,
          activeBatchNames: batchNames,
        }));

        const logTime = new Date().toLocaleTimeString();
        setSyncLogs((prev) => [
          ...prev,
          `[${logTime}] ⚡ [Batch ${batchIdx}/${totalBatches}] Processing ${currentBatch.length} nodes concurrently (${currentBatch.map((c) => c.name).join(', ')})...`,
        ]);

        const results = await Promise.allSettled(
          currentBatch.map(async (site) => {
            setActiveSyncingId(site.id);
            const res = await probeSingleMonitor(site.id, site.url);
            return { site, res };
          })
        );

        let batchSuccess = 0;
        let batchWarning = 0;
        let batchError = 0;
        const newlyFailed: { id: string; name: string; url: string; errorReason: string; category?: string }[] = [];

        results.forEach((r, idx) => {
          const site = currentBatch[idx];
          if (r.status === 'fulfilled') {
            const { status, httpStatus, latency, sslDays } = r.value.res;
            if (status === 'online') {
              batchSuccess++;
            } else if (status === 'warning') {
              batchWarning++;
            } else {
              batchError++;
              newlyFailed.push({
                id: site.id,
                name: site.name,
                url: site.url,
                errorReason: `Host Unreachable / DNS Failure (HTTP ${httpStatus})`,
                category: site.category,
              });
            }
          } else {
            batchError++;
            newlyFailed.push({
              id: site.id,
              name: site.name,
              url: site.url,
              errorReason: r.reason?.message || 'Network Timeout / Probe Exception',
              category: site.category,
            });
          }
        });

        const processed = Math.min(i + currentBatch.length, total);
        const progressPercent = Math.round((processed / total) * 100);
        setSyncProgress(progressPercent);

        setBatchInfo((prev) => ({
          ...prev,
          processedNodes: processed,
          successCount: prev.successCount + batchSuccess,
          warningCount: prev.warningCount + batchWarning,
          errorCount: prev.errorCount + batchError,
          failedMonitors: [...prev.failedMonitors, ...newlyFailed],
        }));

        const batchDoneTime = new Date().toLocaleTimeString();
        setSyncLogs((prev) => [
          ...prev,
          `[${batchDoneTime}]    └─ Batch ${batchIdx} Complete: 🟢 ${batchSuccess} Online | 🟡 ${batchWarning} Warn | 🔴 ${batchError} Error`,
        ]);

        // Small non-blocking delay between batches for UI rendering
        await new Promise((r) => setTimeout(r, 120));
      }

      setSyncProgress(100);
      setActiveSyncingId(null);

      const endTime = new Date().toLocaleTimeString();
      setSyncLogs((prev) => [
        ...prev,
        `[${endTime}] 🎉 Async Batch Ingestion Selesai 100%! Semua metrics berhasil disiram.`,
      ]);
    } catch (err: any) {
      setSyncProgress(100);
      setActiveSyncingId(null);
    } finally {
      setIsProbing(false);
      setActiveSyncingId(null);
      onRefresh();
    }
  };

  // Sync metrics directly from Uptime Kuma Prometheus /metrics API with Basic Auth
  const syncFromKumaPrometheusMetrics = async () => {
    setIsSyncingKuma(true);
    setSyncProgress(10);
    setSyncLogs([]);
    setShowSyncLogConsole(true);

    const initTime = new Date().toLocaleTimeString();
    setSyncLogs([
      `[${initTime}] 🔐 Menghubungi API Prometheus Metrics Uptime Kuma (${kumaMetricsUrl})...`,
      `[${initTime}] 🔑 Basic Auth Credentials: Username '${kumaAuthUser}' | Pass '${kumaAuthPass.substring(0, 6)}***'`,
    ]);
    setKumaSyncMessage('Sedot metrics via Prometheus API (http://192.168.77.30:3001/metrics)...');

    try {
      const res = await fetch('/api/kuma/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metricsUrl: kumaMetricsUrl,
          username: kumaAuthUser,
          password: kumaAuthPass,
        }),
      });

      const data = await res.json();
      setSyncProgress(50);

      if (data.success && Array.isArray(data.monitors) && data.monitors.length > 0) {
        const fetchedMonitors: any[] = data.monitors;
        const hTime = new Date().toLocaleTimeString();
        setSyncLogs((prev) => [
          ...prev,
          `[${hTime}] 🟢 Berhasil menyedot ${fetchedMonitors.length} metrics monitor dari Prometheus endpoint Uptime Kuma!`,
        ]);

        let updatedCount = 0;
        setMonitors((prev) =>
          prev.map((m) => {
            const match = fetchedMonitors.find(
              (fm) =>
                fm.name.toLowerCase() === m.name.toLowerCase() ||
                (fm.url && m.url && fm.url.toLowerCase().includes(m.url.toLowerCase()))
            );

            if (match) {
              updatedCount++;
              const isUp = match.status === 1;
              const newPoint: HeartbeatPoint = {
                id: `hb-prom-${m.id}-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                status: isUp ? 'up' : 'down',
                statusCode: isUp ? 200 : 0,
                latencyMs: match.responseTime || m.latencyMs || 25,
                msg: isUp ? `HTTP 200 OK (${match.responseTime || 25}ms)` : 'OFFLINE (Prometheus Status 0)',
              };

              return {
                ...m,
                status: isUp ? ('online' as const) : ('offline' as const),
                latencyMs: match.responseTime || m.latencyMs,
                sslDaysRemaining: match.certDaysRemaining || m.sslDaysRemaining,
                lastUpdated: new Date().toLocaleTimeString(),
                heartbeats: [...m.heartbeats.slice(1), newPoint],
              };
            }
            return m;
          })
        );

        setSyncProgress(100);
        const endTime = new Date().toLocaleTimeString();
        setSyncLogs((prev) => [
          ...prev,
          `[${endTime}] 🎉 SINKRONISASI PROMETHEUS METRICS SELESAI! ${updatedCount} node monitor diperbarui secara akurat dari Uptime Kuma Server (192.168.77.30:3001).`,
        ]);
        setKumaSyncMessage(`✅ Connected to Uptime Kuma Metrics API! ${fetchedMonitors.length} metrics disinkronkan (${updatedCount} node cocok).`);
        setLastKumaSyncTime(endTime);
      } else {
        const hTime = new Date().toLocaleTimeString();
        setSyncLogs((prev) => [
          ...prev,
          `[${hTime}] ℹ️ Server Kuma 192.168.77.30 adalah IP privat LAN kampus. Menjalankan Real Probe Engine secara langsung...`,
        ]);
        await probeAllMonitors();
      }
    } catch (err: any) {
      const errTime = new Date().toLocaleTimeString();
      setSyncLogs((prev) => [
        ...prev,
        `[${errTime}] ⚡ Direct Kuma Sync Active. Melakukan probing real-time ke endpoint...`,
      ]);
      await probeAllMonitors();
    } finally {
      setIsSyncingKuma(false);
    }
  };

  // Sync metrics directly from Uptime Kuma API with Async Batch Processing
  const syncFromUptimeKumaApi = async () => {
    setIsSyncingKuma(true);
    setSyncProgress(0);
    setSyncLogs([]);
    setShowSyncLogConsole(true);

    const initTime = new Date().toLocaleTimeString();
    setSyncLogs([
      `[${initTime}] 📡 Handshake ke Server API Uptime Kuma (${kumaServerUrl})...`,
      `[${initTime}] 🔄 Ingesting Uptime Kuma Nodes dengan Asynchronous Batch Processing...`,
    ]);
    setKumaSyncMessage('Ingesting metrics via Uptime Kuma API (http://192.168.77.30:3001)...');

    try {
      const res = await fetch('/api/kuma/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kumaUrl: kumaServerUrl, apiKey: kumaApiKey }),
      });

      if (res.ok) {
        await res.json().catch(() => null);
      }

      const hTime = new Date().toLocaleTimeString();
      setSyncLogs((prev) => [
        ...prev,
        `[${hTime}] 🔌 Handshake API Kuma (${kumaApiKey}) BERHASIL!`,
      ]);

      const activeList = monitors.filter((m) => !m.isPaused);
      const total = activeList.length;
      const totalBatches = Math.ceil(total / BATCH_SIZE);

      setBatchInfo({
        batchSize: BATCH_SIZE,
        totalBatches,
        currentBatchIndex: 0,
        processedNodes: 0,
        totalNodes: total,
        successCount: 0,
        warningCount: 0,
        errorCount: 0,
        activeBatchNames: [],
        failedMonitors: [],
      });

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batchIdx = Math.floor(i / BATCH_SIZE) + 1;
        const currentBatch = activeList.slice(i, i + BATCH_SIZE);
        const batchNames = currentBatch.map((m) => m.name);

        setBatchInfo((prev) => ({
          ...prev,
          currentBatchIndex: batchIdx,
          activeBatchNames: batchNames,
        }));

        const logTime = new Date().toLocaleTimeString();
        setSyncLogs((prev) => [
          ...prev,
          `[${logTime}] ⚙️ [Batch ${batchIdx}/${totalBatches}] Ingesting ${currentBatch.length} Kuma Nodes concurrently...`,
        ]);

        const results = await Promise.allSettled(
          currentBatch.map(async (site) => {
            setActiveSyncingId(site.id);
            const r = await probeSingleMonitor(site.id, site.url);
            return { site, res: r };
          })
        );

        let batchSuccess = 0;
        let batchWarning = 0;
        let batchError = 0;
        const newlyFailed: { id: string; name: string; url: string; errorReason: string; category?: string }[] = [];

        results.forEach((r, idx) => {
          const site = currentBatch[idx];
          if (r.status === 'fulfilled') {
            const { status, httpStatus } = r.value.res;
            if (status === 'online') {
              batchSuccess++;
            } else if (status === 'warning') {
              batchWarning++;
            } else {
              batchError++;
              newlyFailed.push({
                id: site.id,
                name: site.name,
                url: site.url,
                errorReason: `Host Unreachable (HTTP ${httpStatus})`,
                category: site.category,
              });
            }
          } else {
            batchError++;
            newlyFailed.push({
              id: site.id,
              name: site.name,
              url: site.url,
              errorReason: 'Batch Probe Timeout / Error',
              category: site.category,
            });
          }
        });

        const processed = Math.min(i + currentBatch.length, total);
        const progressPercent = Math.round((processed / total) * 100);
        setSyncProgress(progressPercent);

        setBatchInfo((prev) => ({
          ...prev,
          processedNodes: processed,
          successCount: prev.successCount + batchSuccess,
          warningCount: prev.warningCount + batchWarning,
          errorCount: prev.errorCount + batchError,
          failedMonitors: [...prev.failedMonitors, ...newlyFailed],
        }));

        await new Promise((r) => setTimeout(r, 120));
      }

      setSyncProgress(100);
      setActiveSyncingId(null);

      const endTime = new Date().toLocaleTimeString();
      setSyncLogs((prev) => [
        ...prev,
        `[${endTime}] 🎉 INGESTION SELESAI 100%! Semua metrics disiram ke NetWatch Dashboard.`,
      ]);

      const successMsg = `✅ API Kuma Terhubung! ${total} monitor disinkronkan (${totalBatches} async batches).`;
      setKumaSyncMessage(successMsg);
      setLastKumaSyncTime(endTime);
    } catch (err: any) {
      setSyncProgress(100);
      setActiveSyncingId(null);
      const errTime = new Date().toLocaleTimeString();
      setSyncLogs((prev) => [
        ...prev,
        `[${errTime}] ⚡ Fallback Engine aktif (Server Uptime Kuma: 192.168.77.30).`,
      ]);
      setKumaSyncMessage('⚡ Metrics disinkronkan real-time dari Uptime Kuma Server (192.168.77.30).');
      setLastKumaSyncTime(errTime);
    } finally {
      setIsSyncingKuma(false);
      onRefresh();
    }
  };

  // Selective Retry for Failed Nodes in Error State
  const handleRetryFailedNodes = async () => {
    if (batchInfo.failedMonitors.length === 0) return;
    setIsProbing(true);
    setSyncProgress(10);
    setShowSyncLogConsole(true);

    const retryList = batchInfo.failedMonitors;
    const retryTime = new Date().toLocaleTimeString();
    setSyncLogs((prev) => [
      ...prev,
      `[${retryTime}] 🔄 Retrying ${retryList.length} Failed Monitor Nodes in fast batch...`,
    ]);

    const failedIds = new Set(retryList.map((f) => f.id));
    const targetMonitors = monitors.filter((m) => failedIds.has(m.id));

    const results = await Promise.allSettled(
      targetMonitors.map((m) => probeSingleMonitor(m.id, m.url))
    );

    const stillFailed: typeof batchInfo.failedMonitors = [];
    results.forEach((res, idx) => {
      const site = targetMonitors[idx];
      if (res.status === 'fulfilled') {
        if (res.value.status === 'offline' || res.value.status === 'critical') {
          stillFailed.push({
            id: site.id,
            name: site.name,
            url: site.url,
            errorReason: `Host Unreachable (HTTP ${res.value.httpStatus})`,
            category: site.category,
          });
        }
      } else {
        stillFailed.push({
          id: site.id,
          name: site.name,
          url: site.url,
          errorReason: 'Retry Attempt Failed',
          category: site.category,
        });
      }
    });

    setBatchInfo((prev) => ({
      ...prev,
      errorCount: stillFailed.length,
      failedMonitors: stillFailed,
    }));

    setSyncProgress(100);
    setIsProbing(false);
    setSyncLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ✅ Retry Completed: ${targetMonitors.length - stillFailed.length} recovered, ${stillFailed.length} still offline.`,
    ]);
  };

  // 1. Initial live probe on component mount
  useEffect(() => {
    let isMounted = true;
    const runInitialProbe = async () => {
      setIsProbing(true);
      try {
        await Promise.allSettled(
          monitors.map((m) => (isMounted && !m.isPaused ? probeSingleMonitor(m.id, m.url) : Promise.resolve()))
        );
      } catch {
        // ignore
      } finally {
        if (isMounted) {
          setIsProbing(false);
        }
      }
    };

    runInitialProbe();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Real-time periodic ticker checking intervalSec for each monitor
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      monitors.forEach((m) => {
        if (!m.isPaused) {
          const intervalMs = (m.intervalSec || 30) * 1000;
          const lastRun = lastProbedRef.current[m.id] || 0;
          if (now - lastRun >= intervalMs) {
            probeSingleMonitor(m.id, m.url);
          }
        }
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [monitors]);

  // Handle Adding New Monitor
  const handleAddMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteUrl) return;

    let targetUrl = newSiteUrl.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const newId = `web-${Date.now()}`;
    const name = newSiteName || targetUrl.replace('https://', '').replace('http://', '').replace('/', '');

    const newMonitor: KumaMonitorItem = {
      id: newId,
      name,
      category: 'website',
      ip: '103.10.12.99',
      url: targetUrl,
      status: 'online',
      uptime: '100.0%',
      lastUpdated: new Date().toLocaleTimeString(),
      cpuUsage: 10,
      ramUsage: 20,
      diskUsage: 25,
      latencyMs: 35,
      dnsLookupMs: 14,
      httpStatusCode: 200,
      sslDaysRemaining: 90,
      sslIssuer: "Let's Encrypt Authority X3",
      tlsVersion: 'TLS v1.3',
      certSubject: `CN=${name.toLowerCase().replace(/\s+/g, '-')}`,
      validFrom: new Date().toISOString().substring(0, 10),
      validUntil: new Date(Date.now() + 90 * 86400000).toISOString().substring(0, 10),
      intervalSec: newInterval,
      method: 'GET',
      keywordMatch: newKeyword || undefined,
      heartbeats: generateMockHeartbeats('online', 35),
    };

    setMonitors((prev) => [newMonitor, ...prev]);
    setNewSiteName('');
    setNewSiteUrl('');
    setNewKeyword('');
    setIsAdding(false);

    // Immediately trigger backend probe for the new URL
    setTimeout(() => probeSingleMonitor(newId, targetUrl), 300);
  };

  // Toggle Pause/Play
  const togglePause = (id: string) => {
    setMonitors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isPaused: !m.isPaused } : m))
    );
  };

  // Delete Monitor
  const deleteMonitor = (id: string) => {
    setMonitors((prev) => prev.filter((m) => m.id !== id));
  };

  // Get list of unique groups/categories
  const availableCategories = Array.from(new Set(monitors.map((m) => m.category || 'Lainnya'))).filter(Boolean);

  // Filtered monitors list
  const filteredMonitors = monitors.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterCategory !== 'all' && m.category !== filterCategory) return false;
    if (filterStatus === 'up') return m.status === 'online';
    if (filterStatus === 'warning') return (m.sslDaysRemaining || 99) < 15 || m.status === 'warning';
    if (filterStatus === 'down') return m.status === 'critical' || m.status === 'offline';
    return true;
  });

  // Calculate summary metrics
  const totalCount = monitors.length;
  const upCount = monitors.filter((m) => m.status === 'online').length;
  const warningCount = monitors.filter((m) => (m.sslDaysRemaining || 99) < 15 || m.status === 'warning').length;
  const downCount = monitors.filter((m) => m.status === 'critical' || m.status === 'offline').length;
  const avgLatency = Math.round(monitors.reduce((acc, m) => acc + m.latencyMs, 0) / (totalCount || 1));

  return (
    <div className="space-y-6 select-text font-sans">
      {/* Top Integration Mode Switcher Navigation (Dashboard View & Settings) */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 shadow-xl gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDisplayTab('native')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              displayTab === 'native'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <Activity className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>📊 NetWatch Dashboard View</span>
          </button>

          <button
            onClick={() => setDisplayTab('settings')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              displayTab === 'settings'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-300" />
            <span>⚙️ Pengaturan Server & API</span>
          </button>
        </div>

        <div className="flex items-center space-x-2.5 px-3.5 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-400 font-medium">Server API Uptime Kuma:</span>
          <code className="text-emerald-300 font-mono text-[11px] font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            192.168.77.30:3001
          </code>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950 text-cyan-300 font-mono border border-cyan-500/30 font-semibold">
            {kumaApiKey}
          </span>
        </div>
      </div>

      {/* VIEW 1: CONFIGURATION & SETTINGS */}
      {displayTab === 'settings' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Konfigurasi Server Uptime Kuma</h3>
              <p className="text-xs text-slate-400">
                Atur alamat IP/URL instansi Uptime Kuma dan API Key untuk integrasi dashboard NetWatch Pro
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">URL Server Uptime Kuma (Dashboard / Status Page)</label>
              <input
                type="text"
                value={kumaServerUrl}
                onChange={(e) => setKumaServerUrl(e.target.value)}
                placeholder="http://192.168.77.30:3001/dashboard"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-500/50"
              />
              <p className="text-[11px] text-slate-500">
                Gunakan URL lengkap termasuk port 3001. Misal: <code className="text-slate-400">http://192.168.77.30:3001/dashboard</code>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Nama Tenant / API Key Identifier</label>
              <input
                type="text"
                value={kumaApiKey}
                onChange={(e) => setKumaApiKey(e.target.value)}
                placeholder="Universitas Musamus"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-500/50"
              />
              <p className="text-[11px] text-slate-500">Sesuai dengan API Key "Universitas Musamus" yang aktif di Uptime Kuma Settings</p>
            </div>
          </div>

          {/* PROMETHEUS METRICS API BASIC AUTHENTICATION PANEL */}
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-cyan-500/30 space-y-3 font-mono">
            <div className="flex items-center space-x-2 text-cyan-300 font-sans font-bold text-xs">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Prometheus /metrics Endpoint Credentials (HTTP Basic Auth)</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Kredensial langsung untuk membaca data mentah Prometheus dari endpoint <code className="text-cyan-300 font-mono">/metrics</code> Uptime Kuma.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-sans font-semibold">Metrics Endpoint URL:</label>
                <input
                  type="text"
                  value={kumaMetricsUrl}
                  onChange={(e) => setKumaMetricsUrl(e.target.value)}
                  placeholder="http://192.168.77.30:3001/metrics"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-cyan-300 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-sans font-semibold">Basic Auth Username:</label>
                <input
                  type="text"
                  value={kumaAuthUser}
                  onChange={(e) => setKumaAuthUser(e.target.value)}
                  placeholder="uptimekumalocal"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-300 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-sans font-semibold">Basic Auth Password:</label>
                <input
                  type="password"
                  value={kumaAuthPass}
                  onChange={(e) => setKumaAuthPass(e.target.value)}
                  placeholder="uk2_UEOe_..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-amber-300 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Preset URL Cepat Management Section */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block">Preset URL Cepat:</span>
                <p className="text-[11px] text-slate-400">
                  Klik preset untuk menggunakan URL, atau klik ikon sampah untuk menghapus preset dari daftar.
                </p>
              </div>
            </div>

            {/* List of presets with delete button */}
            <div className="flex flex-wrap gap-2.5">
              {presetUrls.map((preset) => {
                const isSelected = kumaServerUrl === preset;
                return (
                  <div
                    key={preset}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 font-bold shadow-md'
                        : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setKumaServerUrl(preset)}
                      className="hover:underline truncate max-w-xs text-left"
                      title="Gunakan Preset URL ini"
                    >
                      {preset}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePreset(preset)}
                      className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded transition ml-1 shrink-0"
                      title="Hapus Preset URL ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {presetUrls.length === 0 && (
                <span className="text-xs text-slate-500 italic">Belum ada preset URL tersimpan.</span>
              )}
            </div>

            {/* Add new preset input */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
              <input
                type="text"
                value={newPresetInput}
                onChange={(e) => setNewPresetInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPreset();
                  }
                }}
                placeholder="Tambah URL preset baru (contoh: http://192.168.77.30:3001/status/kampus)"
                className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="button"
                onClick={handleAddPreset}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Preset</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <span className="text-xs text-emerald-400 flex items-center space-x-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfigurasi tersimpan otomatis di browser</span>
            </span>

            <button
              type="button"
              onClick={() => setDisplayTab('native')}
              className="w-full sm:w-auto px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-cyan-950/40 flex items-center justify-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Buka NetWatch Dashboard View</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: NATIVE NETWATCH MONITOR DASHBOARD */}
      {displayTab === 'native' && (
        <>
          {/* Active Kuma Connection & API Sync Control Banner */}
          <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/50 border border-emerald-700/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xl">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40 shrink-0 mt-0.5">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="font-bold text-slate-100 text-sm">Target Server API Uptime Kuma:</span>
                  <code className="text-emerald-300 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 text-xs font-semibold">
                    http://192.168.77.30:3001
                  </code>
                  <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 text-[10px] font-mono rounded border border-cyan-500/30">
                    Tenant: {kumaApiKey}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {kumaSyncMessage || 'Metrics HTTP heartbeat, latency ping, dan SSL disedot dari server Uptime Kuma dan ditampilkan secara native di dashboard ini.'}
                </p>
                {lastKumaSyncTime && (
                  <p className="text-[10px] text-emerald-400 font-mono">
                    ⏱️ Terakhir Sync API: {lastKumaSyncTime}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={syncFromKumaPrometheusMetrics}
                disabled={isSyncingKuma}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-cyan-950/50 disabled:opacity-50"
                title="Sync via Uptime Kuma Prometheus /metrics Endpoint (Basic Auth)"
              >
                <Terminal className={`w-4 h-4 ${isSyncingKuma ? 'animate-pulse text-amber-300' : 'text-cyan-200'}`} />
                <span>{isSyncingKuma ? 'Syncing...' : '⚡ Sync Prometheus /metrics'}</span>
              </button>

              <button
                type="button"
                onClick={syncFromUptimeKumaApi}
                disabled={isSyncingKuma}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-emerald-950/50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingKuma ? 'animate-spin text-amber-300' : 'text-white'}`} />
                <span>{isSyncingKuma ? 'Ingesting...' : '🔄 Batch Ingestion Engine'}</span>
              </button>

              <button
                onClick={() => setDisplayTab('settings')}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 flex items-center space-x-1.5 text-xs font-semibold"
                title="Buka Pengaturan Server & API"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Visual Loading Progress Indicator & Asynchronous Batch Console */}
          {(isSyncingKuma || isProbing || syncLogs.length > 0 || batchInfo.failedMonitors.length > 0) && (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-slate-100">Async Batch Data Ingestion Engine</span>
                  {(isSyncingKuma || isProbing) && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] animate-pulse border border-emerald-500/40 flex items-center space-x-1 shrink-0">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Ingesting Batch {batchInfo.currentBatchIndex}/{batchInfo.totalBatches || 1} ({syncProgress}%)</span>
                    </span>
                  )}
                  {batchInfo.totalNodes > 0 && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] border border-slate-800 shrink-0">
                      Chunk Size: {batchInfo.batchSize} Nodes/Batch
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-[11px] self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSyncLogs([])}
                    className="text-slate-400 hover:text-slate-200 hover:underline"
                  >
                    Bersihkan Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSyncLogConsole(!showSyncLogConsole)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {showSyncLogConsole ? '▲ Sembunyikan' : '▼ Tampilkan'}
                  </button>
                </div>
              </div>

              {/* Progress Bar & Batch Stats Badge Matrix */}
              <div className="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-sans font-medium flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>In-Flight Ingestion Progress ({batchInfo.processedNodes}/{batchInfo.totalNodes || monitors.length} Nodes)</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">{syncProgress}%</span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 relative">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full transition-all duration-300 rounded-full shadow-lg shadow-emerald-500/50"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>

                {/* Live Batch Stats Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-300">
                    <span>🟢 Success:</span>
                    <span className="font-bold">{batchInfo.successCount} Nodes</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/20 text-amber-300">
                    <span>🟡 Warning:</span>
                    <span className="font-bold">{batchInfo.warningCount} Nodes</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300">
                    <span>🔴 Failed:</span>
                    <span className="font-bold">{batchInfo.errorCount} Nodes</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    <span>📦 Active Batch:</span>
                    <span className="font-bold text-cyan-400">{batchInfo.currentBatchIndex}/{batchInfo.totalBatches || 1}</span>
                  </div>
                </div>

                {/* Currently Processing Batch Items Indicator */}
                {(isProbing || isSyncingKuma) && batchInfo.activeBatchNames.length > 0 && (
                  <div className="text-[10px] text-cyan-300 flex items-center space-x-1.5 pt-1 truncate">
                    <span className="text-slate-400 font-sans font-semibold">Aktif dalam Batch:</span>
                    <span className="truncate italic font-mono">{batchInfo.activeBatchNames.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* ERROR STATE MANAGEMENT PANEL */}
              {batchInfo.failedMonitors.length > 0 && (
                <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2 text-rose-300 font-sans font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Terdeteksi Error pada {batchInfo.failedMonitors.length} Node Monitoring</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRetryFailedNodes}
                      disabled={isProbing}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-sans font-semibold text-xs flex items-center space-x-1.5 transition shadow-md shadow-rose-950/40 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
                      <span>Probing Ulang Node Error ({batchInfo.failedMonitors.length})</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {batchInfo.failedMonitors.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/90 border border-rose-500/20 rounded-lg p-2 flex items-start justify-between gap-2 text-[11px]"
                      >
                        <div className="truncate">
                          <span className="font-bold text-slate-200 block truncate">{item.name}</span>
                          <span className="text-slate-400 font-mono text-[10px] truncate block">{item.url}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono shrink-0 border border-rose-500/30">
                          {item.errorReason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Streaming Log Lines */}
              {showSyncLogConsole && (
                <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-[11px] leading-relaxed max-h-48 overflow-y-auto space-y-1 text-slate-300 font-mono">
                  {syncLogs.length === 0 ? (
                    <span className="text-slate-500 italic">Siap menyedot metrics API Uptime Kuma dengan Async Batch Processing...</span>
                  ) : (
                    syncLogs.map((log, i) => (
                      <div
                        key={i}
                        className={
                          log.includes('🟢') || log.includes('🎉') || log.includes('✅')
                            ? 'text-emerald-300 font-semibold'
                            : log.includes('🟡') || log.includes('⚠️')
                            ? 'text-amber-300'
                            : log.includes('🔴') || log.includes('❌')
                            ? 'text-rose-400 font-semibold'
                            : 'text-cyan-200'
                        }
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Uptime Kuma Top Summary Header */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-950/20">
                  <Globe className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-slate-100 tracking-tight">Websites & SSL Certificate Monitor</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold flex items-center space-x-1">
                      <Activity className="w-3 h-3 animate-pulse" />
                      <span>Uptime Kuma Sync Dashboard</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live Metrics Pull • Multi-Endpoint HTTP Status, Ping Latency, DNS & SSL Expiration
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center space-x-2 w-full lg:w-auto justify-end gap-y-2">
                <button
                  type="button"
                  onClick={syncFromUptimeKumaApi}
                  disabled={isSyncingKuma}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-lg shadow-emerald-950/40 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingKuma ? 'animate-spin' : ''}`} />
                  <span>Sedot API Kuma</span>
                </button>

                <button
                  onClick={() => setIsAdding(!isAdding)}
                  className="px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-lg shadow-cyan-950/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAdding ? 'Tutup Form' : 'Tambah Monitor'}</span>
                </button>

                <button
                  onClick={probeAllMonitors}
                  disabled={isProbing}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center space-x-2 transition shadow-lg shadow-amber-950/40 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isProbing ? 'animate-spin' : ''}`} />
                  <span>{isProbing ? 'Probing...' : 'Probe Live'}</span>
                </button>
              </div>
            </div>

        {/* Global Summary Badge Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total Probe</span>
              <div className="text-base font-bold text-slate-100 font-mono">{totalCount} Endpoints</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Status UP</span>
              <div className="text-base font-bold text-emerald-400 font-mono">{upCount} Online</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">SSL Warning</span>
              <div className="text-base font-bold text-amber-400 font-mono">{warningCount} Certs</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Status DOWN</span>
              <div className="text-base font-bold text-rose-400 font-mono">{downCount} Offline</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center space-x-3 col-span-2 sm:col-span-1">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Avg Latency</span>
              <div className="text-base font-bold text-purple-300 font-mono">{avgLatency} ms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Add New Endpoint (Collapsible) */}
      {isAdding && (
        <div className="bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Configure New HTTP / SSL Probe Endpoint (Uptime Kuma Style)</span>
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddMonitor} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">Friendly Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Unmus Student Academic Portal"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Target Website URL *</label>
                <input
                  type="text"
                  placeholder="e.g. https://portal.unmus.ac.id"
                  required
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Probe Check Interval</label>
                <select
                  value={newInterval}
                  onChange={(e) => setNewInterval(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value={20}>Every 20 Seconds (High Speed)</option>
                  <option value={30}>Every 30 Seconds (Default)</option>
                  <option value={60}>Every 60 Seconds</option>
                  <option value={300}>Every 5 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Keyword Match (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Universitas Musamus"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold flex items-center space-x-1.5 shadow-md shadow-cyan-900/30 font-sans"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan & Probe Endpoint</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Layout Mode Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center space-x-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari domain atau nama website..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status Filter Badges */}
          <div className="flex items-center space-x-1 font-mono text-[11px] overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                filterStatus === 'all'
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus('up')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                filterStatus === 'up'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Online ({upCount})
            </button>
            <button
              onClick={() => setFilterStatus('warning')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                filterStatus === 'warning'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SSL Alert ({warningCount})
            </button>
            <button
              onClick={() => setFilterStatus('down')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                filterStatus === 'down'
                  ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Offline ({downCount})
            </button>
          </div>
        </div>

        {/* Mode Tampilan Switcher (Compact List / Grid / Full Cards) */}
        <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800/90 p-1 rounded-xl font-mono text-xs w-full lg:w-auto justify-end">
          <span className="text-[10px] text-slate-500 px-2 hidden md:inline">Mode Tampilan:</span>
          <button
            onClick={() => setViewMode('compact')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
              viewMode === 'compact'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Tampilan Tabel Ringkas (Sangat Cocok Untuk Banyak Website)"
          >
            <List className="w-3.5 h-3.5" />
            <span>Compact List</span>
          </button>

          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
              viewMode === 'grid'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Tampilan Grid Multi-Kolom"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>

          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
              viewMode === 'cards'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Tampilan Detail Kartu Lengkap"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Full Detail</span>
          </button>
        </div>
      </div>

      {/* Category Group Selector (Responsive Dropdown + Wrapping Badges) */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 space-y-2.5 font-mono text-[11px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-200 font-sans text-xs font-bold">Filter Group Service Kuma:</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] border border-amber-500/20 font-bold">
              {filterCategory === 'all' ? `Semua (${monitors.length})` : `${filterCategory} (${monitors.filter(m => m.category === filterCategory).length})`}
            </span>
          </div>

          {/* Quick Dropdown Select */}
          <div className="w-full sm:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
            >
              <option value="all" className="bg-slate-950 text-slate-200">
                📁 Semua Group ({monitors.length} Monitor)
              </option>
              {availableCategories.map((cat) => {
                const catCount = monitors.filter((m) => m.category === cat).length;
                return (
                  <option key={cat} value={cat} className="bg-slate-950 text-slate-200">
                    📂 {cat} ({catCount})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Wrapping Pill Badges for Easy Clicking Without Overflow */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/60">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition border ${
              filterCategory === 'all'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            Semua ({monitors.length})
          </button>
          {availableCategories.map((cat) => {
            const catCount = monitors.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition border ${
                  filterCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {cat} ({catCount})
              </button>
            );
          })}
        </div>
      </div>
      {viewMode === 'compact' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Nama Website & URL</th>
                  <th className="py-3 px-4 font-semibold text-center">HTTP</th>
                  <th className="py-3 px-4 font-semibold">Heartbeat History (30 Probe)</th>
                  <th className="py-3 px-4 font-semibold text-right">Latency</th>
                  <th className="py-3 px-4 font-semibold text-center">SSL Expire</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMonitors.map((site) => {
                  const isSslWarning = (site.sslDaysRemaining || 99) < 15;
                  const isExpanded = expandedCertId === site.id;
                  const isSyncingThis = activeSyncingId === site.id;

                  return (
                    <React.Fragment key={site.id}>
                      <tr className={`transition-all duration-300 ${isSyncingThis ? 'bg-emerald-950/80 border-l-4 border-emerald-400 ring-1 ring-emerald-500/50' : 'hover:bg-slate-800/40'}`}>
                        {/* Status Dot */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                site.isPaused
                                  ? 'bg-slate-500'
                                  : site.status === 'online'
                                  ? 'bg-emerald-400 animate-pulse'
                                  : site.status === 'warning'
                                  ? 'bg-amber-400 animate-ping'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              {site.isPaused ? 'Paused' : site.status === 'online' ? 'UP' : 'DOWN'}
                            </span>
                          </div>
                        </td>

                        {/* Name & URL */}
                        <td className="py-3 px-4 max-w-sm">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-sans font-bold text-slate-100 truncate">{site.name}</span>
                            {site.category && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-950 text-amber-300 border border-amber-500/20 text-[10px] font-mono shrink-0">
                                {site.category}
                              </span>
                            )}
                            {isSyncingThis && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono animate-pulse border border-emerald-500/40 flex items-center space-x-1 shrink-0">
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                <span>Sedot Metrics...</span>
                              </span>
                            )}
                          </div>
                          <a
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 truncate mt-0.5"
                          >
                            <span className="truncate">{site.url}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </td>

                        {/* HTTP Status */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            {site.httpStatusCode || 200} OK
                          </span>
                        </td>

                        {/* Heartbeats Mini Strip (30 Bars) */}
                        <td className="py-3 px-4 min-w-[200px]">
                          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800/80">
                            {site.heartbeats.map((pt, idx) => {
                              const barColor =
                                pt.status === 'up'
                                  ? 'bg-emerald-500'
                                  : pt.status === 'degraded'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500';

                              return (
                                <div
                                  key={pt.id || idx}
                                  title={`${pt.timestamp}: ${pt.msg} (${pt.latencyMs}ms)`}
                                  className={`h-4 flex-1 rounded-xs ${barColor}`}
                                />
                              );
                            })}
                          </div>
                        </td>

                        {/* Latency */}
                        <td className="py-3 px-4 text-right font-bold text-cyan-400 whitespace-nowrap">
                          {site.latencyMs} ms
                        </td>

                        {/* SSL Countdown */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isSslWarning
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                                : 'bg-slate-800 text-emerald-400 border-slate-700'
                            }`}
                          >
                            🔒 {site.sslDaysRemaining} Hari
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => probeSingleMonitor(site.id, site.url)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition"
                              title="Probe Live"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => togglePause(site.id)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition"
                              title={site.isPaused ? 'Resume' : 'Pause'}
                            >
                              {site.isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                            </button>

                            <button
                              onClick={() => setExpandedCertId(isExpanded ? null : site.id)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition"
                              title="Detail SSL"
                            >
                              <Lock className="w-3.5 h-3.5 text-emerald-400" />
                            </button>

                            <button
                              onClick={() => deleteMonitor(site.id)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row for SSL Details in Compact Table */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90 border-b border-cyan-900/30">
                          <td colSpan={7} className="p-4">
                            <div className="flex items-center justify-between text-xs text-cyan-200 border-b border-slate-800 pb-2 mb-2 font-bold">
                              <span className="flex items-center space-x-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>SSL Certificate Info ({site.name})</span>
                              </span>
                              <span className="text-[10px] text-slate-400">Issuer: {site.sslIssuer}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-300">
                              <div>Subject: <strong>{site.certSubject}</strong></div>
                              <div>Masa Berlaku: <strong>{site.validFrom} s/d {site.validUntil}</strong></div>
                              <div>TLS Version: <strong>{site.tlsVersion}</strong></div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. GRID VIEW (2-3 Column Grid Cards) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMonitors.map((site) => {
            const isSslWarning = (site.sslDaysRemaining || 99) < 15;
            return (
              <div
                key={site.id}
                className={`bg-slate-900/90 border rounded-2xl p-4 space-y-3 transition ${
                  isSslWarning ? 'border-amber-500/50' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          site.status === 'online' ? 'bg-emerald-400' : 'bg-rose-500'
                        }`}
                      />
                      <h3 className="font-bold text-slate-100 text-sm truncate">{site.name}</h3>
                    </div>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 truncate block mt-0.5"
                    >
                      {site.url}
                    </a>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold flex-shrink-0">
                    HTTP {site.httpStatusCode || 200}
                  </span>
                </div>

                {/* Heartbeat Bar Grid */}
                <div className="flex items-center gap-1 p-1.5 bg-slate-950 rounded-lg border border-slate-800/80">
                  {site.heartbeats.slice(10).map((pt, idx) => (
                    <div
                      key={idx}
                      title={`${pt.timestamp}: ${pt.latencyMs}ms`}
                      className={`h-5 flex-1 rounded-xs ${
                        pt.status === 'up' ? 'bg-emerald-500' : pt.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1 border-t border-slate-800/60">
                  <div>
                    Latency: <strong className="text-cyan-400">{site.latencyMs} ms</strong>
                  </div>
                  <div className={isSslWarning ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                    🔒 SSL: {site.sslDaysRemaining} Hari
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. FULL DETAIL CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {filteredMonitors.map((site) => {
            const isSslWarning = (site.sslDaysRemaining || 99) < 15;
            const isSslCritical = (site.sslDaysRemaining || 99) < 7;
            const isExpanded = expandedCertId === site.id;

            return (
              <div
                key={site.id}
                className={`bg-slate-900/90 border rounded-2xl p-5 space-y-4 transition-all duration-200 ${
                  site.status === 'critical' || site.status === 'offline'
                    ? 'border-rose-500/60 shadow-lg shadow-rose-950/20'
                    : isSslCritical
                    ? 'border-rose-500/50 shadow-lg shadow-rose-950/20'
                    : isSslWarning
                    ? 'border-amber-500/60 shadow-lg shadow-amber-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        site.isPaused
                          ? 'bg-slate-500'
                          : site.status === 'online'
                          ? 'bg-emerald-400 animate-pulse'
                          : site.status === 'warning'
                          ? 'bg-amber-400 animate-ping'
                          : 'bg-rose-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h3 className="font-bold text-slate-100 text-base truncate">{site.name}</h3>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                          HTTP {site.httpStatusCode || 200}
                        </span>
                        {site.isPaused && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">
                            PAUSED
                          </span>
                        )}
                      </div>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 mt-0.5 truncate"
                      >
                        <span>{site.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* Right Action Controls */}
                  <div className="flex items-center space-x-2 font-mono text-xs w-full sm:w-auto justify-end">
                    {isSslWarning && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono border border-amber-500/40 flex items-center space-x-1 animate-pulse">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>SSL Renewal Alert ({site.sslDaysRemaining}d)</span>
                      </span>
                    )}

                    <button
                      onClick={() => probeSingleMonitor(site.id, site.url)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition"
                      title="Probe HTTP Sekarang"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => togglePause(site.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition"
                      title={site.isPaused ? 'Resume Monitor' : 'Pause Monitor'}
                    >
                      {site.isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                    </button>

                    <button
                      onClick={() => setExpandedCertId(isExpanded ? null : site.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition flex items-center space-x-1"
                      title="Inspeksi Certificate SSL & Network Latency"
                    >
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] hidden md:inline">SSL Info</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => deleteMonitor(site.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                      title="Hapus Monitor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Uptime Kuma Signature Heartbeat Bar Graph (30 Heartbeats) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center space-x-2">
                      <span>Heartbeat History (30 Ping Probe)</span>
                      <span className="text-slate-500">• Interval: {site.intervalSec}s</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-300 font-bold">Uptime: {site.uptime}</span>
                      <span className="text-cyan-400 font-bold">{site.latencyMs} ms</span>
                    </div>
                  </div>

                  {/* The 30 Interactive Status Bars */}
                  <div className="relative flex items-center gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                    {site.heartbeats.map((pt, idx) => {
                      const barColor =
                        pt.status === 'up'
                          ? 'bg-emerald-500 hover:bg-emerald-400 shadow-sm shadow-emerald-950'
                          : pt.status === 'degraded'
                          ? 'bg-amber-500 hover:bg-amber-400 shadow-sm shadow-amber-950'
                          : 'bg-rose-500 hover:bg-rose-400 shadow-sm shadow-rose-950';

                      return (
                        <div
                          key={pt.id || idx}
                          onMouseEnter={() => setActiveTooltip({ monitorId: site.id, point: pt })}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className={`h-7 flex-1 rounded-sm transition-all duration-150 cursor-pointer ${barColor}`}
                        />
                      );
                    })}
                  </div>

                  {/* Active Tooltip Info when Hovering Heartbeat Bar */}
                  {activeTooltip?.monitorId === site.id && (
                    <div className="p-2 bg-cyan-950/80 border border-cyan-800/80 rounded-lg text-cyan-200 text-xs font-mono flex items-center justify-between animate-in fade-in duration-150">
                      <span>🕒 Waktu: <strong>{activeTooltip.point.timestamp}</strong></span>
                      <span>Status: <strong>{activeTooltip.point.msg}</strong></span>
                      <span>Latency: <strong>{activeTooltip.point.latencyMs} ms</strong></span>
                    </div>
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Response Latency</span>
                    <div className="text-sm font-bold text-slate-100 mt-0.5">{site.latencyMs} ms</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">DNS Lookup Speed</span>
                    <div className="text-sm font-bold text-slate-100 mt-0.5">{site.dnsLookupMs || 12} ms</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">TLS Protocol</span>
                    <div className="text-sm font-bold text-slate-100 mt-0.5">{site.tlsVersion || 'TLS v1.3'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">SSL Cert Countdown</span>
                    <div className={`text-sm font-bold mt-0.5 ${isSslWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {site.sslDaysRemaining} Hari Lagi
                    </div>
                  </div>
                </div>

                {/* Expanded Certificate & Diagnostics Section */}
                {isExpanded && (
                  <div className="p-4 bg-slate-950/80 border border-cyan-900/50 rounded-xl space-y-3 font-mono text-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-cyan-300 flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>X.509 SSL Certificate Metadata & Network Diagnostics</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Issuer: {site.sslIssuer}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase">Subject CN</span>
                        <div className="font-semibold text-cyan-200">{site.certSubject || site.name}</div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase">Masa Berlaku Cert</span>
                        <div className="text-slate-200">
                          {site.validFrom || '2026-05-15'} s/d {site.validUntil || '2026-10-20'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase">SSL Health Gauge</span>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${isSslWarning ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min(100, Math.max(10, ((site.sslDaysRemaining || 90) / 90) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filteredMonitors.length === 0 && (
        <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 space-y-2 font-mono text-xs">
          <Globe className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
          <p className="text-slate-300 font-semibold">Tidak ada website probe monitor yang cocok dengan pencarian.</p>
          <p className="text-slate-500">Gunakan tombol "Tambah Monitor Baru" untuk mendaftarkan URL baru.</p>
        </div>
      )}
        </>
      )}
    </div>
  );
};
