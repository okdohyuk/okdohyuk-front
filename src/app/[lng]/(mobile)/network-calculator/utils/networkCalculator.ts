// ============================================================
// Network Calculator Utility Functions
// Pure functions for IP / subnet / VLSM / wildcard calculations
// ============================================================

export interface SubnetResult {
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  subnetMask: string;
  cidr: number;
  ipBinary: string;
  maskBinary: string;
}

export interface VlsmSubnet {
  name: string;
  requiredHosts: number;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  cidr: number;
  subnetMask: string;
  totalHosts: number;
  usableHosts: number;
}

export interface VlsmResult {
  subnets: VlsmSubnet[];
  remainingSpace: number;
}

// ─── IP / Binary helpers ─────────────────────────────────────

export function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + parts[3];
}

export function numberToIp(num: number): string {
  return [
    Math.floor(num / 16777216) % 256,
    Math.floor(num / 65536) % 256,
    Math.floor(num / 256) % 256,
    num % 256,
  ].join('.');
}

export function ipToBinary(ip: string): string {
  return ip
    .split('.')
    .map((octet) => Number(octet).toString(2).padStart(8, '0'))
    .join('');
}

export function cidrToMask(cidr: number): number {
  if (cidr === 0) return 0;
  if (cidr === 32) return 4294967295;
  // 2^32 - 2^(32-cidr)
  return 4294967296 - 2 ** (32 - cidr);
}

export function cidrToSubnetMask(cidr: number): string {
  return numberToIp(cidrToMask(cidr));
}

export function subnetMaskToCidr(mask: string): number {
  const num = ipToNumber(mask);
  if (num === 0) return 0;
  if (num === 4294967295) return 32;
  const binary = num.toString(2).padStart(32, '0');
  const firstZero = binary.indexOf('0');
  return firstZero === -1 ? 32 : firstZero;
}

// ─── Validation ──────────────────────────────────────────────

export function isValidIp(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    const num = Number(part);
    return /^\d+$/.test(part) && num >= 0 && num <= 255;
  });
}

export function isValidSubnetMask(mask: string): boolean {
  if (!isValidIp(mask)) return false;
  const binary = ipToBinary(mask);
  return /^1*0*$/.test(binary);
}

export function isValidCidr(cidr: number): boolean {
  return Number.isInteger(cidr) && cidr >= 0 && cidr <= 32;
}

// ─── Core: IP/Subnet Calculator ─────────────────────────────

export function calculateSubnet(ip: string, cidr: number): SubnetResult {
  const blockSize = 2 ** (32 - cidr);
  const ipNum = ipToNumber(ip);
  const networkNum = ipNum - (ipNum % blockSize);
  const broadcastNum = networkNum + blockSize - 1;
  const totalHosts = blockSize;
  const usableHosts = cidr >= 31 ? totalHosts : Math.max(0, totalHosts - 2);
  const firstHostNum = cidr >= 31 ? networkNum : networkNum + 1;
  const lastHostNum = cidr >= 31 ? broadcastNum : broadcastNum - 1;

  return {
    networkAddress: numberToIp(networkNum),
    broadcastAddress: numberToIp(broadcastNum),
    firstHost: numberToIp(firstHostNum),
    lastHost: numberToIp(lastHostNum),
    totalHosts,
    usableHosts,
    subnetMask: cidrToSubnetMask(cidr),
    cidr,
    ipBinary: ipToBinary(ip),
    maskBinary: ipToBinary(cidrToSubnetMask(cidr)),
  };
}

// ─── Core: VLSM Calculator ───────────────────────────────────

export function calculateVlsm(
  baseNetwork: string,
  baseCidr: number,
  subnets: Array<{ name: string; requiredHosts: number }>,
): VlsmResult {
  const sorted = [...subnets]
    .filter((s) => s.requiredHosts > 0)
    .sort((a, b) => b.requiredHosts - a.requiredHosts);

  const baseBlockSize = 2 ** (32 - baseCidr);
  const baseNetworkNum = ipToNumber(baseNetwork) - (ipToNumber(baseNetwork) % baseBlockSize);

  let currentBase = baseNetworkNum;

  const results: VlsmSubnet[] = sorted.map((subnet) => {
    const neededAddresses = subnet.requiredHosts + 2;
    let prefixLen = 32;
    while (prefixLen > 0 && 2 ** (32 - prefixLen) < neededAddresses) {
      prefixLen -= 1;
    }
    if (prefixLen < baseCidr) {
      prefixLen = baseCidr;
    }

    const blockSize = 2 ** (32 - prefixLen);
    const remainder = currentBase % blockSize;
    const alignedBase = remainder === 0 ? currentBase : currentBase + (blockSize - remainder);

    const networkNum = alignedBase;
    const broadcastNum = networkNum + blockSize - 1;
    const usableHosts = prefixLen >= 31 ? blockSize : blockSize - 2;

    currentBase = broadcastNum + 1;

    return {
      name: subnet.name,
      requiredHosts: subnet.requiredHosts,
      networkAddress: numberToIp(networkNum),
      broadcastAddress: numberToIp(broadcastNum),
      firstHost: numberToIp(prefixLen >= 31 ? networkNum : networkNum + 1),
      lastHost: numberToIp(prefixLen >= 31 ? broadcastNum : broadcastNum - 1),
      cidr: prefixLen,
      subnetMask: cidrToSubnetMask(prefixLen),
      totalHosts: blockSize,
      usableHosts,
    };
  });

  const usedAddresses = currentBase - baseNetworkNum;
  const remaining = baseBlockSize - usedAddresses;

  return { subnets: results, remainingSpace: Math.max(0, remaining) };
}

// ─── Core: Wildcard Mask Calculator ─────────────────────────

export function calculateWildcard(subnetMask: string): string {
  return subnetMask
    .split('.')
    .map((octet) => (255 - Number(octet)).toString())
    .join('.');
}

// ─── Helpers: Binary visualization ──────────────────────────

export interface BinarySegment {
  id: string;
  bit: string;
  type: 'network' | 'host';
  position: number;
}

export function getBinarySegments(ipBinary: string, cidr: number): BinarySegment[] {
  return ipBinary.split('').map((bit, index) => ({
    id: `seg-${index}`,
    bit,
    type: index < cidr ? 'network' : 'host',
    position: index,
  }));
}

// ─── Constants ───────────────────────────────────────────────

export const COMMON_CIDR_OPTIONS = Array.from({ length: 25 }, (_, i) => {
  const cidr = i + 8;
  const hosts = 2 ** (32 - cidr) - 2;
  return {
    value: String(cidr),
    label: `/${cidr} — ${cidrToSubnetMask(cidr)} (${hosts.toLocaleString()} hosts)`,
    cidr,
    hosts: Math.max(0, hosts),
  };
});
