<template>
  <div class="space-y-6">
    <div>
      <label for="network-input" class="block text-sm font-medium mb-2">
        ネットワーク（CIDR表記）
      </label>
      <input
        id="network-input"
        v-model="network"
        type="text"
        placeholder="例: 192.168.1.0/24"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
    </div>

    <div>
      <label for="ip-list-input" class="block text-sm font-medium mb-2">
        IPアドレスリスト（1行に1つ）
      </label>
      <textarea
        id="ip-list-input"
        v-model="ipList"
        rows="6"
        placeholder="例:&#10;192.168.1.1&#10;192.168.1.10&#10;192.168.2.1&#10;10.0.0.1"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
      ></textarea>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        または、CSVファイルをインポート:
      </p>
      <input
        type="file"
        accept=".csv,.txt"
        @change="handleFileUpload"
        class="mt-2 text-sm"
      />
    </div>

    <div class="flex gap-2">
      <button
        @click="processBatch"
        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        一括処理
      </button>
      <button
        v-if="results.length > 0"
        @click="exportToCSV"
        class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        CSVエクスポート
      </button>
      <button
        v-if="results.length > 0"
        @click="clearResults"
        class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        クリア
      </button>
    </div>

    <div v-if="error" class="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>

    <div v-if="results.length > 0" class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">処理結果</h3>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <span class="text-green-600 dark:text-green-400">成功: {{ successCount }}</span> /
          <span class="text-red-600 dark:text-red-400">失敗: {{ failureCount }}</span> /
          <span>合計: {{ results.length }}</span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-700">
              <th class="px-4 py-2 text-left border dark:border-gray-600">IPアドレス</th>
              <th class="px-4 py-2 text-left border dark:border-gray-600">状態</th>
              <th class="px-4 py-2 text-left border dark:border-gray-600">ネットワーク内</th>
              <th class="px-4 py-2 text-left border dark:border-gray-600">IPタイプ</th>
              <th class="px-4 py-2 text-left border dark:border-gray-600">エラー</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(result, index) in results"
              :key="index"
              :class="result.success ? 'bg-white dark:bg-gray-800' : 'bg-red-50 dark:bg-red-900/20'"
            >
              <td class="px-4 py-2 border dark:border-gray-600 font-mono">{{ result.input }}</td>
              <td class="px-4 py-2 border dark:border-gray-600">
                <span
                  :class="result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                >
                  {{ result.success ? '✅ 成功' : '❌ 失敗' }}
                </span>
              </td>
              <td class="px-4 py-2 border dark:border-gray-600">
                <span v-if="result.success">
                  {{ result.result.inNetwork ? '✅ はい' : '❌ いいえ' }}
                </span>
                <span v-else>-</span>
              </td>
              <td class="px-4 py-2 border dark:border-gray-600">
                <span v-if="result.success">
                  {{ result.result.ipType }}
                </span>
                <span v-else>-</span>
              </td>
              <td class="px-4 py-2 border dark:border-gray-600 text-sm text-red-600 dark:text-red-400">
                {{ result.error || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
          <p class="text-sm text-green-700 dark:text-green-300 mb-1">ネットワーク内のIP</p>
          <p class="text-2xl font-bold text-green-800 dark:text-green-200">
            {{ results.filter(r => r.success && r.result.inNetwork).length }}
          </p>
        </div>

        <div class="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p class="text-sm text-yellow-700 dark:text-yellow-300 mb-1">ネットワーク外のIP</p>
          <p class="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
            {{ results.filter(r => r.success && !r.result.inNetwork).length }}
          </p>
        </div>

        <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p class="text-sm text-blue-700 dark:text-blue-300 mb-1">ホストアドレス</p>
          <p class="text-2xl font-bold text-blue-800 dark:text-blue-200">
            {{ results.filter(r => r.success && r.result.ipType === 'ホスト').length }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { batchCheckIPs, type BatchProcessResult } from '~/utils/network'

const network = ref('')
const ipList = ref('')
const results = ref<BatchProcessResult[]>([])
const error = ref('')

const successCount = computed(() => results.value.filter(r => r.success).length)
const failureCount = computed(() => results.value.filter(r => !r.success).length)

const processBatch = () => {
  error.value = ''
  results.value = []

  if (!network.value.trim()) {
    error.value = 'ネットワークを入力してください'
    return
  }

  if (!ipList.value.trim()) {
    error.value = 'IPアドレスリストを入力してください'
    return
  }

  const ips = ipList.value
    .split('\n')
    .map(ip => ip.trim())
    .filter(ip => ip.length > 0)

  if (ips.length === 0) {
    error.value = '有効なIPアドレスが見つかりません'
    return
  }

  try {
    results.value = batchCheckIPs(ips, network.value.trim())
  } catch (e) {
    error.value = e instanceof Error ? e.message : '処理に失敗しました'
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string

    // CSVの場合、カンマ区切りと改行の両方をサポート
    const ips = content
      .split(/[\n,]/)
      .map(ip => ip.trim())
      .filter(ip => ip.length > 0 && ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/))

    ipList.value = ips.join('\n')
  }

  reader.readAsText(file)
}

const exportToCSV = () => {
  const headers = ['IPアドレス', '状態', 'ネットワーク内', 'IPタイプ', 'エラー']
  const rows = results.value.map(result => [
    result.input,
    result.success ? '成功' : '失敗',
    result.success ? (result.result.inNetwork ? 'はい' : 'いいえ') : '-',
    result.success ? result.result.ipType : '-',
    result.error || '-'
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `batch_results_${new Date().getTime()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const clearResults = () => {
  results.value = []
  error.value = ''
}
</script>
