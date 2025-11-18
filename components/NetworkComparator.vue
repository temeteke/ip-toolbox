<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="network1-input" class="block text-sm font-medium mb-2">
          ネットワーク 1
        </label>
        <input
          id="network1-input"
          v-model="network1"
          type="text"
          placeholder="例: 192.168.1.0/24"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          @input="handleCompare"
        />
      </div>

      <div>
        <label for="network2-input" class="block text-sm font-medium mb-2">
          ネットワーク 2
        </label>
        <input
          id="network2-input"
          v-model="network2"
          type="text"
          placeholder="例: 192.168.2.0/24"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          @input="handleCompare"
        />
      </div>
    </div>

    <div v-if="error" class="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>

    <div v-if="result" class="space-y-4">
      <h3 class="text-lg font-semibold">比較結果</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded-lg border-2" :class="result.isIdentical ? 'bg-green-50 dark:bg-green-900/30 border-green-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'">
          <div class="flex items-center">
            <span class="text-2xl mr-3">{{ result.isIdentical ? '✅' : '❌' }}</span>
            <div>
              <p class="font-semibold">同一ネットワーク</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ result.isIdentical ? '2つのネットワークは完全に同一です' : '異なるネットワークです' }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-lg border-2" :class="result.hasOverlap ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'">
          <div class="flex items-center">
            <span class="text-2xl mr-3">{{ result.hasOverlap ? '⚠️' : '✅' }}</span>
            <div>
              <p class="font-semibold">重複チェック</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ result.hasOverlap ? 'ネットワークが重複しています' : '重複はありません' }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-lg border-2" :class="result.network1ContainsNetwork2 ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'">
          <div class="flex items-center">
            <span class="text-2xl mr-3">{{ result.network1ContainsNetwork2 ? '📦' : '❌' }}</span>
            <div>
              <p class="font-semibold">包含関係（1 ⊃ 2）</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ result.network1ContainsNetwork2 ? 'ネットワーク1がネットワーク2を包含' : 'ネットワーク1はネットワーク2を包含しない' }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-lg border-2" :class="result.network2ContainsNetwork1 ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'">
          <div class="flex items-center">
            <span class="text-2xl mr-3">{{ result.network2ContainsNetwork1 ? '📦' : '❌' }}</span>
            <div>
              <p class="font-semibold">包含関係（2 ⊃ 1）</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ result.network2ContainsNetwork1 ? 'ネットワーク2がネットワーク1を包含' : 'ネットワーク2はネットワーク1を包含しない' }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-lg border-2" :class="result.areAdjacent ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'">
          <div class="flex items-center">
            <span class="text-2xl mr-3">{{ result.areAdjacent ? '🔗' : '❌' }}</span>
            <div>
              <p class="font-semibold">隣接チェック</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ result.areAdjacent ? 'ネットワークは隣接しています' : 'ネットワークは隣接していません' }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-lg border-2" :class="result.canBeMerged ? 'bg-green-50 dark:bg-green-900/30 border-green-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'">
          <div class="flex items-center">
            <span class="text-2xl mr-3">{{ result.canBeMerged ? '🔀' : '❌' }}</span>
            <div>
              <p class="font-semibold">統合可能性</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ result.canBeMerged ? '統合できます' : '統合できません' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="result.mergedNetwork" class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border-2 border-green-500">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <p class="font-semibold text-green-900 dark:text-green-100 mb-2">統合後のネットワーク</p>
            <p class="text-2xl font-mono text-green-800 dark:text-green-200">{{ result.mergedNetwork }}</p>
            <p class="text-sm text-green-700 dark:text-green-300 mt-2">
              この2つのネットワークを1つのスーパーネットに統合できます
            </p>
          </div>
          <button
            @click="copyToClipboard(result.mergedNetwork)"
            class="ml-2 p-2 text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
            title="コピー"
          >
            📋
          </button>
        </div>
      </div>

      <div v-if="result.overlapCIDR && !result.isIdentical" class="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border-2 border-yellow-500">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <p class="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">重複範囲</p>
            <p class="text-xl font-mono text-yellow-800 dark:text-yellow-200">{{ result.overlapCIDR }}</p>
            <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
              2つのネットワークが重複している部分の概算範囲です
            </p>
          </div>
          <button
            @click="copyToClipboard(result.overlapCIDR)"
            class="ml-2 p-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-300"
            title="コピー"
          >
            📋
          </button>
        </div>
      </div>

      <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <p class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 分析サマリー</p>
        <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li v-if="result.isIdentical">• これらのネットワークは完全に同じです</li>
          <li v-else-if="result.network1ContainsNetwork2">• ネットワーク1はネットワーク2の親ネットワークです</li>
          <li v-else-if="result.network2ContainsNetwork1">• ネットワーク2はネットワーク1の親ネットワークです</li>
          <li v-else-if="result.hasOverlap">• ネットワークが部分的に重複しています（設定の見直しが必要な可能性があります）</li>
          <li v-else-if="result.areAdjacent && result.canBeMerged">• 隣接するネットワークで、スーパーネット化が可能です</li>
          <li v-else-if="result.areAdjacent">• ネットワークは隣接していますが、統合はできません</li>
          <li v-else>• これらのネットワークは完全に独立しています</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { compareNetworks, type NetworkComparisonResult } from '~/utils/network'

const network1 = ref('')
const network2 = ref('')
const result = ref<NetworkComparisonResult | null>(null)
const error = ref('')

const { getQueryParam, updateQueryParams } = useUrlState()

const handleCompare = () => {
  if (!network1.value.trim() || !network2.value.trim()) {
    result.value = null
    error.value = ''
    return
  }

  try {
    result.value = compareNetworks(network1.value.trim(), network2.value.trim())
    error.value = ''
  } catch (e) {
    result.value = null
    error.value = e instanceof Error ? e.message : '比較に失敗しました'
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('コピーしました: ' + text)
  }).catch(err => {
    console.error('コピーに失敗しました:', err)
  })
}

// URLパラメータとの同期
onMounted(() => {
  const urlNetwork1 = getQueryParam('network1')
  const urlNetwork2 = getQueryParam('network2')

  if (urlNetwork1) network1.value = urlNetwork1
  if (urlNetwork2) network2.value = urlNetwork2

  if (urlNetwork1 && urlNetwork2) {
    handleCompare()
  }
})

watch([network1, network2], ([newNet1, newNet2]) => {
  updateQueryParams({
    network1: newNet1 || null,
    network2: newNet2 || null
  })
})
</script>
