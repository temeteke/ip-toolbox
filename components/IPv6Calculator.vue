<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4">
      <div>
        <label for="ipv6-input" class="block text-sm font-medium mb-2">
          IPv6アドレスを入力
        </label>
        <input
          id="ipv6-input"
          v-model="input"
          type="text"
          placeholder="例: 2001:db8::1/64 または ::1"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          @input="handleCalculate"
        />
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          圧縮形式（::）と展開形式の両方に対応しています
        </p>
      </div>

      <div>
        <label for="ipv4-input" class="block text-sm font-medium mb-2">
          IPv4からIPv6へ変換
        </label>
        <div class="flex gap-2">
          <input
            id="ipv4-input"
            v-model="ipv4Input"
            type="text"
            placeholder="例: 192.0.2.1"
            class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            @click="handleIPv4ToIPv6"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            変換
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>

    <div v-if="ipv4Result" class="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border-2 border-green-500">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <p class="font-semibold text-green-900 dark:text-green-100 mb-2">IPv4-mapped IPv6アドレス</p>
          <p class="text-xl font-mono text-green-800 dark:text-green-200">{{ ipv4Result }}</p>
          <p class="text-sm text-green-700 dark:text-green-300 mt-2">
            IPv4アドレスをIPv6形式にマッピングしました
          </p>
        </div>
        <button
          @click="copyToClipboard(ipv4Result)"
          class="ml-2 p-2 text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
          title="コピー"
        >
          📋
        </button>
      </div>
    </div>

    <div v-if="result" class="space-y-4">
      <h3 class="text-lg font-semibold">IPv6アドレス情報</h3>

      <div class="grid grid-cols-1 gap-4">
        <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border-2 border-blue-500">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="text-sm text-blue-700 dark:text-blue-300 mb-1">圧縮形式</p>
              <p class="text-xl font-mono text-blue-900 dark:text-blue-100 break-all">{{ result.compressedAddress }}</p>
            </div>
            <button
              @click="copyToClipboard(result.compressedAddress)"
              class="ml-2 p-2 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
              title="コピー"
            >
              📋
            </button>
          </div>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">展開形式</p>
              <p class="text-lg font-mono break-all">{{ result.expandedAddress }}</p>
            </div>
            <button
              @click="copyToClipboard(result.expandedAddress)"
              class="ml-2 p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              title="コピー"
            >
              📋
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">プレフィックス長</p>
            <p class="text-lg font-mono">/{{ result.prefix }}</p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">スコープ</p>
            <p class="text-lg font-semibold">{{ result.scope }}</p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:col-span-2">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">ネットワークアドレス</p>
                <p class="text-lg font-mono break-all">{{ result.networkAddress }}</p>
              </div>
              <button
                @click="copyToClipboard(result.networkAddress)"
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
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">インターフェースID</p>
                <p class="text-lg font-mono break-all">{{ result.interfaceID }}</p>
              </div>
              <button
                @click="copyToClipboard(result.interfaceID)"
                class="ml-2 p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                title="コピー"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">アドレスタイプ</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-if="result.isLoopback"
              class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
            >
              ループバック
            </span>
            <span
              v-if="result.isLinkLocal"
              class="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm"
            >
              リンクローカル
            </span>
            <span
              v-if="result.isUniqueLocal"
              class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm"
            >
              ユニークローカル
            </span>
            <span
              v-if="result.isMulticast"
              class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm"
            >
              マルチキャスト
            </span>
            <span
              v-if="!result.isLoopback && !result.isLinkLocal && !result.isUniqueLocal && !result.isMulticast"
              class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm"
            >
              グローバルユニキャスト
            </span>
          </div>
        </div>

        <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 アドレス情報</p>
          <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li v-if="result.isLoopback">• ループバックアドレス（::1）- 自ホストを指します</li>
            <li v-if="result.isLinkLocal">• リンクローカルアドレス（fe80::/10）- 同一リンク内でのみ有効</li>
            <li v-if="result.isUniqueLocal">• ユニークローカルアドレス（fc00::/7）- プライベートネットワーク用</li>
            <li v-if="result.isMulticast">• マルチキャストアドレス（ff00::/8）- グループ通信用</li>
            <li v-if="!result.isLoopback && !result.isLinkLocal && !result.isUniqueLocal && !result.isMulticast">
              • グローバルユニキャストアドレス - インターネットで使用可能
            </li>
            <li>• プレフィックス長: /{{ result.prefix }} （ネットワーク部: {{ result.prefix }}ビット、ホスト部: {{ 128 - result.prefix }}ビット）</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { calculateIPv6Info, ipv4ToIPv6, type IPv6Info } from '~/utils/network'

const input = ref('')
const ipv4Input = ref('')
const result = ref<IPv6Info | null>(null)
const ipv4Result = ref('')
const error = ref('')

const handleCalculate = () => {
  if (!input.value.trim()) {
    result.value = null
    error.value = ''
    return
  }

  try {
    result.value = calculateIPv6Info(input.value.trim())
    error.value = ''
  } catch (e) {
    result.value = null
    error.value = e instanceof Error ? e.message : '計算に失敗しました'
  }
}

const handleIPv4ToIPv6 = () => {
  if (!ipv4Input.value.trim()) {
    ipv4Result.value = ''
    return
  }

  try {
    ipv4Result.value = ipv4ToIPv6(ipv4Input.value.trim())
    error.value = ''
  } catch (e) {
    ipv4Result.value = ''
    error.value = e instanceof Error ? e.message : '変換に失敗しました'
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('コピーしました: ' + text)
  }).catch(err => {
    console.error('コピーに失敗しました:', err)
  })
}
</script>
