<script setup lang="ts">
import { ref } from 'vue'
import type { NetworkInfo } from '~/utils/network'
import {
  calculateNetworkInfo,
  getBinaryRepresentation,
  isValidCIDR
} from '~/utils/network'

const cidrInput = ref('192.168.0.0/24')
const networkInfo = ref<NetworkInfo | null>(null)
const networkError = ref('')
const binaryRep = ref<{ ip: string; mask: string } | null>(null)

const { addHistory } = useHistory()

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

    // 履歴に追加
    addHistory('network', cidrInput.value)
  } catch (error) {
    networkError.value = error instanceof Error ? error.message : '計算エラーが発生しました'
  }
}
</script>

<template>
  <div class="p-6">
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

    <!-- ネットワーク情報の表示 -->
    <div v-if="networkInfo" class="space-y-4">
      <NetworkInfoDisplay :network-info="networkInfo" />

      <!-- 2進数表示 -->
      <BinaryDisplay v-if="binaryRep" :binary-rep="binaryRep" />
    </div>
  </div>
</template>
