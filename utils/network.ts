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

export interface IPClassification {
  isPrivate: boolean
  isLoopback: boolean
  isLinkLocal: boolean
  isMulticast: boolean
  isBroadcast: boolean
  isReserved: boolean
  class: string | null
  description: string
  rfc?: string
}

export interface SubnetInfo {
  network: string
  cidr: number
  networkAddress: string
  broadcastAddress: string
  firstHost: string
  lastHost: string
  hostCount: number
}

export interface VLSMRequirement {
  name: string
  hostsNeeded: number
}

export interface VLSMResult {
  name: string
  hostsNeeded: number
  hostsAvailable: number
  cidr: number
  network: string
  networkAddress: string
  broadcastAddress: string
  firstHost: string
  lastHost: string
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

/**
 * IPアドレスの詳細分類を取得
 */
export function classifyIPAddress(ip: string): IPClassification {
  if (!isValidIP(ip)) {
    throw new Error('無効なIPアドレスです')
  }

  const ipNum = ipToNumber(ip)
  const parts = ip.split('.').map(Number)
  const firstOctet = parts[0]

  // プライベートIPアドレス (RFC 1918)
  const isPrivate =
    (firstOctet === 10) || // 10.0.0.0/8
    (firstOctet === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
    (firstOctet === 192 && parts[1] === 168) // 192.168.0.0/16

  // ループバックアドレス (RFC 1122)
  const isLoopback = firstOctet === 127 // 127.0.0.0/8

  // リンクローカルアドレス (RFC 3927)
  const isLinkLocal = firstOctet === 169 && parts[1] === 254 // 169.254.0.0/16

  // マルチキャストアドレス (RFC 5771)
  const isMulticast = firstOctet >= 224 && firstOctet <= 239 // 224.0.0.0/4

  // ブロードキャストアドレス
  const isBroadcast = ip === '255.255.255.255'

  // 予約済みアドレス
  const isReserved =
    firstOctet === 0 || // 0.0.0.0/8 (RFC 1122)
    (firstOctet === 192 && parts[1] === 0 && parts[2] === 0) || // 192.0.0.0/24 (RFC 6890)
    (firstOctet === 192 && parts[1] === 0 && parts[2] === 2) || // 192.0.2.0/24 (TEST-NET-1)
    (firstOctet === 198 && parts[1] === 51 && parts[2] === 100) || // 198.51.100.0/24 (TEST-NET-2)
    (firstOctet === 203 && parts[1] === 0 && parts[2] === 113) || // 203.0.113.0/24 (TEST-NET-3)
    (firstOctet === 198 && parts[1] === 18) || // 198.18.0.0/15 (ベンチマーク)
    (firstOctet >= 240 && firstOctet <= 255 && !isBroadcast) // 240.0.0.0/4 (将来用)

  // IPアドレスクラス
  let ipClass: string | null = null
  if (firstOctet >= 1 && firstOctet <= 126) {
    ipClass = 'クラスA'
  } else if (firstOctet >= 128 && firstOctet <= 191) {
    ipClass = 'クラスB'
  } else if (firstOctet >= 192 && firstOctet <= 223) {
    ipClass = 'クラスC'
  } else if (firstOctet >= 224 && firstOctet <= 239) {
    ipClass = 'クラスD (マルチキャスト)'
  } else if (firstOctet >= 240 && firstOctet <= 255) {
    ipClass = 'クラスE (実験用)'
  }

  // 説明の生成
  let description = ''
  let rfc = undefined

  if (isBroadcast) {
    description = 'リミテッドブロードキャストアドレス'
    rfc = 'RFC 919'
  } else if (isLoopback) {
    description = 'ループバックアドレス（ローカルホスト）'
    rfc = 'RFC 1122'
  } else if (isPrivate) {
    description = 'プライベートIPアドレス（インターネット上では使用不可）'
    rfc = 'RFC 1918'
  } else if (isLinkLocal) {
    description = 'リンクローカルアドレス（APIPA、自動プライベートIP）'
    rfc = 'RFC 3927'
  } else if (isMulticast) {
    description = 'マルチキャストアドレス（グループ通信用）'
    rfc = 'RFC 5771'
  } else if (isReserved) {
    if (firstOctet === 0) {
      description = '予約済み（このネットワーク）'
      rfc = 'RFC 1122'
    } else if (firstOctet === 192 && parts[1] === 0 && parts[2] === 0) {
      description = '予約済み（IETF プロトコル割り当て用）'
      rfc = 'RFC 6890'
    } else if (
      (firstOctet === 192 && parts[1] === 0 && parts[2] === 2) ||
      (firstOctet === 198 && parts[1] === 51 && parts[2] === 100) ||
      (firstOctet === 203 && parts[1] === 0 && parts[2] === 113)
    ) {
      description = 'ドキュメント用テストネットワーク'
      rfc = 'RFC 5737'
    } else if (firstOctet === 198 && parts[1] === 18) {
      description = 'ベンチマーク用ネットワーク'
      rfc = 'RFC 2544'
    } else {
      description = '将来の使用のために予約'
      rfc = 'RFC 1112'
    }
  } else {
    description = 'グローバルIPアドレス（インターネット上で使用可能）'
  }

  return {
    isPrivate,
    isLoopback,
    isLinkLocal,
    isMulticast,
    isBroadcast,
    isReserved,
    class: ipClass,
    description,
    rfc
  }
}

/**
 * ネットワークを指定数に等分割
 */
export function divideSubnetEqually(cidrNotation: string, divisions: number): SubnetInfo[] {
  if (!isValidCIDR(cidrNotation)) {
    throw new Error('無効なCIDR表記です')
  }

  if (divisions < 2 || divisions > 256) {
    throw new Error('分割数は2から256の範囲で指定してください')
  }

  const match = cidrNotation.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)
  if (!match) {
    throw new Error('無効なCIDR表記です')
  }

  const [, ip, cidrStr] = match
  const cidr = parseInt(cidrStr, 10)

  // 必要なビット数を計算
  const bitsNeeded = Math.ceil(Math.log2(divisions))
  const newCidr = cidr + bitsNeeded

  if (newCidr > 32) {
    throw new Error('分割数が多すぎます。CIDR値が32を超えます')
  }

  // 元のネットワークアドレスを取得
  const networkNum = ipToNumber(ip) & ipToNumber(cidrToSubnetMask(cidr))

  const subnets: SubnetInfo[] = []
  const subnetSize = Math.pow(2, 32 - newCidr)

  for (let i = 0; i < divisions; i++) {
    const subnetNetworkNum = networkNum + (i * subnetSize)
    const subnetNetworkAddr = numberToIp(subnetNetworkNum)
    const subnetBroadcastNum = subnetNetworkNum + subnetSize - 1
    const subnetBroadcastAddr = numberToIp(subnetBroadcastNum)

    subnets.push({
      network: `${subnetNetworkAddr}/${newCidr}`,
      cidr: newCidr,
      networkAddress: subnetNetworkAddr,
      broadcastAddress: subnetBroadcastAddr,
      firstHost: numberToIp(subnetNetworkNum + 1),
      lastHost: numberToIp(subnetBroadcastNum - 1),
      hostCount: Math.max(0, subnetSize - 2)
    })
  }

  return subnets
}

/**
 * ネットワークを指定CIDRサイズで分割
 */
export function divideSubnetBySize(cidrNotation: string, newCidr: number): SubnetInfo[] {
  if (!isValidCIDR(cidrNotation)) {
    throw new Error('無効なCIDR表記です')
  }

  const match = cidrNotation.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)
  if (!match) {
    throw new Error('無効なCIDR表記です')
  }

