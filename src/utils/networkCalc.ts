import { SubnetResult } from '../types';

export function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
}

export function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255
  ].join('.');
}

export function toBinaryString(long: number): string {
  const binary = (long >>> 0).toString(2).padStart(32, '0');
  return `${binary.slice(0, 8)}.${binary.slice(8, 16)}.${binary.slice(16, 24)}.${binary.slice(24, 32)}`;
}

export function calculateSubnet(ipInput: string, cidrInput: number): SubnetResult | null {
  const cleanIp = ipInput.trim();
  const cidr = Math.min(Math.max(Number(cidrInput), 0), 32);

  const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = cleanIp.match(ipRegex);
  if (!match) return null;

  const octets = [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
  if (octets.some(o => o < 0 || o > 255)) return null;

  const ipLong = ipToLong(cleanIp);
  const maskLong = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const wildcardLong = (~maskLong) >>> 0;
  const netLong = (ipLong & maskLong) >>> 0;
  const bcastLong = (netLong | wildcardLong) >>> 0;

  const netmask = longToIp(maskLong);
  const wildcardMask = longToIp(wildcardLong);
  const networkAddress = longToIp(netLong);
  const broadcastAddress = longToIp(bcastLong);

  let firstHostLong = netLong + 1;
  let lastHostLong = bcastLong - 1;
  let totalHosts = Math.pow(2, 32 - cidr);
  let usableHosts = Math.max(0, totalHosts - 2);

  if (cidr === 31) {
    firstHostLong = netLong;
    lastHostLong = bcastLong;
    usableHosts = 2;
  } else if (cidr === 32) {
    firstHostLong = netLong;
    lastHostLong = netLong;
    usableHosts = 1;
    totalHosts = 1;
  }

  const firstHost = cidr <= 32 ? longToIp(firstHostLong) : networkAddress;
  const lastHost = cidr <= 32 ? longToIp(lastHostLong) : broadcastAddress;

  // Detect IP Class
  const firstOctet = octets[0];
  let ipClass = 'Class A';
  if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'Class B';
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'Class C';
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'Class D (Multicast)';
  else if (firstOctet >= 240) ipClass = 'Class E (Experimental)';

  // Check Private RFC1918
  const isPrivate =
    firstOctet === 10 ||
    (firstOctet === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (firstOctet === 192 && octets[1] === 168) ||
    cleanIp === '127.0.0.1';

  return {
    ip: cleanIp,
    cidr,
    netmask,
    wildcardMask,
    networkAddress,
    broadcastAddress,
    firstHost,
    lastHost,
    totalHosts,
    usableHosts,
    ipClass,
    binaryIp: toBinaryString(ipLong),
    binaryMask: toBinaryString(maskLong),
    binaryNetwork: toBinaryString(netLong),
    isPrivate
  };
}
