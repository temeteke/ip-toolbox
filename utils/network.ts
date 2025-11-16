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
