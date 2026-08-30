import React, { useState } from 'react';
import {
  Sliders,
  Download,
  Terminal,
  Copy,
  CheckCircle2,
  Server,
  Code,
  FileCode,
  Zap,
  Target,
  BookOpen
} from 'lucide-react';
import { PrometheusTargetManager } from './PrometheusTargetManager';

export const PrometheusGrafanaConfig: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'targets' | 'deployment'>('targets');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const pm2DeployCommands = `# 1. Download/Upload OmniGuard-Live Source Code to Server
cd /var/www
# Git clone or unzip OmniGuard-Live project here
cd omniguard-live

# 2. Install Node Dependencies & Build Production Bundle
npm install
npm run build

# 3. Configure Environment Variables (.env)
cp .env.example .env
# Edit .env with nano or vim to set TELEGRAM_BOT_TOKEN, SMTP, etc.
# nano .env

# 4. Start OmniGuard-Live Node.js Backend Server with PM2
pm2 start dist/server.cjs --name "omniguard-live"
pm2 save
pm2 startup

# 5. Check Running Status
pm2 status
pm2 logs omniguard-live`;

  const nginxConfigSnippet = `# /etc/nginx/sites-available/omniguard-live
server {
    listen 80;
    server_name omniguard.unmus.ac.id; # Ubah dengan Domain / IP Server Anda

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Aktifkan konfigurasi & reload Nginx
# sudo ln -s /etc/nginx/sites-available/omniguard-live /etc/nginx/sites-enabled/
# sudo nginx -t
# sudo systemctl reload nginx`;

  const ubuntuSetupCommands = `# Install Exporters (Prometheus, Node Exporter, SNMP Exporter, Blackbox Exporter)
sudo apt update
sudo apt install -y prometheus prometheus-node-exporter prometheus-snmp-exporter prometheus-blackbox-exporter

# Install Grafana Server
sudo mkdir -p /etc/apt/keyrings/
wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee /etc/apt/sources.list.d/grafana.list
sudo apt update && sudo apt install -y grafana

# Start Systemd Services
sudo systemctl enable --now prometheus
sudo systemctl enable --now prometheus-node-exporter
sudo systemctl enable --now grafana-server`;

  const mariaDbCommands = `# 1. Login ke MariaDB / MySQL Server di Ubuntu 24.04
sudo mysql -u root -p

# 2. Buat Database omniguard_db & User Khusus OmniGuard
CREATE DATABASE IF NOT EXISTS omniguard_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'omniguard_user'@'localhost' IDENTIFIED BY 'PasswordStrong123!';
GRANT ALL PRIVILEGES ON omniguard_db.* TO 'omniguard_user'@'localhost';
FLUSH PRIVILEGES;

# 3. Import Skema Tabel Users & Audit Logs ke MariaDB
mysql -u omniguard_user -pomniguard_db < /var/www/omniguard-live/schema.sql
# Atau jalankan otomatis via OmniGuard backend API: curl http://localhost:3000/api/auth/db-schema`;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tab Selector Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('targets')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
            activeSubTab === 'targets'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Integrasi Target & Metrik Prometheus (192.168.77.30:9090)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('deployment')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
            activeSubTab === 'deployment'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Panduan Deployment Ubuntu 24.04 & PM2</span>
        </button>
      </div>

      {activeSubTab === 'targets' ? (
        <PrometheusTargetManager />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Panduan Deployment Ubuntu 24.04, PM2 & Nginx</h2>
                <p className="text-xs text-slate-400">Instruksi lengkap penerapan aplikasi OmniGuard-Live pada server Ubuntu 24.04 LTS Anda</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href="/api/config/prometheus"
                download="prometheus.yml"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download prometheus.yml</span>
              </a>
              <a
                href="/api/config/grafana"
                download="grafana_dashboard.json"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Grafana JSON</span>
              </a>
            </div>
          </div>

      {/* Step 1: PM2 Node Deployment */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Langkah 1: Jalankan OmniGuard-Live dengan PM2 Node Manager</span>
          </h3>
          <button
            onClick={() => copyToClipboard(pm2DeployCommands, 1)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center space-x-1 transition"
          >
            {copiedIndex === 1 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedIndex === 1 ? 'Copied' : 'Copy Commands'}</span>
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-cyan-400 overflow-x-auto whitespace-pre">
          {pm2DeployCommands}
        </div>
      </div>

      {/* Step 2: Nginx Reverse Proxy Setup */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
            <Server className="w-4 h-4 text-amber-400" />
            <span>Langkah 2: Konfigurasi Nginx Reverse Proxy (Port 3000)</span>
          </h3>
          <button
            onClick={() => copyToClipboard(nginxConfigSnippet, 2)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center space-x-1 transition"
          >
            {copiedIndex === 2 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedIndex === 2 ? 'Copied' : 'Copy Nginx Conf'}</span>
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-amber-300 overflow-x-auto whitespace-pre">
          {nginxConfigSnippet}
        </div>
      </div>

      {/* Step 3: MariaDB / MySQL Setup */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
            <Code className="w-4 h-4 text-purple-400" />
            <span>Langkah 3: Konfigurasi Database MariaDB / MySQL (`omniguard_db`)</span>
          </h3>
          <button
            onClick={() => copyToClipboard(mariaDbCommands, 3)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center space-x-1 transition"
          >
            {copiedIndex === 3 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedIndex === 3 ? 'Copied' : 'Copy MariaDB Commands'}</span>
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-purple-300 overflow-x-auto whitespace-pre">
          {mariaDbCommands}
        </div>
      </div>

      {/* Step 4: Optional Prometheus & Grafana Exporters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Langkah 4 (Opsional): Install Prometheus & Node Exporters</span>
          </h3>
          <button
            onClick={() => copyToClipboard(ubuntuSetupCommands, 4)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center space-x-1 transition"
          >
            {copiedIndex === 4 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedIndex === 4 ? 'Copied' : 'Copy Commands'}</span>
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre">
          {ubuntuSetupCommands}
        </div>
      </div>
    </div>
  )}
</div>
);
};

export default PrometheusGrafanaConfig;