  const [, ip, cidrStr] = match
  const cidr = parseInt(cidrStr, 10)

  if (newCidr <= cidr) {
    throw new Error('新しいCIDRは元のCIDRより大きい値を指定してください')
  }

  if (newCidr > 32) {
    throw new Error('CIDRは32以下で指定してください')
  }

  // 元のネットワークアドレスを取得
  const networkNum = ipToNumber(ip) & ipToNumber(cidrToSubnetMask(cidr))
  const networkSize = Math.pow(2, 32 - cidr)
  const subnetSize = Math.pow(2, 32 - newCidr)
  const subnetCount = Math.floor(networkSize / subnetSize)

  const subnets: SubnetInfo[] = []

  for (let i = 0; i < subnetCount; i++) {
    const subnetNetworkNum = networkNum + (i * subnetSize)
    const subnetNetworkAddr = numberToIp(subnetNetworkNum)
    const subnetBroadcastNum = subnetNetworkNum + subnetSize - 1
    const subnetBroadcastAddr = numberToIp(subnetBroadcastNum)

    subnets.push({
      network: `${subnetNetworkAddr}/${newCidr}`,
      cidr: newCidr,
      networkAddress: subnetNetworkAddr,
      broadcastAddress: subnetBroadcastAddr,
      firstHost: numberToIp(subnetNetworkNum + 1),
      lastHost: numberToIp(subnetBroadcastNum - 1),
      hostCount: Math.max(0, subnetSize - 2)
    })
  }

