/**
 * ネットワーク計算ユーティリティ
 */

export interface NetworkInfo {
  networkAddress: string
  broadcastAddress: string
  firstHost: string
  lastHost: string
  hostCount: number
  subnetMask: string
  wildcardMask: string
  cidr: number
}

export interface BinaryRepresentation {
  ip: string
  mask: string
}

export enum IPType {
  NETWORK = 'ネットワークアドレス',
  BROADCAST = 'ブロードキャスト',
  HOST = 'ホスト'
}

/**
 * IPアドレスを32ビット整数に変換
 */
export function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(p => p < 0 || p > 255 || isNaN(p))) {
    throw new Error('無効なIPアドレス形式です')
  }
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
}

/**
 * 32ビット整数をIPアドレスに変換
 */
export function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.')
}

/**
 * IPアドレスを2進数表記に変換
 */
export function ipToBinary(ip: string): string {
  const parts = ip.split('.').map(Number)
  return parts.map(p => p.toString(2).padStart(8, '0')).join('.')
}

/**
 * CIDR表記からサブネットマスクを計算
 */
export function cidrToSubnetMask(cidr: number): string {
  if (cidr < 0 || cidr > 32) {
    throw new Error('CIDRは0から32の範囲で指定してください')
  }
  const mask = (0xFFFFFFFF << (32 - cidr)) >>> 0
  return numberToIp(mask)
}

/**
 * サブネットマスクからワイルドカードマスクを計算
 */
export function getWildcardMask(subnetMask: string): string {
  const maskNum = ipToNumber(subnetMask)
  const wildcardNum = (~maskNum) >>> 0
  return numberToIp(wildcardNum)
}

/**
 * CIDR表記からネットワーク情報を計算
 */
export function calculateNetworkInfo(cidrNotation: string): NetworkInfo {
  const match = cidrNotation.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)
  if (!match) {
    throw new Error('無効なCIDR表記です (例: 192.168.0.0/24)')
  }

  const [, ip, cidrStr] = match
  const cidr = parseInt(cidrStr, 10)

  if (cidr < 0 || cidr > 32) {
    throw new Error('CIDRは0から32の範囲で指定してください')
  }

  const ipNum = ipToNumber(ip)
  const subnetMask = cidrToSubnetMask(cidr)
  const maskNum = ipToNumber(subnetMask)

  // ネットワークアドレス
  const networkNum = (ipNum & maskNum) >>> 0
  const networkAddress = numberToIp(networkNum)

  // ブロードキャストアドレス
  const wildcardNum = (~maskNum) >>> 0
  const broadcastNum = (networkNum | wildcardNum) >>> 0
  const broadcastAddress = numberToIp(broadcastNum)

  // ホスト範囲
  const firstHostNum = networkNum + 1
  const lastHostNum = broadcastNum - 1
  const firstHost = numberToIp(firstHostNum)
  const lastHost = numberToIp(lastHostNum)

  // ホスト数
  const hostCount = Math.max(0, broadcastNum - networkNum - 1)

  // ワイルドカードマスク
  const wildcardMask = getWildcardMask(subnetMask)

  return {
    networkAddress,
    broadcastAddress,
    firstHost,
    lastHost,
    hostCount,
    subnetMask,
    wildcardMask,
    cidr
  }
}

/**
 * IPアドレスとCIDRの2進数表記を取得
 */
export function getBinaryRepresentation(cidrNotation: string): BinaryRepresentation {
  const match = cidrNotation.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)
  if (!match) {
    throw new Error('無効なCIDR表記です (例: 192.168.0.0/24)')
  }

  const [, ip, cidrStr] = match
  const cidr = parseInt(cidrStr, 10)
  const subnetMask = cidrToSubnetMask(cidr)

  return {
    ip: ipToBinary(ip),
    mask: ipToBinary(subnetMask)
  }
}

/**
 * IPアドレスがネットワークに属するか判定
 */
export function isIpInNetwork(ip: string, cidrNotation: string): boolean {
  try {
    const networkInfo = calculateNetworkInfo(cidrNotation)
    const ipNum = ipToNumber(ip)
    const networkNum = ipToNumber(networkInfo.networkAddress)
    const broadcastNum = ipToNumber(networkInfo.broadcastAddress)

    return ipNum >= networkNum && ipNum <= broadcastNum
  } catch (error) {
    throw error
  }
}

/**
 * IPアドレスの種類を判定
 */
export function getIPType(ip: string, cidrNotation: string): IPType {
  const networkInfo = calculateNetworkInfo(cidrNotation)
  const ipNum = ipToNumber(ip)
  const networkNum = ipToNumber(networkInfo.networkAddress)
  const broadcastNum = ipToNumber(networkInfo.broadcastAddress)

  if (ipNum === networkNum) {
    return IPType.NETWORK
  } else if (ipNum === broadcastNum) {
    return IPType.BROADCAST
  } else {
    return IPType.HOST
  }
}

/**
 * IPアドレスの妥当性をチェック
 */
export function isValidIP(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4) return false

  return parts.every(part => {
    const num = parseInt(part, 10)
    return !isNaN(num) && num >= 0 && num <= 255 && part === String(num)
  })
}

/**
 * CIDR表記の妥当性をチェック
 */
export function isValidCIDR(cidr: string): boolean {
  const match = cidr.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)
  if (!match) return false

  const [, ip, cidrNum] = match
  const cidrValue = parseInt(cidrNum, 10)

  return isValidIP(ip) && cidrValue >= 0 && cidrValue <= 32
}
