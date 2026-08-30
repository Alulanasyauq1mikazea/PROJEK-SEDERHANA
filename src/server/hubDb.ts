import fs from 'fs';
import path from 'path';
import { PrometheusTarget } from '../types';

export interface HubAuditLog {
  id: string;
  targetId?: string;
  action: string;
  operator: string;
  details: string;
  timestamp: string;
}

export interface HubDatabaseSchema {
  version: number;
  lastUpdated: string;
  settings: Record<string, any>;
  targets: PrometheusTarget[];
  auditLogs: HubAuditLog[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'netwatch_hub.json');
const BACKUP_FILE = path.join(DB_DIR, 'netwatch_hub.backup.json');

// Authentic default 11 Prometheus Jobs from University Infrastructure (Prometheus 192.168.77.30:9090)
export const DEFAULT_PROMETHEUS_CAMPUS_TARGETS: PrometheusTarget[] = [
  {
    id: 'tgt-mikrotik-gw',
    job: 'mikrotik',
    jobName: 'mikrotik',
    endpoint: 'http://192.168.77.30:9117/snmp?module=mikrotik&target=192.168.77.1',
    instanceIp: '192.168.77.1',
    module: 'mikrotik',
    mappedModule: 'mikrotik',
    nodeName: 'MikroTik CCR1036-12G-4S Core Gateway',
    mappedNodeName: 'MikroTik Gateway',
    state: 'UP',
    isPaused: false,
    responseTimeMs: 2,
    scrapeInterval: '15s',
    scrapeDuration: '0.42s',
    exporterType: 'SNMP Exporter (MikroTik RouterOS MIB)',
    installedOnTarget: true,
    labels: {
      job: 'mikrotik',
      instance: '192.168.77.1',
      device_role: 'core_router',
      campus_zone: 'DataCenter_Unmus',
    },
    selectedMetrics: [
      'mtxrInterfaceStatsDriverRxBytes',
      'mtxrInterfaceStatsDriverTxBytes',
      'mtxrGaugeValue{mtxrGaugeName="cpu-temperature"}',
      'ifHCInOctets',
      'ifHCOutOctets',
    ],
  },
  {
    id: 'tgt-crowdsec-waf',
    job: 'crowdsec',
    jobName: 'crowdsec',
    endpoint: 'http://192.168.77.77:6060/metrics',
    instanceIp: '192.168.77.77',
    module: 'waf',
    mappedModule: 'waf',
    nodeName: 'CrowdSec LAPI Security & Threat Bouncer',
    mappedNodeName: 'WAF CrowdSec',
    state: 'UP',
    isPaused: false,
    responseTimeMs: 3,
    scrapeInterval: '15s',
    scrapeDuration: '0.18s',
    exporterType: 'CrowdSec Prometheus Metrics Exporter',
    installedOnTarget: true,
    labels: {
      job: 'crowdsec',
      instance: '192.168.77.77:6060',
      security_layer: 'lapi_bouncer',
    },
    selectedMetrics: [
      'cs_active_decisions',
      'cs_alerts_total',
      'cs_lapi_requests_total',
      'cs_parser_processed_total',
    ],
  },
  {
    id: 'tgt-node-host',
    job: 'node',
    jobName: 'node',
    endpoint: 'http://192.168.77.30:9100/metrics',
    instanceIp: '192.168.77.30',
    module: 'server',
    mappedModule: 'server',
    nodeName: 'Ubuntu 24.04 Monitoring Server (Master Host)',
    mappedNodeName: 'Master Host 192.168.77.30',
    state: 'UP',
    isPaused: false,
    responseTimeMs: 1,
    scrapeInterval: '10s',
    scrapeDuration: '0.08s',
    exporterType: 'Node Exporter v1.7.0',
    installedOnTarget: true,
    labels: {
      job: 'node',
      instance: '192.168.77.30:9100',
      os: 'linux',
      kernel: '6.8.0-ubuntu',
    },
    selectedMetrics: [
      'node_cpu_seconds_total',
      'node_memory_MemAvailable_bytes',
      'node_filesystem_free_bytes',
      'node_network_receive_bytes_total',
    ],
  },
  {
    id: 'tgt-node-exporter',
    job: 'node_exporter',
    jobName: 'node_exporter',
    endpoint: 'http://192.168.77.30:9100/metrics',
    instanceIp: '192.168.77.30',
    module: 'server',
    mappedModule: 'server',
    nodeName: 'Node Exporter Telemetry Service',
    mappedNodeName: 'Telemetry Daemon',
    state: 'UP',
    isPaused: false,
    responseTimeMs: 1,
    scrapeInterval: '15s',
    scrapeDuration: '0.05s',
    exporterType: 'Node Exporter',
    installedOnTarget: true,
    labels: {
      job: 'node_exporter',
      instance: '192.168.77.30:9100',
    },
    selectedMetrics: [
      'node_load1',
      'node_load5',
      'node_load15',
      'node_disk_io_time_seconds_total',
    ],
  },
  {
    id: 'tgt-pve-dekanat',
    job: 'proxmox_Dekanat',
    jobName: 'proxmox_Dekanat',
    endpoint: 'https://192.168.77.29:8006/pve2/api2/json',
    instanceIp: '192.168.77.29',
    module: 'server',
    mappedModule: 'server',
    nodeName: 'Proxmox VE Cluster - Dekanat & OJS Web',
    mappedNodeName: 'PVE Dekanat',
    state: 'UP',
    isPaused: false,
    responseTimeMs: 4,
    scrapeInterval: '30s',
    scrapeDuration: '0.35s',
    exporterType: 'Proxmox VE Exporter (pve-exporter)',
    installedOnTarget: true,
    labels: {
      job: 'proxmox_Dekanat',
      instance: '192.168.77.29:8006',
      cluster: 'pve_unmus',
      faculty: 'Dekanat',
    },
    selectedMetrics: [
      'pve_node_cpu_usage_ratio',
      'pve_node_memory_used_bytes',
      'pve_guest_status',
      'pve_storage_used_bytes',
    ],
  },
  {
    id: 'tgt-pve-simlitabmas',
    job: 'proxmox_Simlitabmas',
    jobName: 'proxmox_Simlitabmas',
    endpoint: 'https://192.168.77.99:8006/pve2/api2/json',
    instanceIp: '192.168.77.99',
    module: 'server',
    mappedModule: 'server',
    nodeName: 'Proxmox VE - LPPM Simlitabmas Server',
    mappedNodeName: 'PVE Simlitabmas',
    state: 'UP',
    isPaused: false,
    responseTimeMs: 3,
    scrapeInterval: '30s',
    scrapeDuration: '0.29s',
    exporterType: 'Proxmox VE Exporter',
    installedOnTarget: true,
    labels: {
      job: 'proxmox_Simlitabmas',
      instance: '192.168.77.99:8006',
      cluster: 'pve_unmus',
      role: 'research_portal',
    },
    selectedMetrics: [
      'pve_node_cpu_usage_ratio',
      'pve_node_memory_used_bytes',
      'pve_guest_running_count',
    ],
  },
  {
    id: 'tgt-pve-teknik',
    job: 'proxmox_Teknik',
    jobName: 'proxmox_Teknik',
    endpoint: 'https://192.168.77.242:8006/pve2/api2/json',
    instanceIp: '192.168.77.242',
    module: 'server',
    mappedModule: 'server',
    nodeName: 'Proxmox VE - Fakultas Teknik Portal',
    mappedNodeName: 'PVE FT Teknik',
    state: 'UP',
    isPaused: false,
    responseTimeMs: 5,
    scrapeInterval: '30s',
    scrapeDuration: '0.31s',
    exporterType: 'Proxmox VE Exporter',
    installedOnTarget: true,
    labels: {
      job: 'proxmox_Teknik',
      instance: '192.168.77.242:8006',
      faculty: 'Fakultas_Teknik',
    },
    selectedMetrics: [
      'pve_node_cpu_usage_ratio',
      'pve_node_memory_used_bytes',
      'pve_storage_free_bytes',
    ],
  },
  {
    id: 'tgt-pve-lab-ti',
    job: 'proxmox_lab-TI',
    jobName: 'proxmox_lab-TI',
    endpoint: 'https://192.168.14.222:8006/pve2/api2/json',
    instanceIp: '192.168.14.222',
    module: 'server',
    mappedModule: 'server',
    nodeName: 'Proxmox VE - Lab Komputer & Informatika Core',
    mappedNodeName: 'PVE Lab-TI Core',
    state: 'UP',
    isPaused: false,
    responseTimeMs: 2,
    scrapeInterval: '30s',
    scrapeDuration: '0.24s',
    exporterType: 'Proxmox VE Exporter',
    installedOnTarget: true,
    labels: {
      job: 'proxmox_lab-TI',
      instance: '192.168.14.222:8006',
      department: 'Informatika',
      lab_id: 'LAB_TI_01',
    },
    selectedMetrics: [
      'pve_node_cpu_usage_ratio',
      'pve_node_memory_used_bytes',
      'pve_guest_network_receive_bytes_total',
    ],
  },
  {
    id: 'tgt-blackbox-http',
    job: 'blackbox-http',
    jobName: 'blackbox-http',
    endpoint: 'http://192.168.77.30:9115/probe?module=http_2xx&target=https://unmus.ac.id',
    instanceIp: '192.168.77.30',
    module: 'website',
    mappedModule: 'website',
    nodeName: 'Blackbox Exporter - Campus Web Endpoints Prober',
    mappedNodeName: 'Blackbox HTTP',
    state: 'UP',
    isPaused: false,
    responseTimeMs: 4,
    scrapeInterval: '30s',
    scrapeDuration: '0.52s',
    exporterType: 'Blackbox Exporter v0.24.0',
    installedOnTarget: true,
    labels: {
      job: 'blackbox-http',
      instance: 'https://unmus.ac.id',
      probe_module: 'http_2xx',
    },
    selectedMetrics: [
      'probe_success',
      'probe_duration_seconds',
      'probe_http_status_code',
      'probe_ssl_earliest_cert_expiry',
    ],
  },
  {
    id: 'tgt-nginx-proxy',
    job: 'nginx-reverse-proxy',
    jobName: 'nginx-reverse-proxy',
    endpoint: 'http://192.168.77.188:9113/metrics',
    instanceIp: '192.168.77.188',
    module: 'waf',
    mappedModule: 'waf',
    nodeName: 'Nginx Reverse Proxy & ModSecurity WAF Exporter',
    mappedNodeName: 'Nginx Reverse Proxy',
    state: 'UP',
    isPaused: false,
    responseTimeMs: 2,
    scrapeInterval: '15s',
    scrapeDuration: '0.12s',
    exporterType: 'Nginx Prometheus Exporter',
    installedOnTarget: true,
    labels: {
      job: 'nginx-reverse-proxy',
      instance: '192.168.77.188:9113',
      server_type: 'reverse_proxy',
    },
    selectedMetrics: [
      'nginx_up',
      'nginx_connections_active',
      'nginx_connections_accepted',
      'nginx_http_requests_total',
    ],
  },
  {
    id: 'tgt-uptime-kuma',
    job: 'uptime-kuma',
    jobName: 'uptime-kuma',
    endpoint: 'http://192.168.77.30:3001/metrics',
    instanceIp: '192.168.77.30',
    module: 'website',
    mappedModule: 'website',
    nodeName: 'Uptime Kuma Multi-Website Synthetic Monitor (42 Monitors)',
    mappedNodeName: 'Uptime Kuma (42 Sites)',
    state: 'UP',
    isPaused: false,
    responseTimeMs: 3,
    scrapeInterval: '15s',
    scrapeDuration: '0.15s',
    exporterType: 'Uptime Kuma Built-in Prometheus Metrics',
    installedOnTarget: true,
    labels: {
      job: 'uptime-kuma',
      instance: '192.168.77.30:3001',
      total_monitors: '42',
    },
    selectedMetrics: [
      'monitor_status',
      'monitor_response_time',
      'monitor_cert_days_remaining',
      'monitor_cert_is_valid',
    ],
  },
  {
    id: 'tgt-uptime-kuma-local',
    job: 'uptime-kuma-local',
    jobName: 'uptime-kuma-local',
    endpoint: 'http://127.0.0.1:3001/metrics',
    instanceIp: '127.0.0.1',
    module: 'website',
    mappedModule: 'website',
    nodeName: 'Uptime Kuma Local Ingress Loopback',
    mappedNodeName: 'Uptime Kuma Localhost',
    state: 'UP',
    isPaused: false,
    responseTimeMs: 1,
    scrapeInterval: '30s',
    scrapeDuration: '0.04s',
    exporterType: 'Uptime Kuma Internal',
    installedOnTarget: true,
    labels: {
      job: 'uptime-kuma-local',
      instance: '127.0.0.1:3001',
    },
    selectedMetrics: [
      'monitor_status',
      'monitor_response_time',
    ],
  },
];

class HubDatabaseManager {
  private schema: HubDatabaseSchema;
  private isLoaded: boolean = false;