  return subnets
}

/**
 * IPアドレス範囲からCIDRブロックのリストを生成
 */
export function rangeToCIDR(startIp: string, endIp: string): string[] {
  if (!isValidIP(startIp) || !isValidIP(endIp)) {
    throw new Error('有効なIPアドレスを入力してください')
  }

  const startNum = ipToNumber(startIp)
  const endNum = ipToNumber(endIp)

  if (startNum > endNum) {
    throw new Error('開始IPは終了IP以下である必要があります')
  }

  const cidrs: string[] = []
  let current = startNum

  while (current <= endNum) {
    // 現在のアドレスから始められる最大のCIDRブロックを見つける
    let maxSize = 32

    // アライメント制約: 現在のアドレスが境界に合っているか確認
    for (let i = 0; i < 32; i++) {
      const blockSize = Math.pow(2, i)
      if (current % blockSize !== 0) {
        maxSize = 32 - i + 1
        break
      }
    }

    // 残りのアドレス数に基づいてブロックサイズを調整
    const remaining = endNum - current + 1
    while (maxSize > 0) {
      const blockSize = Math.pow(2, 32 - maxSize)
      if (blockSize <= remaining) {
        break
      }
      maxSize++
    }

    if (maxSize > 32) {
      maxSize = 32
    }

    const cidr = `${numberToIp(current)}/${maxSize}`
    cidrs.push(cidr)

    const blockSize = Math.pow(2, 32 - maxSize)
    current += blockSize
  }

  return cidrs
}

/**
 * 複数のCIDRブロックを集約（スーパーネット化）
 */
