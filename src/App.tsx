import React, { useState, useEffect } from 'react';
import {
  initialNodes,
  generateInitialTimeSeries,
  initialAlerts,
  initialAuditLogs,
  initialBackups,
  initialNotificationConfig,
} from './data/mockMetrics';
import {
  NodeMetric,
  MetricTimeSeriesPoint,
  SystemAlert,
  InfluxAuditLog,
  BackupSnapshot,
  NotificationConfig,
  UserSecurityState,
  SystemStatus,
} from './types';

import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { MikroTikMonitor } from './components/MikroTikMonitor';
import { ServerVmMonitor } from './components/ServerVmMonitor';
import { WafMonitor } from './components/WafMonitor';
import { WebsiteMonitor } from './components/WebsiteMonitor';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { AuditLogViewer } from './components/AuditLogViewer';
import { BackupManager } from './components/BackupManager';
import { AlertsAndNotify } from './components/AlertsAndNotify';
import { PrometheusGrafanaConfig } from './components/PrometheusGrafanaConfig';
import { TwoFactorAuthModal } from './components/TwoFactorAuthModal';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('netwatch_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('netwatch_user') || 'daswafx';
  });
  const [currentUserRole, setCurrentUserRole] = useState<string>(() => {
    return localStorage.getItem('netwatch_role') || 'Super Admin';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [nodes, setNodes] = useState<NodeMetric[]>(initialNodes);
  const [timeSeries, setTimeSeries] = useState<MetricTimeSeriesPoint[]>(generateInitialTimeSeries());
  const [alerts, setAlerts] = useState<SystemAlert[]>(initialAlerts);
  const [auditLogs, setAuditLogs] = useState<InfluxAuditLog[]>(initialAuditLogs);
  const [backups, setBackups] = useState<BackupSnapshot[]>(initialBackups);
  const [notifyConfig, setNotifyConfig] = useState<NotificationConfig>(initialNotificationConfig);

  const [userSecurity, setUserSecurity] = useState<UserSecurityState>({
    is2FAEnabled: true,
    totpSecret: 'JBSWY3DPEHPK3PXP',
    qrCodeDataUrl: '',
    backupCodes: ['8102-4912', '9201-3810', '1402-9921', '6712-4019'],
    lastLogin: new Date().toLocaleTimeString(),
    userRole: (localStorage.getItem('netwatch_role') as any) || 'Super Admin',
  });

  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  const handleLoginSuccess = (user: { username: string; role: string }) => {
    const roleToSet = user.role || (user.username.toLowerCase().includes('view') ? 'Viewer' : 'Super Admin');
    setIsAuthenticated(true);
    setCurrentUser(user.username);
    setCurrentUserRole(roleToSet);
    setUserSecurity((prev) => ({ ...prev, userRole: roleToSet as any }));
    localStorage.setItem('netwatch_auth', 'true');
    localStorage.setItem('netwatch_user', user.username);
    localStorage.setItem('netwatch_role', roleToSet);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('netwatch_auth');
    localStorage.removeItem('netwatch_user');
    localStorage.removeItem('netwatch_role');
  };

  // Derive global system status
  const unreadAlerts = alerts.filter((a) => a.status === 'active');
  const systemStatus: SystemStatus = unreadAlerts.some((a) => a.severity === 'critical')
    ? 'critical'
    : unreadAlerts.length > 0
    ? 'warning'
    : 'online';

  // Real-time telemetry simulation interval (updates every 5s)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update Time Series
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setTimeSeries((prev) => {
        const newPoint: MetricTimeSeriesPoint = {
          time: timeStr,
          cpu: Math.floor(30 + Math.random() * 35),
          ram: Math.floor(52 + Math.random() * 15),
          bandwidthIn: Math.floor(300 + Math.random() * 250),
          bandwidthOut: Math.floor(150 + Math.random() * 120),
          latency: Math.floor(1.5 + Math.random() * 5),
          wafBlocked: Math.floor(15 + Math.random() * 40),
        };
        const updated = [...prev.slice(1), newPoint];
        return updated;
      });

      // 2. Slightly fluctuate node metrics
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          const cpuDelta = Math.floor((Math.random() - 0.5) * 6);
          const newCpu = Math.max(10, Math.min(95, node.cpuUsage + cpuDelta));
          const rxDelta = (Math.random() - 0.5) * 20;
          const newRx = node.rxSpeedMbps ? Math.max(10, node.rxSpeedMbps + rxDelta) : undefined;

          return {
            ...node,
            cpuUsage: newCpu,
            rxSpeedMbps: newRx ? Number(newRx.toFixed(1)) : undefined,
            lastUpdated: now.toLocaleTimeString(),
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTimeSeries(generateInitialTimeSeries());
      setIsRefreshing(false);
    }, 800);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a)));
  };

  const handleSendTestTelegramAlert = async () => {
    setIsTestingTelegram(true);
    try {
      await fetch('/api/alerts/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: notifyConfig.telegramBotToken,
          chatId: notifyConfig.telegramChatId,
          message: '🚨 *NetWatch Pro Live Test Alert*\n\nStatus: System Operational\nTime: ' + new Date().toLocaleString(),
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleTriggerBackup = (title: string, targetType: BackupSnapshot['targetType']) => {
    const newBk: BackupSnapshot = {
      id: `bk-${Date.now()}`,
      title,
      targetType,
      sizeBytes: 38400000,
      sizeFormatted: '38.4 MB',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'completed',
      downloadUrl: `/api/backups/download/bk-${Date.now()}`,
      checksum: `sha256-${Math.random().toString(36).substring(2, 10)}`,
    };
    setBackups([newBk, ...backups]);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        unreadAlertCount={unreadAlerts.length}
        userSecurity={userSecurity}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpen2FAModal={() => setIs2FAModalOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Main Body Layout with Left Sidebar */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadAlertCount={unreadAlerts.length}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Main View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden">
          {activeTab === 'overview' && (
            <OverviewDashboard
              nodes={nodes}
              timeSeries={timeSeries}
              alerts={alerts}
              onNavigateTab={setActiveTab}
              onSendTestTelegramAlert={handleSendTestTelegramAlert}
              isTestingTelegram={isTestingTelegram}
            />
          )}

          {activeTab === 'mikrotik' && (
            <MikroTikMonitor
              mikrotikNodes={nodes.filter((n) => n.category === 'mikrotik')}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'servers' && (
            <ServerVmMonitor
              serverNodes={nodes.filter((n) => n.category === 'server' || n.category === 'vm')}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'waf' && (
            <WafMonitor
              wafNode={nodes.find((n) => n.category === 'waf')}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'websites' && (
            <WebsiteMonitor
              websiteNodes={nodes.filter((n) => n.category === 'website')}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'predictive' && <PredictiveAnalytics nodes={nodes} />}

          {activeTab === 'logs' && <AuditLogViewer logs={auditLogs} onRefresh={handleRefresh} />}

          {activeTab === 'backups' && (
            <BackupManager
              backups={backups}
              onTriggerBackup={handleTriggerBackup}
              userRole={userSecurity.userRole}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsAndNotify
              config={notifyConfig}
              onSaveConfig={setNotifyConfig}
              alerts={alerts}
              onResolveAlert={handleResolveAlert}
              onSendTestTelegramAlert={handleSendTestTelegramAlert}
              isTestingTelegram={isTestingTelegram}
            />
          )}

          {activeTab === 'config' && <PrometheusGrafanaConfig />}
        </main>
      </div>

      {/* 2FA Security Modal */}
      {is2FAModalOpen && (
        <TwoFactorAuthModal
          userSecurity={userSecurity}
          onClose={() => setIs2FAModalOpen(false)}
          onUpdateSecurity={setUserSecurity}
        />
      )}
    </div>
  );
}
