export function parsePrometheusText(
  text: string, 
  existingMonitorsMap: Record = {}
): any[] {
  if (!text || typeof text !== 'string') return [];

  const lines = text.split('\n');
  const map: Record = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([a-zA-Z0-9_]+)\{(.*)\}\s+([0-9\.\-+eE]+)/);
    if (!match) continue;

    const metricName = match[1];
    const labelsRaw = match[2];
    const value = parseFloat(match[3]);

    const labels: Record = {};
    const labelMatches = labelsRaw.matchAll(/([a-zA-Z0-9_]+)="([^"]*)"/g);
    for (const lm of labelMatches) {
      labels[lm[1]] = lm[2];
    }

    const rawName = labels['monitor_name'] || labels['name'] || '';
    const name = rawName.trim();
    if (!name) continue;

    if (!map[name]) {
      let rawUrl = labels['monitor_url'] || '';
      if (rawUrl === 'https://' || rawUrl === 'http://') rawUrl = '';

      let category = 'Website & Aplikasi';
      const type = labels['monitor_type'] || 'http';
      if (type === 'docker') category = 'Docker & Infrastructure';
      else if (type === 'group') category = 'Grup Monitor';
      else if (name.toLowerCase().includes('proxmox') || name.toLowerCase().includes('vm')) category = 'Server & VM';

      const id = 'mon-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const existingHb = existingMonitorsMap[name]?.heartbeats || [];

      map[name] = {
        id,
        name,
        category,
        ip: rawUrl ? rawUrl.replace(/^https?:\/\//, '').split('/')[0] : (labels['monitor_hostname'] && labels['monitor_hostname'] !== 'null' ? labels['monitor_hostname'] : '192.168.77.30'),
        url: rawUrl,
        status: 'online',
        uptime: '100.0%',
        latencyMs: 0,
        lastUpdated: new Date().toLocaleTimeString(),
        heartbeats: existingHb,
      };
    }

    if (metricName === 'monitor_status') {
      if (value === 1) {
        map[name].status = 'online';
        map[name].uptime = '100.0%';
      } else if (value === 0) {
        map[name].status = 'offline';
        map[name].latencyMs = 0;
        map[name].uptime = '0.00%';
      } else {
        map[name].status = 'warning';
      }
    } else if (metricName === 'monitor_response_time') {
      if (map[name].status !== 'offline') {
        map[name].latencyMs = Math.round(value);
      }
    }
  }

  return Object.values(map) || [];
}
