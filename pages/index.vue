<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NetworkInfo } from '~/utils/network'
import {
  calculateNetworkInfo,
  getBinaryRepresentation,
  isIpInNetwork,
  getIPType,
  isValidCIDR,
  isValidIP,
  IPType
} from '~/utils/network'

// アクティブなタブ
const activeTab = ref<'network' | 'checker'>('network')

// ネットワーク情報計算用
const cidrInput = ref('192.168.0.0/24')
const networkInfo = ref<NetworkInfo | null>(null)
const networkError = ref('')
const binaryRep = ref<{ ip: string; mask: string } | null>(null)

// IP判定用
const checkIp = ref('192.168.0.10')
const checkCidr = ref('192.168.0.0/24')
const checkResult = ref<{
  belongs: boolean
  ipType: IPType | null
} | null>(null)
const checkError = ref('')

// ネットワーク情報を計算
const calculateNetwork = () => {
  networkError.value = ''
  networkInfo.value = null
  binaryRep.value = null

  try {
    if (!isValidCIDR(cidrInput.value)) {
      throw new Error('有効なCIDR表記を入力してください (例: 192.168.0.0/24)')
    }

    networkInfo.value = calculateNetworkInfo(cidrInput.value)
    binaryRep.value = getBinaryRepresentation(cidrInput.value)
  } catch (error) {
    networkError.value = error instanceof Error ? error.message : '計算エラーが発生しました'
  }
}

// IP判定を実行
const checkIpBelonging = () => {
  checkError.value = ''
  checkResult.value = null

  try {
    if (!isValidIP(checkIp.value)) {
      throw new Error('有効なIPアドレスを入力してください')
    }
    if (!isValidCIDR(checkCidr.value)) {
      throw new Error('有効なCIDR表記を入力してください')
    }

    const belongs = isIpInNetwork(checkIp.value, checkCidr.value)
    const ipType = belongs ? getIPType(checkIp.value, checkCidr.value) : null

    checkResult.value = {
      belongs,
      ipType
    }
  } catch (error) {
    checkError.value = error instanceof Error ? error.message : '判定エラーが発生しました'
  }
}

// ページタイトル
useHead({
  title: 'IP Toolbox - Network Calculator'
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- ヘッダー -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          IP Toolbox
        </h1>
        <p class="text-gray-600">
          ネットワーク計算ツール - CIDR計算とIPアドレス分析
        </p>
      </header>

      <!-- タブナビゲーション -->
      <div class="bg-white rounded-lg shadow-md mb-6">
        <div class="flex border-b">
          <button
            @click="activeTab = 'network'"
            :class="[
              'flex-1 py-4 px-6 text-center font-medium transition-colors',
              activeTab === 'network'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            ]"
          >
            ネットワーク情報
          </button>
          <button
            @click="activeTab = 'checker'"
            :class="[
              'flex-1 py-4 px-6 text-center font-medium transition-colors',
              activeTab === 'checker'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            ]"
          >
            IP判定
          </button>
        </div>

        <!-- ネットワーク情報タブ -->
        <div v-show="activeTab === 'network'" class="p-6">
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              CIDR表記を入力
            </label>
            <div class="flex gap-2">
              <input
                v-model="cidrInput"
                type="text"
                placeholder="例: 192.168.0.0/24"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @keyup.enter="calculateNetwork"
              />
              <button
                @click="calculateNetwork"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                計算
              </button>
            </div>
          </div>

          <!-- エラーメッセージ -->
          <div v-if="networkError" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {{ networkError }}
          </div>

          <!-- ネットワーク情報の表示 -->
          <div v-if="networkInfo" class="space-y-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">ネットワーク情報</h3>
              <div class="grid gap-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">ネットワークアドレス:</span>
                  <span class="font-mono font-medium">{{ networkInfo.networkAddress }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">ブロードキャストアドレス:</span>
                  <span class="font-mono font-medium">{{ networkInfo.broadcastAddress }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">ホスト範囲:</span>
                  <span class="font-mono font-medium">{{ networkInfo.firstHost }} - {{ networkInfo.lastHost }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">ホスト数:</span>
                  <span class="font-mono font-medium">{{ networkInfo.hostCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">サブネットマスク:</span>
                  <span class="font-mono font-medium">{{ networkInfo.subnetMask }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">ワイルドカードマスク:</span>
                  <span class="font-mono font-medium">{{ networkInfo.wildcardMask }}</span>
                </div>
              </div>
            </div>

            <!-- 2進数表示 -->
            <div v-if="binaryRep" class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">2進数表示</h3>
              <div class="grid gap-3">
                <div>
                  <div class="text-gray-600 mb-1">IPアドレス:</div>
                  <div class="font-mono text-sm bg-white p-2 rounded border border-gray-200 break-all">
                    {{ binaryRep.ip }}
                  </div>
                </div>
                <div>
                  <div class="text-gray-600 mb-1">サブネットマスク:</div>
                  <div class="font-mono text-sm bg-white p-2 rounded border border-gray-200 break-all">
                    {{ binaryRep.mask }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- IP判定タブ -->
        <div v-show="activeTab === 'checker'" class="p-6">
          <div class="mb-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                IPアドレス
              </label>
              <input
                v-model="checkIp"
                type="text"
                placeholder="例: 192.168.0.10"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @keyup.enter="checkIpBelonging"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                CIDR表記
              </label>
              <input
                v-model="checkCidr"
                type="text"
                placeholder="例: 192.168.0.0/24"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @keyup.enter="checkIpBelonging"
              />
            </div>
            <button
              @click="checkIpBelonging"
              class="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              判定
            </button>
          </div>

          <!-- エラーメッセージ -->
          <div v-if="checkError" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {{ checkError }}
          </div>

          <!-- 判定結果 -->
          <div v-if="checkResult" class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">判定結果</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-gray-600">ネットワーク所属:</span>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    checkResult.belongs
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ checkResult.belongs ? '属する' : '属さない' }}
                </span>
              </div>
              <div v-if="checkResult.belongs && checkResult.ipType" class="flex items-center gap-2">
                <span class="text-gray-600">IPの種類:</span>
                <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {{ checkResult.ipType }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- フッター -->
      <footer class="text-center text-gray-600 text-sm mt-8">
        <p>PWA対応 - オフラインでも利用可能</p>
      </footer>
    </div>
  </div>
</template>