export function aggregateCIDRs(cidrs: string[]): string[] {
  if (cidrs.length === 0) {
    return []
  }

  // 各CIDRを検証してソート
  const validCidrs = cidrs.filter(cidr => isValidCIDR(cidr))
  if (validCidrs.length === 0) {
    throw new Error('有効なCIDR表記が見つかりません')
  }

  // CIDRをネットワークアドレスとプレフィックス長に分解してソート
  const networks = validCidrs.map(cidr => {
    const match = cidr.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)!
    const [, ip, cidrStr] = match
    const cidrNum = parseInt(cidrStr, 10)
    const networkNum = ipToNumber(ip) & ipToNumber(cidrToSubnetMask(cidrNum))
    return {
      network: numberToIp(networkNum),
      networkNum,
      cidr: cidrNum,
      original: `${numberToIp(networkNum)}/${cidrNum}`
    }
  })

  // ネットワークアドレスでソート
  networks.sort((a, b) => a.networkNum - b.networkNum)

  // 集約を繰り返し試行
  let aggregated = networks.map(n => n.original)
  let changed = true

  while (changed) {
    changed = false
    const newAggregated: string[] = []
    let i = 0

    while (i < aggregated.length) {
      if (i + 1 < aggregated.length) {
        const current = aggregated[i]
        const next = aggregated[i + 1]

        const currentMatch = current.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)!
        const nextMatch = next.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)!

        const currentIp = currentMatch[1]
        const currentCidr = parseInt(currentMatch[2], 10)
        const nextIp = nextMatch[1]
        const nextCidr = parseInt(nextMatch[2], 10)

        // 同じプレフィックス長で、隣接しているかチェック
        if (currentCidr === nextCidr) {
          const currentNum = ipToNumber(currentIp)
          const nextNum = ipToNumber(nextIp)
          const blockSize = Math.pow(2, 32 - currentCidr)

          // 隣接していて、親ネットワークで統合可能かチェック
          if (nextNum === currentNum + blockSize) {
            const parentCidr = currentCidr - 1
            if (parentCidr >= 0) {
              const parentMask = ipToNumber(cidrToSubnetMask(parentCidr))
              const parentNetwork = currentNum & parentMask

              // 現在のネットワークが親ネットワークの最初のサブネットであることを確認
              if (currentNum === parentNetwork) {
                newAggregated.push(`${numberToIp(parentNetwork)}/${parentCidr}`)
                i += 2
                changed = true
                continue
              }
            }
          }
        }
      }

      newAggregated.push(aggregated[i])
      i++
    }

    aggregated = newAggregated
  }

  return aggregated
}

/**
 * VLSM計算: 必要なホスト数に基づいて最適なサブネット分割を計算
 */
export function calculateVLSM(baseNetwork: string, requirements: VLSMRequirement[]): VLSMResult[] {
  if (!isValidCIDR(baseNetwork)) {
    throw new Error('有効なCIDR表記を入力してください')
  }

  if (requirements.length === 0) {
    throw new Error('少なくとも1つの要件を入力してください')
  }

  // 要件をホスト数の降順でソート
  const sortedReqs = [...requirements].sort((a, b) => b.hostsNeeded - a.hostsNeeded)

  const match = baseNetwork.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)
  if (!match) {
    throw new Error('無効なCIDR表記です')
  }

  const [, ip, cidrStr] = match
  const baseCidr = parseInt(cidrStr, 10)
  const baseNetworkNum = ipToNumber(ip) & ipToNumber(cidrToSubnetMask(baseCidr))

  const results: VLSMResult[] = []
  let currentAddress = baseNetworkNum

  for (const req of sortedReqs) {
    // 必要なホスト数から適切なCIDRを計算
    // ホスト数 = 2^(32-CIDR) - 2 (ネットワークとブロードキャストを除く)
    let requiredCidr = 32
    for (let cidr = baseCidr; cidr <= 30; cidr++) {
      const availableHosts = Math.pow(2, 32 - cidr) - 2
      if (availableHosts >= req.hostsNeeded) {
        requiredCidr = cidr
        break
      }
    }

    if (requiredCidr > 30) {
      throw new Error(`要件 "${req.name}" のホスト数 (${req.hostsNeeded}) が大きすぎます`)
    }

    const subnetSize = Math.pow(2, 32 - requiredCidr)
    const hostsAvailable = subnetSize - 2

    const networkAddress = numberToIp(currentAddress)
    const broadcastAddress = numberToIp(currentAddress + subnetSize - 1)
    const firstHost = numberToIp(currentAddress + 1)
    const lastHost = numberToIp(currentAddress + subnetSize - 2)

    results.push({
      name: req.name,
      hostsNeeded: req.hostsNeeded,
      hostsAvailable,
      cidr: requiredCidr,
      network: `${networkAddress}/${requiredCidr}`,
      networkAddress,
      broadcastAddress,
      firstHost,
      lastHost
    })

    currentAddress += subnetSize
  }

  // 元のネットワーク範囲を超えていないかチェック
  const baseNetworkSize = Math.pow(2, 32 - baseCidr)
  const baseNetworkEnd = baseNetworkNum + baseNetworkSize

  if (currentAddress > baseNetworkEnd) {
    throw new Error('指定したネットワークでは全ての要件を満たすことができません。より大きなネットワークを使用してください。')
  }

  return results
}

