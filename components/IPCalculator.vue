<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="ip-input" class="block text-sm font-medium mb-2">
          IPアドレス
        </label>
        <input
          id="ip-input"
          v-model="ip"
          type="text"
          placeholder="例: 192.168.1.100"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          @input="handleCalculate"
        />
      </div>

      <div>
        <label for="offset-input" class="block text-sm font-medium mb-2">
          オフセット（オプション）
        </label>
        <input
          id="offset-input"
          v-model.number="offset"
          type="number"
          placeholder="例: 10 または -5"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          @input="handleCalculate"
        />
      </div>

      <div class="md:col-span-2">
        <label for="second-ip-input" class="block text-sm font-medium mb-2">
          比較するIPアドレス（オプション）
        </label>
        <input
          id="second-ip-input"
          v-model="secondIP"
          type="text"
          placeholder="例: 192.168.1.200"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          @input="handleCalculate"
        />
      </div>
    </div>

    <div v-if="error" class="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>

    <div v-if="result" class="space-y-4">
      <h3 class="text-lg font-semibold">計算結果</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">次のIPアドレス</p>
              <p class="text-lg font-mono">{{ result.nextIP }}</p>
            </div>
            <button
              @click="copyToClipboard(result.nextIP)"
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
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">前のIPアドレス</p>
              <p class="text-lg font-mono">{{ result.previousIP }}</p>
            </div>
            <button
              @click="copyToClipboard(result.previousIP)"
              class="ml-2 p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              title="コピー"
            >
              📋
            </button>
          </div>
        </div>

        <div v-if="result.offsetResult" class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="text-sm text-blue-700 dark:text-blue-300 mb-1">
                オフセット計算結果 ({{ offset >= 0 ? '+' : '' }}{{ offset }})
              </p>
              <p class="text-lg font-mono text-blue-900 dark:text-blue-100">{{ result.offsetResult }}</p>
            </div>
            <button
              @click="copyToClipboard(result.offsetResult)"
              class="ml-2 p-2 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
              title="コピー"
            >
              📋
            </button>
          </div>
        </div>

        <div v-if="result.distance !== null" class="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
          <p class="text-sm text-green-700 dark:text-green-300 mb-1">IPアドレス間の距離</p>
          <p class="text-lg font-mono text-green-900 dark:text-green-100">{{ result.distance }} アドレス</p>
          <p class="text-xs text-green-600 dark:text-green-400 mt-1">
            {{ ip }} ⟷ {{ secondIP }}
          </p>
        </div>
      </div>

      <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">ネットワーク内のN番目のホスト</p>
        <div class="flex gap-2">
          <input
            v-model="networkForNth"
            type="text"
            placeholder="ネットワーク (例: 192.168.1.0/24)"
            class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          />
          <input
            v-model.number="nthHost"
            type="number"
            placeholder="N"
            class="w-24 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          />
          <button
            @click="calculateNthHost"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            計算
          </button>
        </div>
        <div v-if="nthHostResult" class="mt-3 p-3 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ nthHost }}番目のホスト:</p>
              <p class="text-lg font-mono">{{ nthHostResult }}</p>
            </div>
            <button
              @click="copyToClipboard(nthHostResult)"
              class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              title="コピー"
            >
              📋
            </button>
          </div>
        </div>
        <div v-if="nthHostError" class="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded">
          <p class="text-sm text-red-700 dark:text-red-400">{{ nthHostError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { calculateIP, getNthHostInNetwork, type IPCalculation } from '~/utils/network'

const ip = ref('')
const offset = ref<number | null>(null)
const secondIP = ref('')
const result = ref<IPCalculation | null>(null)
const error = ref('')

const networkForNth = ref('')
const nthHost = ref<number | null>(null)
const nthHostResult = ref('')
const nthHostError = ref('')

const { getQueryParam, updateQueryParams } = useUrlState()

const handleCalculate = () => {
  if (!ip.value.trim()) {
    result.value = null
    error.value = ''
    return
  }

  try {
    result.value = calculateIP(
      ip.value.trim(),
      offset.value !== null ? offset.value : undefined,
      secondIP.value.trim() || undefined
    )
    error.value = ''
  } catch (e) {
    result.value = null
    error.value = e instanceof Error ? e.message : '計算に失敗しました'
  }
}

const calculateNthHost = () => {
  nthHostResult.value = ''
  nthHostError.value = ''

  if (!networkForNth.value.trim() || nthHost.value === null) {
    nthHostError.value = 'ネットワークとホスト番号を入力してください'
    return
  }

  try {
    nthHostResult.value = getNthHostInNetwork(networkForNth.value.trim(), nthHost.value)
  } catch (e) {
    nthHostError.value = e instanceof Error ? e.message : '計算に失敗しました'
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
  const urlIp = getQueryParam('ip')
  const urlOffset = getQueryParam('offset')
  const urlSecondIP = getQueryParam('secondIP')

  if (urlIp) ip.value = urlIp
  if (urlOffset) offset.value = parseInt(urlOffset)
  if (urlSecondIP) secondIP.value = urlSecondIP

  if (urlIp) {
    handleCalculate()
  }
})

watch([ip, offset, secondIP], ([newIp, newOffset, newSecondIP]) => {
  updateQueryParams({
    ip: newIp || null,
    offset: newOffset !== null ? String(newOffset) : null,
    secondIP: newSecondIP || null
  })
})
</script>
