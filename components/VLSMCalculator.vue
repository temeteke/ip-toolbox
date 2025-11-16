<script setup lang="ts">
import { ref } from 'vue'
import { calculateVLSM, isValidCIDR, type VLSMRequirement, type VLSMResult } from '~/utils/network'

const baseNetwork = ref('192.168.1.0/24')
const requirements = ref<VLSMRequirement[]>([
  { name: 'オフィスA', hostsNeeded: 50 },
  { name: 'オフィスB', hostsNeeded: 20 },
  { name: 'DMZ', hostsNeeded: 10 }
])
const results = ref<VLSMResult[]>([])
const error = ref('')

const { copied, copyToClipboard } = useCopyToClipboard()

const addRequirement = () => {
  requirements.value.push({ name: `ネットワーク${requirements.value.length + 1}`, hostsNeeded: 10 })
}

const removeRequirement = (index: number) => {
  requirements.value.splice(index, 1)
}

const calculate = () => {
  error.value = ''
  results.value = []

  try {
    if (!isValidCIDR(baseNetwork.value)) {
      throw new Error('有効なCIDR表記を入力してください')
    }

    if (requirements.value.length === 0) {
      throw new Error('少なくとも1つの要件を追加してください')
    }

    results.value = calculateVLSM(baseNetwork.value, requirements.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '計算エラーが発生しました'
  }
}

const copyResults = () => {
  const text = results.value
    .map(r => `${r.name}: ${r.network} (ホスト: ${r.hostsAvailable})`)
    .join('\n')
  copyToClipboard(text)
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          元のネットワーク (CIDR表記)
        </label>
        <input
          v-model="baseNetwork"
          type="text"
          placeholder="例: 192.168.1.0/24"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            サブネット要件
          </label>
          <button
            @click="addRequirement"
            class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            + 追加
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="(req, index) in requirements"
            :key="index"
            class="flex gap-2"
          >
            <input
              v-model="req.name"
              type="text"
              placeholder="名前"
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            />
            <input
              v-model.number="req.hostsNeeded"
              type="number"
              min="1"
              placeholder="必要なホスト数"
              class="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            />
            <button
              @click="removeRequirement(index)"
              class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              削除
            </button>
          </div>
        </div>
      </div>

      <button
        @click="calculate"
        class="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        計算
      </button>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
      {{ error }}
    </div>

    <!-- 結果 -->
    <div v-if="results.length > 0" class="space-y-4">
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
            VLSM設計結果
          </h3>
          <button
            @click="copyResults"
            class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            :class="{ 'bg-green-600 hover:bg-green-700': copied }"
          >
            {{ copied ? 'コピー完了' : 'コピー' }}
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="(result, index) in results"
            :key="index"
            class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <h4 class="font-semibold text-gray-800 dark:text-gray-100">{{ result.name }}</h4>
                <div class="font-mono text-lg text-blue-600 dark:text-blue-400 font-bold">
                  {{ result.network }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-600 dark:text-gray-400">ホスト数</div>
                <div class="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {{ result.hostsAvailable }}
                  <span class="text-sm text-gray-500 dark:text-gray-400">(要求: {{ result.hostsNeeded }})</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-600 dark:text-gray-400">ネットワーク:</span>
                <span class="font-mono ml-2 dark:text-gray-200">{{ result.networkAddress }}</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">ブロードキャスト:</span>
                <span class="font-mono ml-2 dark:text-gray-200">{{ result.broadcastAddress }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-gray-600 dark:text-gray-400">ホスト範囲:</span>
                <span class="font-mono ml-2 dark:text-gray-200">{{ result.firstHost }} - {{ result.lastHost }}</span>
              </div>
            </div>

            <div
              v-if="result.hostsAvailable > result.hostsNeeded * 2"
              class="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-300"
            >
              ⚠️ 利用可能なホスト数が必要数の2倍以上です。より小さなサブネットの検討をお勧めします。
            </div>
          </div>
        </div>

        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-800 dark:text-blue-300">
          <p class="font-medium mb-1">💡 VLSM (可変長サブネットマスク)</p>
          <p>必要なホスト数に応じて最適なサブネットサイズを自動計算し、IPアドレスの無駄を最小限に抑えます。</p>
        </div>
      </div>
    </div>
  </div>
</template>