/**
 * サブネットマスク変換器の型定義
 */
export interface SubnetMaskConversion {
  cidr: number | null
  dotted: string | null
  wildcard: string | null
  hex: string | null
  binary: string | null
  bits: number | null
}

/**
 * サブネットマスクを16進数表記に変換
 */
export function subnetMaskToHex(subnetMask: string): string {
  const parts = subnetMask.split('.').map(Number)
  return parts.map(p => p.toString(16).padStart(2, '0').toUpperCase()).join('')
}

/**
 * 16進数表記からサブネットマスクに変換
 */
export function hexToSubnetMask(hex: string): string {
  // 0xプレフィックスを削除
  hex = hex.replace(/^0x/i, '')

  if (hex.length !== 8) {
    throw new Error('16進数は8桁で入力してください（例: FFFFFF00）')
  }

  const parts = []
  for (let i = 0; i < 8; i += 2) {
    parts.push(parseInt(hex.substr(i, 2), 16))
  }

  return parts.join('.')
}

/**
 * サブネットマスクからCIDRを計算
 */
export function subnetMaskToCIDR(subnetMask: string): number {
  if (!isValidIP(subnetMask)) {
    throw new Error('無効なサブネットマスクです')
  }

  const maskNum = ipToNumber(subnetMask)
  const binary = maskNum.toString(2)

  // 1のビット数をカウント
  const ones = binary.split('1').length - 1

  // 有効なサブネットマスクか検証（連続した1の後に連続した0）
  const expectedMask = (0xFFFFFFFF << (32 - ones)) >>> 0
  if (maskNum !== expectedMask) {
    throw new Error('無効なサブネットマスク形式です（連続したビットである必要があります）')
  }

  return ones
}

/**
 * あらゆる形式のサブネットマスクを相互変換
 */
export function convertSubnetMask(input: string): SubnetMaskConversion {
  let cidr: number | null = null
  let dotted: string | null = null
  let wildcard: string | null = null
  let hex: string | null = null
  let binary: string | null = null
  let bits: number | null = null

  try {
    // CIDR形式（/24 または 24）
    if (input.match(/^\/?\d{1,2}$/)) {
      cidr = parseInt(input.replace('/', ''), 10)
      if (cidr < 0 || cidr > 32) {
        throw new Error('CIDRは0から32の範囲で指定してください')
      }
      dotted = cidrToSubnetMask(cidr)
    }
    // ドット表記（255.255.255.0）
    else if (input.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
      dotted = input
      cidr = subnetMaskToCIDR(dotted)
    }
    // 16進数（FFFFFF00 または 0xFFFFFF00）
    else if (input.match(/^(0x)?[0-9A-Fa-f]{8}$/)) {
      hex = input.replace(/^0x/i, '').toUpperCase()
      dotted = hexToSubnetMask(hex)
      cidr = subnetMaskToCIDR(dotted)
    }
    // ビット数形式（32個の0と1）
    else if (input.match(/^[01]{32}$/)) {
      const maskNum = parseInt(input, 2)
      dotted = numberToIp(maskNum)
      cidr = subnetMaskToCIDR(dotted)
    }
    else {
      throw new Error('認識できない形式です')
    }

    // すべての形式に変換
    if (dotted && cidr !== null) {
      wildcard = getWildcardMask(dotted)
      hex = subnetMaskToHex(dotted)
      binary = ipToBinary(dotted).replace(/\./g, '')
      bits = cidr
    }

    return { cidr, dotted, wildcard, hex, binary, bits }
  } catch (error) {
    throw error
  }
}

/**
 * IPアドレス計算機の型定義
 */
export interface IPCalculation {
  nextIP: string
  previousIP: string
  offsetResult: string | null
  distance: number | null
}

/**
 * 次のIPアドレスを取得
 */
export function getNextIP(ip: string): string {
  if (!isValidIP(ip)) {
    throw new Error('無効なIPアドレスです')
  }
  const ipNum = ipToNumber(ip)
  if (ipNum === 0xFFFFFFFF) {
    throw new Error('これ以上のIPアドレスは存在しません')
  }
  return numberToIp(ipNum + 1)
}

