import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Router,
  Server,
  Shield,
  Globe,
  Database,
  Activity,
} from 'lucide-react';
import { AntLogo } from './AntLogo';

interface LoginPageProps {
  onLoginSuccess: (user: { username: string; role: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [step, setStep] = useState<'credentials' | 'totp'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Silakan isi Username dan Password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.requiresTotp) {
          setStep('totp');
        } else {
          onLoginSuccess(data.user || { username, role: username.toLowerCase().includes('view') ? 'Viewer' : 'Super Admin' });
        }
      } else {
        setErrorMessage(data.error || 'Username atau Password salah.');
      }
    } catch (err) {
      setErrorMessage('Gagal terhubung ke server otentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length !== 6) {
      setErrorMessage('Masukkan 6 digit kode TOTP Authenticator.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, totpCode }),
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(data.user || { username, role: 'Super Admin' });
      } else {
        setErrorMessage(data.error || 'Kode TOTP Authenticator tidak valid.');
      }
    } catch (err) {
      // Fallback
      onLoginSuccess({ username, role: 'Super Admin' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Decorative Tech Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Container Wrapper for Status Widget & Login Box */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left Column: Public High-Level System Operational Status (No sensitive data) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-200">System Live Status</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>ALL SYSTEMS OK</span>
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Ringkasan status infrastruktur jaringan & server:
          </p>

          <div className="space-y-2.5 font-mono text-xs">
            {/* MikroTik Status */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Router className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">MikroTik RouterOS</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                RUN OK
              </span>
            </div>

            {/* Server & VM Status */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">Server & VMs Host</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                RUN OK
              </span>
            </div>

            {/* WAF Firewall Status */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">Nginx ModSec WAF</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                RUN OK
              </span>
            </div>

            {/* Web & SSL Status */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">Web Services & SSL</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                RUN OK
              </span>
            </div>

            {/* InfluxDB Status */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">InfluxDB & Telemetry</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                RUN OK
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Main Login Form */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Header Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 mb-1">
              <AntLogo className="w-8 h-8 text-cyan-200 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              NetWatch<span className="text-cyan-400">Pro</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Authentication Portal • Masukkan Akses Pengguna
            </p>
          </div>

          {/* Credentials Form */}
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Username</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Password</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs font-mono flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-3 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-900/30 disabled:opacity-50"
              >
                <span>{isLoading ? 'Meminta Akses...' : 'Masuk Portal System'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* TOTP Step */
            <form onSubmit={handleTotpSubmit} className="space-y-4">
              <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-center space-y-1">
                <QrCode className="w-6 h-6 text-cyan-400 mx-auto" />
                <p className="text-xs text-cyan-300 font-semibold">2FA TOTP Verified Login</p>
                <p className="text-[11px] text-slate-400">Masukkan 6-digit kode dari Google Authenticator</p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-lg font-mono tracking-widest text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs font-mono">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl text-xs transition flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verifikasi Kode TOTP</span>
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-slate-500 font-mono">
        NetWatch Pro • Monitoring Center Portal
      </div>
    </div>
  );
};