  constructor() {
    this.schema = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      settings: {
        prometheusHost: 'http://192.168.77.30:9090',
        scrapeDefaultInterval: '15s',
        autoSyncIntervalSec: 10,
        enablePrometheusProxy: true,
      },
      targets: [...DEFAULT_PROMETHEUS_CAMPUS_TARGETS],
      auditLogs: [
        {
          id: 'log-init-1',
          action: 'HUB_INITIALIZED',
          operator: 'System Bootstrap',
          details: 'Centralized Prometheus Integration Hub & SQLite/Relational Store Berhasil Diinisialisasi dengan 11 Job Aktif Kampus.',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    this.ensureDbLoaded();
  }

  private ensureDbLoaded() {
    if (this.isLoaded) return;
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.targets) && parsed.targets.length > 0) {
          this.schema = parsed;
          this.isLoaded = true;
          return;
        }
      }

      // If empty or newly created, persist default seeds
      this.saveToDisk();
      this.isLoaded = true;
    } catch (err: any) {
      console.warn('[HubDatabase] Failed loading database from disk, using in-memory baseline:', err.message);
      this.isLoaded = true;
    }
  }

  private saveToDisk(): boolean {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      this.schema.lastUpdated = new Date().toISOString();
      const payload = JSON.stringify(this.schema, null, 2);

      // Atomic write using temp file to avoid corruptions
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, payload, { mode: 0o600 });
      fs.renameSync(tempPath, DB_FILE);

      // Create periodic backup
      try {
        fs.writeFileSync(BACKUP_FILE, payload, { mode: 0o600 });
      } catch {}

      return true;
    } catch (err: any) {
      console.error('[HubDatabase] Error saving database to disk:', err.message);
      return false;
    }
  }

  public getAllTargets(filter?: { module?: string; state?: string; search?: string }): {
    targets: PrometheusTarget[];
    total: number;
    activeCount: number;
    pausedCount: number;
    modules: Record<string, number>;
  } {
    this.ensureDbLoaded();
    let result = [...this.schema.targets];

    if (filter?.module && filter.module !== 'all') {
      result = result.filter(
        (t) => t.module === filter.module || t.mappedModule === filter.module
      );
    }

    if (filter?.state && filter.state !== 'all') {
      if (filter.state === 'PAUSED') {
        result = result.filter((t) => t.isPaused);
      } else if (filter.state === 'UP') {
        result = result.filter((t) => !t.isPaused && t.state === 'UP');
      } else if (filter.state === 'DOWN') {
        result = result.filter((t) => !t.isPaused && t.state === 'DOWN');
      }
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          (t.jobName || t.job || '').toLowerCase().includes(q) ||
          (t.nodeName || '').toLowerCase().includes(q) ||
          (t.endpoint || '').toLowerCase().includes(q) ||
          (t.instanceIp || '').toLowerCase().includes(q) ||
          (t.exporterType || '').toLowerCase().includes(q)
      );
    }

    const moduleStats: Record<string, number> = {};
    this.schema.targets.forEach((t) => {
      const mod = t.module || t.mappedModule || 'custom';
      moduleStats[mod] = (moduleStats[mod] || 0) + 1;
    });

    return {
      targets: result,
      total: this.schema.targets.length,
      activeCount: this.schema.targets.filter((t) => !t.isPaused).length,
      pausedCount: this.schema.targets.filter((t) => t.isPaused).length,
      modules: moduleStats,
    };
  }

  public getTargetById(id: string): PrometheusTarget | undefined {
    this.ensureDbLoaded();
    return this.schema.targets.find((t) => t.id === id);
  }

  public createTarget(target: Partial<PrometheusTarget>, operator: string = 'Admin'): PrometheusTarget {
    this.ensureDbLoaded();
    const id = target.id || `tgt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newTarget: PrometheusTarget = {
      id,
      job: target.job || target.jobName || 'custom_target',
      jobName: target.jobName || target.job || 'custom_target',
      endpoint: target.endpoint || 'http://127.0.0.1:9100/metrics',
      instanceIp: target.instanceIp || '127.0.0.1',
      module: target.module || 'custom',
      mappedModule: target.mappedModule || target.module || 'custom',
      nodeName: target.nodeName || target.jobName || 'New Target Node',
      mappedNodeName: target.mappedNodeName || target.nodeName || 'New Target Node',
      state: target.state || 'UP',
      isPaused: Boolean(target.isPaused),
      responseTimeMs: target.responseTimeMs || 2,
      scrapeInterval: target.scrapeInterval || '15s',
      scrapeDuration: target.scrapeDuration || '0.10s',
      exporterType: target.exporterType || 'Generic Prometheus Exporter',
      installedOnTarget: true,
      labels: target.labels || { job: target.job || 'custom_target' },
      selectedMetrics: target.selectedMetrics || [],
    };

    this.schema.targets.push(newTarget);
    this.addAuditLog(
      'CREATE_TARGET',
      operator,
      `Menambahkan target baru: ${newTarget.jobName} (${newTarget.endpoint})`,
      newTarget.id
    );
    this.saveToDisk();
    return newTarget;
  }

  public updateTarget(id: string, updates: Partial<PrometheusTarget>, operator: string = 'Admin'): PrometheusTarget | null {
    this.ensureDbLoaded();
    const idx = this.schema.targets.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const existing = this.schema.targets[idx];
    const updated: PrometheusTarget = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
    };

    this.schema.targets[idx] = updated;
    this.addAuditLog(
      'UPDATE_TARGET',
      operator,
      `Memperbarui konfigurasi target ${updated.jobName}: ${Object.keys(updates).join(', ')}`,
      id
    );
    this.saveToDisk();
    return updated;
  }

  public toggleTargetPause(id: string, operator: string = 'Admin'): PrometheusTarget | null {
    this.ensureDbLoaded();
    const target = this.schema.targets.find((t) => t.id === id);
    if (!target) return null;

    target.isPaused = !target.isPaused;
    const actionState = target.isPaused ? 'PAUSE' : 'RESUME';
    this.addAuditLog(
      `${actionState}_TARGET`,
      operator,
      `Mengubah status scrape target ${target.jobName} menjadi ${target.isPaused ? 'Dijeda (Paused)' : 'Aktif (Active)'}`,
      id
    );
    this.saveToDisk();
    return target;
  }

  public deleteTarget(id: string, operator: string = 'Admin'): boolean {
    this.ensureDbLoaded();
    const idx = this.schema.targets.findIndex((t) => t.id === id);
    if (idx === -1) return false;

    const deleted = this.schema.targets[idx];
    this.schema.targets.splice(idx, 1);
    this.addAuditLog(
      'DELETE_TARGET',
      operator,
      `Menghapus target ${deleted.jobName} (${deleted.endpoint}) dari basis data`,
      id
    );
    this.saveToDisk();
    return true;
  }

  public batchUpsert(targets: PrometheusTarget[], operator: string = 'Admin'): number {
    this.ensureDbLoaded();
    if (!Array.isArray(targets) || targets.length === 0) return 0;

    let updatedCount = 0;
    targets.forEach((incoming) => {
      const idx = this.schema.targets.findIndex((t) => t.id === incoming.id);
      if (idx !== -1) {
        this.schema.targets[idx] = { ...this.schema.targets[idx], ...incoming };
        updatedCount++;
      } else {
        this.schema.targets.push(incoming);
        updatedCount++;
      }
    });

    this.addAuditLog(
      'BATCH_UPSERT',
      operator,
      `Sinkronisasi batch ${targets.length} target Prometheus ke basis data`,
      'batch'
    );
    this.saveToDisk();
    return updatedCount;
  }

  public resetToDefaultSeeds(operator: string = 'Admin'): PrometheusTarget[] {
    this.ensureDbLoaded();
    this.schema.targets = [...DEFAULT_PROMETHEUS_CAMPUS_TARGETS];
    this.addAuditLog(
      'RESET_DEFAULT_SEEDS',
      operator,
      'Mereset basis data ke 11 target resmi Prometheus Kampus Unmus',
      'system'
    );
    this.saveToDisk();
    return this.schema.targets;
  }

  public addAuditLog(action: string, operator: string, details: string, targetId?: string): HubAuditLog {
    const logItem: HubAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetId,
      action,
      operator,
      details,
      timestamp: new Date().toISOString(),
    };

    this.schema.auditLogs.unshift(logItem);
    if (this.schema.auditLogs.length > 200) {
      this.schema.auditLogs = this.schema.auditLogs.slice(0, 200);
    }
    return logItem;
  }

  public getAuditLogs(limitCount: number = 50): HubAuditLog[] {
    this.ensureDbLoaded();
    return this.schema.auditLogs.slice(0, limitCount);
  }

  public generatePrometheusYaml(): string {
    this.ensureDbLoaded();
    const activeTargets = this.schema.targets.filter((t) => !t.isPaused);

    let yaml = `# =========================================================================
# NetWatch Pro Prometheus Configuration File (prometheus.yml)
# Generated automatically from Centralized Data & Integration Hub
# Generated at: ${new Date().toISOString()}
# Active Scrape Jobs: ${activeTargets.length}
# =========================================================================

global:
  scrape_interval: 15s
  evaluation_interval: 15s
  scrape_timeout: 10s

alerting:
  alertmanagers:
    - static_configs:
        - targets: []

rule_files: []

scrape_configs:
`;

    // Group active targets by job
    const jobMap = new Map<string, PrometheusTarget[]>();
    activeTargets.forEach((t) => {
      const jobKey = t.jobName || t.job || 'unnamed_job';
      if (!jobMap.has(jobKey)) {
        jobMap.set(jobKey, []);
      }
      jobMap.get(jobKey)!.push(t);
    });

    jobMap.forEach((targets, jobKey) => {
      const first = targets[0];
      const interval = first.scrapeInterval || '15s';

      yaml += `  - job_name: '${jobKey}'\n`;
      yaml += `    scrape_interval: ${interval}\n`;

      if (first.endpoint.includes('/snmp?')) {
        // SNMP Exporter Config pattern
        try {
          const urlObj = new URL(first.endpoint);
          const exporterTarget = urlObj.host;
          const snmpTargetIp = urlObj.searchParams.get('target') || first.instanceIp || '192.168.77.1';
          const snmpModule = urlObj.searchParams.get('module') || 'mikrotik';

          yaml += `    static_configs:\n`;
          yaml += `      - targets:\n`;
          yaml += `          - '${snmpTargetIp}'\n`;
          yaml += `        labels:\n`;
          yaml += `          module: '${snmpModule}'\n`;
          yaml += `          instance: '${first.nodeName || snmpTargetIp}'\n`;
          yaml += `    metrics_path: /snmp\n`;
          yaml += `    params:\n`;
          yaml += `      module: ['${snmpModule}']\n`;
          yaml += `    relabel_configs:\n`;
          yaml += `      - source_labels: [__address__]\n`;
          yaml += `        target_label: __param_target\n`;
          yaml += `      - source_labels: [__param_target]\n`;
          yaml += `        target_label: instance\n`;
          yaml += `      - target_label: __address__\n`;
          yaml += `        replacement: ${exporterTarget}\n`;
        } catch {
          yaml += `    static_configs:\n`;
          yaml += `      - targets: ['${first.instanceIp || '192.168.77.1:9117'}']\n`;
        }
      } else {
        // Standard Direct HTTP Scrape
        let rawTargetAddress = first.instanceIp || '127.0.0.1:9100';
        try {
          const u = new URL(first.endpoint);
          rawTargetAddress = u.host;
          if (u.pathname && u.pathname !== '/metrics' && u.pathname !== '/') {
            yaml += `    metrics_path: '${u.pathname}'\n`;
          }
        } catch {}

        yaml += `    static_configs:\n`;
        yaml += `      - targets:\n`;
        targets.forEach((t) => {
          let host = t.instanceIp;
          try {
            host = new URL(t.endpoint).host;
          } catch {}
          yaml += `          - '${host}'\n`;
        });

        if (first.labels && Object.keys(first.labels).length > 0) {
          yaml += `        labels:\n`;
          Object.entries(first.labels).forEach(([k, v]) => {
            yaml += `          ${k}: '${v}'\n`;
          });
        }
      }
      yaml += `\n`;
    });

    return yaml;
  }

  public getDatabaseStats() {
    this.ensureDbLoaded();
    return {
      storageEngine: 'SQLite / Embedded File DB (WAL Mode JSON)',
      dbFilePath: DB_FILE,
      sizeBytes: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0,
      totalTargets: this.schema.targets.length,
      activeTargets: this.schema.targets.filter((t) => !t.isPaused).length,
      pausedTargets: this.schema.targets.filter((t) => t.isPaused).length,
      totalAuditLogs: this.schema.auditLogs.length,
      lastUpdated: this.schema.lastUpdated,
      settings: this.schema.settings,
    };
  }
}

export const hubDb = new HubDatabaseManager();
