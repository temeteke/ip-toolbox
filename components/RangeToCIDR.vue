<script setup lang="ts">
import { ref } from 'vue'
import { rangeToCIDR, isValidIP } from '~/utils/network'

const startIp = ref('192.168.0.0')
const endIp = ref('192.168.0.255')
const cidrs = ref<string[]>([])
const error = ref('')

const { copied, copyToClipboard } = useCopyToClipboard()

const convertRange = () => {
  error.value = ''
  cidrs.value = []

  try {
    if (!isValidIP(startIp.value)) {
      throw new Error('有効な開始IPアドレスを入力してください')
    }
    if (!isValidIP(endIp.value)) {
      throw new Error('有効な終了IPアドレスを入力してください')
    }

    cidrs.value = rangeToCIDR(startIp.value, endIp.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '変換エラーが発生しました'
  }
}

const copyAllCIDRs = () => {
  copyToClipboard(cidrs.value.join('\n'))
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          開始IPアドレス
        </label>
        <input
          v-model="startIp"
          type="text"
          placeholder="例: 192.168.0.0"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          @keyup.enter="convertRange"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          終了IPアドレス
        </label>
        <input
          v-model="endIp"
          type="text"
          placeholder="例: 192.168.0.255"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          @keyup.enter="convertRange"
        />
      </div>

      <button
        @click="convertRange"
        class="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        変換
      </button>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
      {{ error }}
    </div>

    <!-- 結果 -->
    <div v-if="cidrs.length > 0" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
          CIDRブロック ({{ cidrs.length }}個)
        </h3>
        <button
          @click="copyAllCIDRs"
          class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          :class="{ 'bg-green-600 hover:bg-green-700': copied }"
        >
          {{ copied ? 'コピー完了' : 'コピー' }}
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="(cidr, index) in cidrs"
          :key="index"
          class="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600"
        >
          <span class="font-mono font-medium text-blue-600 dark:text-blue-400">{{ cidr }}</span>
        </div>
      </div>

      <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-800 dark:text-blue-300">
        <p class="font-medium mb-1">💡 ヒント</p>
        <p>これらのCIDRブロックを組み合わせると、指定したIPアドレス範囲を完全にカバーできます。</p>
      </div>
    </div>
  </div>
</template>
