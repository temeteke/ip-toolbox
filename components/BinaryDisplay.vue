<script setup lang="ts">
import type { BinaryRepresentation } from '~/utils/network'

const props = defineProps<{
  binaryRep: BinaryRepresentation
}>()

const { copied, copyToClipboard } = useCopyToClipboard()

const copyBinaryInfo = () => {
  const info = `IPアドレス: ${props.binaryRep.ip}
サブネットマスク: ${props.binaryRep.mask}`

  copyToClipboard(info)
}
</script>

<template>
  <div class="bg-gray-50 rounded-lg p-4">
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-lg font-semibold text-gray-800">2進数表示</h3>
      <button
        @click="copyBinaryInfo"
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
</template>
