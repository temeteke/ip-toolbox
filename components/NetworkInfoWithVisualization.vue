<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { NetworkInfo } from '~/utils/network'
import {
  calculateNetworkInfo,
  getBinaryRepresentation,
  isValidCIDR,
  divideSubnetEqually,
  type SubnetInfo
} from '~/utils/network'

const cidrInput = ref('192.168.0.0/24')
const networkInfo = ref<NetworkInfo | null>(null)
const networkError = ref('')
const binaryRep = ref<{ ip: string; mask: string } | null>(null)
const subnets = ref<SubnetInfo[]>([])

const { addHistory } = useHistory()
const { getQueryParam, updateQueryParam } = useUrlState()

const totalAddresses = computed(() => {
  if (!networkInfo.value) return 0
  return Math.pow(2, 32 - networkInfo.value.cidr)
})

const calculateNetwork = () => {
  networkError.value = ''
  networkInfo.value = null
  binaryRep.value = null
  subnets.value = []

  try {
    if (!isValidCIDR(cidrInput.value)) {
      throw new Error('有効なCIDR表記を入力してください (例: 192.168.0.0/24)')
    }

    networkInfo.value = calculateNetworkInfo(cidrInput.value)
    binaryRep.value = getBinaryRepresentation(cidrInput.value)

    // 履歴に追加
    addHistory('network', cidrInput.value)
  } catch (error) {
    networkError.value = error instanceof Error ? error.message : '計算エラーが発生しました'
  }
}

const visualizeSubdivision = (divisions: number) => {
  if (!cidrInput.value.trim()) return

  try {
    subnets.value = divideSubnetEqually(cidrInput.value.trim(), divisions)
    networkError.value = ''
  } catch (e) {
    networkError.value = e instanceof Error ? e.message : '分割に失敗しました'
  }
}

const formatBinary = (binary: string): string => {
  return binary
    .split('.')
    .map((octet) => octet.split('').join(' '))
    .join('  .  ')
}

// URLパラメータとの同期
onMounted(() => {
  const urlCidr = getQueryParam('cidr')
  if (urlCidr) {
    cidrInput.value = urlCidr
    calculateNetwork()
  }
})

// 入力値の変更をURLに反映
watch(cidrInput, (newValue) => {
  updateQueryParam('cidr', newValue || null)
})
</script>

