export type NodeCategory = 'mikrotik' | 'server' | 'vm' | 'waf' | 'website';

export type SystemStatus = 'online' | 'warning' | 'critical' | 'offline';

export interface NodeMetric {
  id: string;
  name: string;
  category: NodeCategory;
  ip: string;
  location?: string;
  status: SystemStatus;
  uptime: string;
  lastUpdated: string;
  cpuUsage: number; // percentage
  ramUsage: number; // percentage
  diskUsage: number; // percentage
  temperature?: number; // Celsius
  latencyMs: number;
  
  // Specific fields
  rxSpeedMbps?: number; // Traffic In
  txSpeedMbps?: number; // Traffic Out
  activeConnections?: number;
  
  // MikroTik
  routerOSVersion?: string;
  activeDhcpLeases?: number;
  snmpStatus?: 'connected' | 'error' | 'disabled';
  
  // Server / VM
  osName?: string;
  vmHost?: string;
  servicesRunning?: { name: string; status: 'active' | 'failed' | 'stopped'; cpu: number; ram: string }[];
  
  // WAF
  blockedRequestsTotal?: number;
  attacksToday?: { sqli: number; xss: number; rateLimit: number; botnet: number };
  httpStatusDist?: { '2xx': number; '3xx': number; '4xx': number; '5xx': number };
  topBlockedIps?: { ip: string; country: string; reason: string; count: number }[];
  
  // Website
  sslDaysRemaining?: number;
  sslIssuer?: string;
  httpStatusCode?: number;
  dnsLookupMs?: number;
}

export interface MetricTimeSeriesPoint {
  time: string;
  cpu: number;
  ram: number;
  bandwidthIn: number; // Mbps
  bandwidthOut: number; // Mbps
  latency: number; // ms
  wafBlocked: number;
}

export interface SystemAlert {
  id: string;
  nodeId: string;
  nodeName: string;
  category: NodeCategory;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  sentViaTelegram: boolean;
  sentViaEmail: boolean;
}

export interface InfluxAuditLog {
  id: string;
  timestamp: string;
  measurement: 'syslog' | 'auth_event' | 'waf_event' | 'snmp_trap' | 'backup_event';
  sourceIp: string;
  user: string;
  action: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'SECURITY' | 'CRITICAL';
  details: string;
  nodeName: string;
}

export interface BackupSnapshot {
  id: string;
  title: string;
  targetType: 'MikroTik RSC' | 'Ubuntu Config' | 'InfluxDB Dump' | 'Nginx WAF Rules' | 'Full System Bundle';
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  status: 'completed' | 'in_progress' | 'failed';
  downloadUrl: string;
  checksum: string;
}

export interface NotificationConfig {
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  emailEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  recipientEmail: string;
  notifyOnWarning: boolean;
  notifyOnCritical: boolean;
  autoReportDaily: boolean;
}

export interface PredictiveAnalysisResult {
  nodeId: string;
  nodeName: string;
  riskScore: number; // 0 - 100
  predictedExhaustionDays: number | null; // e.g. 14 days left for disk
  predictedFailureType: string;
  confidence: number; // 0 - 100%
  recommendedAction: string;
  anomalySummary: string;
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  historicalTrendPoints?: { time: string; actual: number; predicted: number }[];
}

export interface UserSecurityState {
  is2FAEnabled: boolean;
  totpSecret: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
  lastLogin: string;
  userRole: 'Administrator' | 'Security Ops' | 'Auditor';
}
