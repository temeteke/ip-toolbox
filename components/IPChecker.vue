<script setup lang="ts">
import { ref } from 'vue'
import {
  isIpInNetwork,
  getIPType,
  isValidCIDR,
  isValidIP,
  IPType,
  classifyIPAddress,
  type IPClassification
} from '~/utils/network'

const checkIp = ref('192.168.0.10')
const checkCidr = ref('192.168.0.0/24')
const checkResult = ref<{
  belongs: boolean
  ipType: IPType | null
  classification: IPClassification | null
} | null>(null)
const checkError = ref('')

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
    const classification = classifyIPAddress(checkIp.value)

    checkResult.value = {
      belongs,
      ipType,
      classification
    }
  } catch (error) {
    checkError.value = error instanceof Error ? error.message : '判定エラーが発生しました'
  }
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          IPアドレス
        </label>
        <input
          v-model="checkIp"
          type="text"
          placeholder="例: 192.168.0.10"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          @keyup.enter="checkIpBelonging"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          CIDR表記
        </label>
        <input
          v-model="checkCidr"
          type="text"
          placeholder="例: 192.168.0.0/24"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
    <div v-if="checkError" class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
      {{ checkError }}
    </div>

    <!-- 判定結果 -->
    <IPCheckResult v-if="checkResult" :check-result="checkResult" />
  </div>
</template>