/**
 * 前のIPアドレスを取得
 */
export function getPreviousIP(ip: string): string {
  if (!isValidIP(ip)) {
    throw new Error('無効なIPアドレスです')
  }
  const ipNum = ipToNumber(ip)
  if (ipNum === 0) {
    throw new Error('これ以前のIPアドレスは存在しません')
  }
  return numberToIp(ipNum - 1)
}

/**
 * IPアドレスにオフセットを追加
 */
export function addOffsetToIP(ip: string, offset: number): string {
  if (!isValidIP(ip)) {
    throw new Error('無効なIPアドレスです')
  }
  const ipNum = ipToNumber(ip)
  const result = ipNum + offset

  if (result < 0 || result > 0xFFFFFFFF) {
    throw new Error('オフセット計算の結果が有効な範囲を超えています')
  }

  return numberToIp(result)
}

/**
 * 2つのIPアドレス間の距離を計算
 */
export function getIPDistance(ip1: string, ip2: string): number {
  if (!isValidIP(ip1) || !isValidIP(ip2)) {
    throw new Error('無効なIPアドレスです')
  }
  const num1 = ipToNumber(ip1)
  const num2 = ipToNumber(ip2)
  return Math.abs(num2 - num1)
}

/**
 * ネットワーク内のN番目のホストを取得
 */
export function getNthHostInNetwork(cidrNotation: string, n: number): string {
  const networkInfo = calculateNetworkInfo(cidrNotation)
  const networkNum = ipToNumber(networkInfo.networkAddress)
  const hostNum = networkNum + n

  const broadcastNum = ipToNumber(networkInfo.broadcastAddress)

  if (hostNum > broadcastNum) {
    throw new Error('指定されたホスト番号がネットワーク範囲を超えています')
  }

  return numberToIp(hostNum)
}

/**
 * IPアドレス計算を実行
 */
export function calculateIP(ip: string, offset?: number, secondIP?: string): IPCalculation {
  if (!isValidIP(ip)) {
    throw new Error('無効なIPアドレスです')
  }

  const nextIP = getNextIP(ip)
  const previousIP = getPreviousIP(ip)
  let offsetResult: string | null = null
  let distance: number | null = null

  if (offset !== undefined && offset !== null) {
    offsetResult = addOffsetToIP(ip, offset)
  }

  if (secondIP && isValidIP(secondIP)) {
    distance = getIPDistance(ip, secondIP)
  }

  return { nextIP, previousIP, offsetResult, distance }
}

/**
 * ネットワーク比較の結果
 */
export interface NetworkComparisonResult {
  hasOverlap: boolean
  isIdentical: boolean
  network1ContainsNetwork2: boolean
  network2ContainsNetwork1: boolean
  areAdjacent: boolean
  canBeMerged: boolean
  mergedNetwork: string | null
  overlapCIDR: string | null
}

/**
 * 2つのネットワークを比較
 */
