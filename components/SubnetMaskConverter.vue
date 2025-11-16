<template>
  <div class="space-y-6">
    <div>
      <label for="mask-input" class="block text-sm font-medium mb-2">
        サブネットマスクを入力
      </label>
      <input
        id="mask-input"
        v-model="input"
        type="text"
        placeholder="例: 24, /24, 255.255.255.0, FFFFFF00, 11111111111111111111111100000000"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        @input="handleConvert"
      />
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        対応形式: CIDR (24), ドット表記 (255.255.255.0), 16進数 (FFFFFF00), 2進数 (32桁)
      </p>
    </div>

    <div v-if="error" class="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>

    <div v-if="result" class="space-y-4">
      <h3 class="text-lg font-semibold">変換結果</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">CIDR表記</p>
              <p class="text-lg font-mono">{{ result.cidr !== null ? `/${result.cidr}` : 'N/A' }}</p>
            </div>
            <button
              v-if="result.cidr !== null"
              @click="copyToClipboard(`/${result.cidr}`)"
              class="ml-2 p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              title="コピー"
            >
              📋
            </button>
          </div>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">ドット表記</p>
              <p class="text-lg font-mono">{{ result.dotted || 'N/A' }}</p>
            </div>
            <button
              v-if="result.dotted"
              @click="copyToClipboard(result.dotted)"
              class="ml-2 p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              title="コピー"
            >
              📋
            </button>
          </div>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">ワイルドカードマスク</p>
              <p class="text-lg font-mono">{{ result.wildcard || 'N/A' }}</p>
            </div>
            <button
              v-if="result.wildcard"
              @click="copyToClipboard(result.wildcard)"
              class="ml-2 p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              title="コピー"
            >
              📋
            </button>
          </div>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">16進数表記</p>
              <p class="text-lg font-mono">{{ result.hex ? `0x${result.hex}` : 'N/A' }}</p>
            </div>
            <button
              v-if="result.hex"
              @click="copyToClipboard(`0x${result.hex}`)"
              class="ml-2 p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              title="コピー"
            >
              📋
            </button>
          </div>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:col-span-2">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">2進数表記</p>
              <p class="text-sm font-mono break-all">{{ formatBinary(result.binary) }}</p>
            </div>
            <button
              v-if="result.binary"
              @click="copyToClipboard(result.binary)"
              class="ml-2 p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              title="コピー"
            >
              📋
            </button>
          </div>
        </div>

        <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg md:col-span-2">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">ビット数</p>
          <p class="text-lg font-mono">{{ result.bits !== null ? `${result.bits} ビット` : 'N/A' }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
            利用可能なホスト数: {{ result.bits !== null ? Math.pow(2, 32 - result.bits) - 2 : 'N/A' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { convertSubnetMask, type SubnetMaskConversion } from '~/utils/network'

const input = ref('')
const result = ref<SubnetMaskConversion | null>(null)
const error = ref('')

const handleConvert = () => {
  if (!input.value.trim()) {
    result.value = null
    error.value = ''
    return
  }

  try {
    result.value = convertSubnetMask(input.value.trim())
    error.value = ''
  } catch (e) {
    result.value = null
    error.value = e instanceof Error ? e.message : '変換に失敗しました'
  }
}

const formatBinary = (binary: string | null): string => {
  if (!binary) return 'N/A'
  // 8ビットごとにドットで区切る
  return binary.match(/.{1,8}/g)?.join('.') || binary
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    // コピー成功の通知（オプション）
    alert('コピーしました: ' + text)
  }).catch(err => {
    console.error('コピーに失敗しました:', err)
  })
}
</script>