<template>
  <div class="p-6">
    <!-- 入力エリア -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        CIDR表記を入力
      </label>
      <div class="flex gap-2">
        <input
          v-model="cidrInput"
          type="text"
          placeholder="例: 192.168.0.0/24"
          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
    <div v-if="networkError" class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
      {{ networkError }}
    </div>

    <!-- 結果表示 -->
    <div v-if="networkInfo" class="space-y-6">
      <!-- 詳細情報 -->
      <div class="space-y-4">
        <NetworkInfoDisplay :network-info="networkInfo" />
        <BinaryDisplay v-if="binaryRep" :binary-rep="binaryRep" />
      </div>

      <!-- 可視化 -->
      <div class="space-y-6">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">ネットワーク可視化</h3>

        <!-- アドレス範囲の視覚的表現 -->
        <div class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border-2 border-blue-500">
          <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-4">アドレス範囲</h4>
          <div class="space-y-3">
            <div class="flex items-center">
              <div class="w-32 text-sm text-gray-600 dark:text-gray-400">ネットワーク:</div>
              <div class="flex-1 flex items-center">
                <div class="px-3 py-2 bg-red-500 text-white rounded font-mono text-sm">
                  {{ networkInfo.networkAddress }}
                </div>
                <div class="ml-2 text-xs text-red-600 dark:text-red-400">ネットワークアドレス</div>
              </div>
            </div>

            <div class="flex items-center">
              <div class="w-32 text-sm text-gray-600 dark:text-gray-400">ホスト範囲:</div>
              <div class="flex-1">
                <div class="h-8 bg-gradient-to-r from-green-400 to-green-600 rounded flex items-center px-3 text-white font-mono text-sm">
                  <span>{{ networkInfo.firstHost }}</span>
                  <span class="mx-2">～</span>
                  <span>{{ networkInfo.lastHost }}</span>
                </div>
                <div class="text-xs text-green-600 dark:text-green-400 mt-1">
                  利用可能なホスト: {{ networkInfo.hostCount.toLocaleString() }} 個
                </div>
              </div>
            </div>

            <div class="flex items-center">
              <div class="w-32 text-sm text-gray-600 dark:text-gray-400">ブロードキャスト:</div>
              <div class="flex-1 flex items-center">
                <div class="px-3 py-2 bg-purple-500 text-white rounded font-mono text-sm">
                  {{ networkInfo.broadcastAddress }}
                </div>
                <div class="ml-2 text-xs text-purple-600 dark:text-purple-400">ブロードキャストアドレス</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ビット表現 -->
        <div v-if="binaryRep" class="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">ビット表現</h4>
          <div class="space-y-3 font-mono text-xs">
            <div>
              <div class="text-gray-600 dark:text-gray-400 mb-1">IPアドレス:</div>
              <div class="p-2 bg-white dark:bg-gray-800 rounded border dark:border-gray-600 overflow-x-auto">
                {{ formatBinary(binaryRep.ip) }}
              </div>
            </div>
            <div>
              <div class="text-gray-600 dark:text-gray-400 mb-1">サブネットマスク:</div>
              <div class="p-2 bg-white dark:bg-gray-800 rounded border dark:border-gray-600 overflow-x-auto">
                {{ formatBinary(binaryRep.mask) }}
              </div>
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              <span class="text-blue-600 dark:text-blue-400">1</span> = ネットワーク部（{{ networkInfo.cidr }}ビット）、
              <span class="text-green-600 dark:text-green-400">0</span> = ホスト部（{{ 32 - networkInfo.cidr }}ビット）
            </div>
          </div>
        </div>

        <!-- サブネット分割の視覚化 -->
        <div class="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">サブネット分割シミュレーション</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <button
              v-for="division in [2, 4, 8, 16]"
              :key="division"
              @click="visualizeSubdivision(division)"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
            >
              {{ division }}分割
            </button>
          </div>

          <div v-if="subnets.length > 0" class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="(subnet, index) in subnets"
              :key="index"
              class="p-3 bg-white dark:bg-gray-800 rounded border dark:border-gray-600 flex items-center justify-between"
            >
              <div>
                <span class="font-mono text-sm font-semibold">{{ subnet.network }}</span>
                <span class="ml-2 text-xs text-gray-600 dark:text-gray-400">
                  ({{ subnet.hostCount.toLocaleString() }} ホスト)
                </span>
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400">
                {{ subnet.firstHost }} ～ {{ subnet.lastHost }}
              </div>
            </div>
          </div>
        </div>

        <!-- アドレス空間の利用状況 -->
        <div class="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">アドレス空間の利用状況</h4>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span>総アドレス数</span>
                <span class="font-mono">{{ totalAddresses.toLocaleString() }}</span>
              </div>
              <div class="h-8 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden flex">
                <div
                  class="bg-red-500 flex items-center justify-center text-white text-xs"
                  :style="{ width: `${(1 / totalAddresses) * 100}%` }"
                  title="ネットワークアドレス"
                >
                  <span v-if="totalAddresses <= 256">N</span>
                </div>
                <div
                  class="bg-green-500 flex items-center justify-center text-white text-xs"
                  :style="{ width: `${(networkInfo.hostCount / totalAddresses) * 100}%` }"
                  title="利用可能なホストアドレス"
                >
                  <span v-if="totalAddresses <= 256">ホスト ({{ networkInfo.hostCount }})</span>
                </div>
                <div
                  class="bg-purple-500 flex items-center justify-center text-white text-xs"
                  :style="{ width: `${(1 / totalAddresses) * 100}%` }"
                  title="ブロードキャストアドレス"
                >
                  <span v-if="totalAddresses <= 256">B</span>
                </div>
              </div>
              <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                <span>🔴 ネットワーク: 1</span>
                <span>🟢 ホスト: {{ networkInfo.hostCount.toLocaleString() }}</span>
                <span>🟣 ブロードキャスト: 1</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="p-3 bg-white dark:bg-gray-800 rounded">
                <div class="text-xs text-gray-600 dark:text-gray-400">利用効率</div>
                <div class="text-2xl font-bold text-green-600">
                  {{ ((networkInfo.hostCount / totalAddresses) * 100).toFixed(1) }}%
                </div>
              </div>
              <div class="p-3 bg-white dark:bg-gray-800 rounded">
                <div class="text-xs text-gray-600 dark:text-gray-400">CIDR / プレフィックス長</div>
                <div class="text-2xl font-bold text-blue-600">
                  /{{ networkInfo.cidr }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