export function compareNetworks(cidr1: string, cidr2: string): NetworkComparisonResult {
  if (!isValidCIDR(cidr1) || !isValidCIDR(cidr2)) {
    throw new Error('有効なCIDR表記を入力してください')
  }

  const info1 = calculateNetworkInfo(cidr1)
  const info2 = calculateNetworkInfo(cidr2)

  const net1Start = ipToNumber(info1.networkAddress)
  const net1End = ipToNumber(info1.broadcastAddress)
  const net2Start = ipToNumber(info2.networkAddress)
  const net2End = ipToNumber(info2.broadcastAddress)

  // 同一ネットワークかチェック
  const isIdentical = net1Start === net2Start && net1End === net2End

  // 重複チェック
  const hasOverlap = !(net1End < net2Start || net2End < net1Start)

  // 包含関係チェック
  const network1ContainsNetwork2 = net1Start <= net2Start && net1End >= net2End
  const network2ContainsNetwork1 = net2Start <= net1Start && net2End >= net1End

  // 隣接チェック
  const areAdjacent = (net1End + 1 === net2Start) || (net2End + 1 === net1Start)

  // 統合可能性チェック
  let canBeMerged = false
  let mergedNetwork: string | null = null

  if (areAdjacent && info1.cidr === info2.cidr) {
    // 同じサイズで隣接している場合、親ネットワークに統合できるかチェック
    const parentCidr = info1.cidr - 1
    if (parentCidr >= 0) {
      const parentMask = ipToNumber(cidrToSubnetMask(parentCidr))
      const parent1 = net1Start & parentMask
      const parent2 = net2Start & parentMask

      if (parent1 === parent2) {
        canBeMerged = true
        mergedNetwork = `${numberToIp(parent1)}/${parentCidr}`
      }
    }
  }

  // 重複部分のCIDR計算
  let overlapCIDR: string | null = null
  if (hasOverlap && !isIdentical) {
    const overlapStart = Math.max(net1Start, net2Start)
    const overlapEnd = Math.min(net1End, net2End)

    // 重複範囲をCIDRに変換（最適化のため、簡易版）
    const overlapSize = overlapEnd - overlapStart + 1
    const cidrBits = 32 - Math.floor(Math.log2(overlapSize))
    overlapCIDR = `${numberToIp(overlapStart)}/${cidrBits}`
  }

  return {
    hasOverlap,
    isIdentical,
    network1ContainsNetwork2,
    network2ContainsNetwork1,
    areAdjacent,
    canBeMerged,
    mergedNetwork,
    overlapCIDR
  }
}

/**
 * IPv6アドレスのインターフェース
 */
export interface IPv6Info {
  fullAddress: string
  compressedAddress: string
  expandedAddress: string
  prefix: number
  networkAddress: string
  interfaceID: string
  isLinkLocal: boolean
  isUniqueLocal: boolean
  isMulticast: boolean
  isLoopback: boolean
  scope: string
}

/**
 * IPv6アドレスを展開形式に変換
 */
export function expandIPv6(ipv6: string): string {
  // プレフィックスを分離
  const parts = ipv6.split('/')
  let addr = parts[0]
  const prefix = parts[1]

  // ::を展開
  if (addr.includes('::')) {
    const sides = addr.split('::')
    const leftGroups = sides[0] ? sides[0].split(':') : []
    const rightGroups = sides[1] ? sides[1].split(':') : []
    const missingGroups = 8 - leftGroups.length - rightGroups.length

    const middleGroups = Array(missingGroups).fill('0000')
    const allGroups = [...leftGroups, ...middleGroups, ...rightGroups]
    addr = allGroups.map(g => g.padStart(4, '0')).join(':')
  } else {
    // 各グループを4桁に展開
    addr = addr.split(':').map(g => g.padStart(4, '0')).join(':')
  }

  return prefix ? `${addr}/${prefix}` : addr
}

/**
 * IPv6アドレスを圧縮形式に変換
 */
export function compressIPv6(ipv6: string): string {
  // プレフィックスを分離
  const parts = ipv6.split('/')
  let addr = parts[0]
  const prefix = parts[1]

  // 展開形式に変換
  addr = expandIPv6(addr).split('/')[0]

  // 先頭の0を削除
  let groups = addr.split(':').map(g => g.replace(/^0+/, '') || '0')

  // 最長の連続する0のグループを見つけて::に置換
  let maxZeroStart = -1
  let maxZeroLen = 0
  let currentZeroStart = -1
  let currentZeroLen = 0

  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === '0') {
      if (currentZeroStart === -1) {
        currentZeroStart = i
        currentZeroLen = 1
      } else {
        currentZeroLen++
      }
    } else {
      if (currentZeroLen > maxZeroLen) {
        maxZeroStart = currentZeroStart
        maxZeroLen = currentZeroLen
      }
      currentZeroStart = -1
      currentZeroLen = 0
    }
  }

  if (currentZeroLen > maxZeroLen) {
    maxZeroStart = currentZeroStart
    maxZeroLen = currentZeroLen
  }

  // ::に置換（2つ以上の連続した0がある場合のみ）
  if (maxZeroLen > 1) {
    const before = groups.slice(0, maxZeroStart).join(':')
    const after = groups.slice(maxZeroStart + maxZeroLen).join(':')
    addr = before && after ? `${before}::${after}` :
           before ? `${before}::` :
           after ? `::${after}` : '::'
  } else {
    addr = groups.join(':')
  }

  return prefix ? `${addr}/${prefix}` : addr
}

