<script setup lang="ts">
import type { NetworkInfo } from '~/utils/network'

const props = defineProps<{
  networkInfo: NetworkInfo
}>()

const { copied, copyToClipboard } = useCopyToClipboard()

const copyAllInfo = () => {
  const info = `ネットワークアドレス: ${props.networkInfo.networkAddress}
ブロードキャストアドレス: ${props.networkInfo.broadcastAddress}
ホスト範囲: ${props.networkInfo.firstHost} - ${props.networkInfo.lastHost}
ホスト数: ${props.networkInfo.hostCount}
サブネットマスク: ${props.networkInfo.subnetMask}
ワイルドカードマスク: ${props.networkInfo.wildcardMask}`

  copyToClipboard(info)
}
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">ネットワーク情報</h3>
      <button
        @click="copyAllInfo"
        class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
        :class="{ 'bg-green-600 hover:bg-green-700': copied }"
      >
        <svg
          v-if="!copied"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        {{ copied ? 'コピー完了' : 'コピー' }}
      </button>
    </div>
    <div class="grid gap-3">
      <div class="flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">ネットワークアドレス:</span>
        <span class="font-mono font-medium dark:text-gray-200">{{ networkInfo.networkAddress }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">ブロードキャストアドレス:</span>
        <span class="font-mono font-medium dark:text-gray-200">{{ networkInfo.broadcastAddress }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">ホスト範囲:</span>
        <span class="font-mono font-medium dark:text-gray-200">{{ networkInfo.firstHost }} - {{ networkInfo.lastHost }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">ホスト数:</span>
        <span class="font-mono font-medium dark:text-gray-200">{{ networkInfo.hostCount }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">サブネットマスク:</span>
        <span class="font-mono font-medium dark:text-gray-200">{{ networkInfo.subnetMask }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">ワイルドカードマスク:</span>
        <span class="font-mono font-medium dark:text-gray-200">{{ networkInfo.wildcardMask }}</span>
      </div>
    </div>
  </div>
</template>
