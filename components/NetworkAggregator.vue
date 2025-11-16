<script setup lang="ts">
import { ref } from 'vue'
import { aggregateCIDRs } from '~/utils/network'

const cidrsInput = ref('192.168.0.0/24\n192.168.1.0/24')
const originalCidrs = ref<string[]>([])
const aggregatedCidrs = ref<string[]>([])
const error = ref('')

const { copied, copyToClipboard } = useCopyToClipboard()

const aggregate = () => {
  error.value = ''
  originalCidrs.value = []
  aggregatedCidrs.value = []

  try {
    const cidrs = cidrsInput.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    if (cidrs.length === 0) {
      throw new Error('少なくとも1つのCIDRを入力してください')
    }

    originalCidrs.value = cidrs
    aggregatedCidrs.value = aggregateCIDRs(cidrs)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '集約エラーが発生しました'
  }
}

const copyAggregated = () => {
  copyToClipboard(aggregatedCidrs.value.join('\n'))
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          CIDRブロック（1行に1つ）
        </label>
        <textarea
          v-model="cidrsInput"
          rows="8"
          placeholder="例:&#10;192.168.0.0/24&#10;192.168.1.0/24&#10;192.168.2.0/24&#10;192.168.3.0/24"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <button
        @click="aggregate"
        class="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        集約
      </button>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
      {{ error }}
    </div>

    <!-- 結果 -->
    <div v-if="aggregatedCidrs.length > 0" class="space-y-4">
      <!-- 元のCIDR -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          元のCIDRブロック ({{ originalCidrs.length }}個)
        </h3>
        <div class="space-y-1">
          <div
            v-for="(cidr, index) in originalCidrs"
            :key="index"
            class="font-mono text-sm text-gray-600 dark:text-gray-400"
          >
            {{ cidr }}
          </div>
        </div>
      </div>

      <!-- 集約後のCIDR -->
      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
            集約後のCIDRブロック ({{ aggregatedCidrs.length }}個)
          </h3>
          <button
            @click="copyAggregated"
            class="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            :class="{ 'bg-green-700': copied }"
          >
            {{ copied ? 'コピー完了' : 'コピー' }}
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="(cidr, index) in aggregatedCidrs"
            :key="index"
            class="bg-white dark:bg-gray-800 rounded p-3 border border-green-300 dark:border-green-700"
          >
            <span class="font-mono font-medium text-green-700 dark:text-green-400">{{ cidr }}</span>
          </div>
        </div>

        <div class="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📊</span>
            <div class="text-sm">
              <div class="font-medium text-gray-800 dark:text-gray-100">
                削減率: {{ Math.round((1 - aggregatedCidrs.length / originalCidrs.length) * 100) }}%
              </div>
              <div class="text-gray-600 dark:text-gray-400">
                {{ originalCidrs.length }} → {{ aggregatedCidrs.length }} ({{ originalCidrs.length - aggregatedCidrs.length }}個削減)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-800 dark:text-blue-300">
        <p class="font-medium mb-1">💡 ヒント</p>
        <p>ネットワーク集約はルーティングテーブルのエントリ数を減らし、ルーターのパフォーマンス向上に役立ちます。</p>
      </div>
    </div>
  </div>
</template>