/**
 * IPv6アドレスの情報を計算
 */
export function calculateIPv6Info(ipv6: string): IPv6Info {
  const parts = ipv6.split('/')
  const addr = parts[0]
  const prefix = parts[1] ? parseInt(parts[1], 10) : 128

  if (prefix < 0 || prefix > 128) {
    throw new Error('IPv6プレフィックスは0から128の範囲で指定してください')
  }

  const expanded = expandIPv6(addr).split('/')[0]
  const compressed = compressIPv6(addr).split('/')[0]

  // ネットワークアドレスを計算
  const groups = expanded.split(':').map(g => parseInt(g, 16))
  const prefixGroups = Math.floor(prefix / 16)
  const prefixBits = prefix % 16

  const networkGroups = groups.map((g, i) => {
    if (i < prefixGroups) return g
    if (i === prefixGroups) {
      const mask = (0xFFFF << (16 - prefixBits)) & 0xFFFF
      return g & mask
    }
    return 0
  })

  const networkAddress = networkGroups.map(g => g.toString(16)).join(':')

  // インターフェースIDを取得
  const interfaceGroups = groups.slice(4)
  const interfaceID = interfaceGroups.map(g => g.toString(16).padStart(4, '0')).join(':')

  // アドレスタイプの判定
  const firstGroup = groups[0]
  const isLinkLocal = firstGroup === 0xFE80
  const isUniqueLocal = (firstGroup & 0xFE00) === 0xFC00
  const isMulticast = (firstGroup & 0xFF00) === 0xFF00
  const isLoopback = expanded === '0000:0000:0000:0000:0000:0000:0000:0001'

  let scope = 'グローバル'
  if (isLoopback) scope = 'ループバック'
  else if (isLinkLocal) scope = 'リンクローカル'
  else if (isUniqueLocal) scope = 'ユニークローカル'
  else if (isMulticast) scope = 'マルチキャスト'

  return {
    fullAddress: `${expanded}/${prefix}`,
    compressedAddress: compressed,
    expandedAddress: expanded,
    prefix,
    networkAddress: compressIPv6(networkAddress),
    interfaceID,
    isLinkLocal,
    isUniqueLocal,
    isMulticast,
    isLoopback,
    scope
  }
}

/**
 * IPv4をIPv6にマッピング
 */
export function ipv4ToIPv6(ipv4: string): string {
  if (!isValidIP(ipv4)) {
    throw new Error('無効なIPv4アドレスです')
  }

  const parts = ipv4.split('.').map(Number)
  const hex1 = ((parts[0] << 8) + parts[1]).toString(16).padStart(4, '0')
  const hex2 = ((parts[2] << 8) + parts[3]).toString(16).padStart(4, '0')

  return `::ffff:${hex1}:${hex2}`
}

/**
 * バッチ処理の結果
 */
export interface BatchProcessResult {
  input: string
  success: boolean
  result: any
  error: string | null
}

/**
 * 複数のIPアドレスを一括で判定
 */
export function batchCheckIPs(ips: string[], network: string): BatchProcessResult[] {
  return ips.map(ip => {
    try {
      const inNetwork = isIpInNetwork(ip, network)
      const ipType = getIPType(ip, network)
      return {
        input: ip,
        success: true,
        result: { inNetwork, ipType },
        error: null
      }
    } catch (error) {
      return {
        input: ip,
        success: false,
        result: null,
        error: error instanceof Error ? error.message : '不明なエラー'
      }
    }
  })
}
