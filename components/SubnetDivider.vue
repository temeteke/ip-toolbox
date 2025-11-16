<script setup lang="ts">
import { ref } from 'vue'
import { divideSubnetEqually, divideSubnetBySize, isValidCIDR, type SubnetInfo } from '~/utils/network'

const cidrInput = ref('192.168.0.0/24')
const divisionMethod = ref<'equal' | 'size'>('equal')
const divisionCount = ref(4)
const newCidr = ref(26)
const subnets = ref<SubnetInfo[]>([])
const error = ref('')

const { copied, copyToClipboard } = useCopyToClipboard()

const divideSubnet = () => {
  error.value = ''
  subnets.value = []

  try {
    if (!isValidCIDR(cidrInput.value)) {
      throw new Error('有効なCIDR表記を入力してください (例: 192.168.0.0/24)')
    }

    if (divisionMethod.value === 'equal') {
      subnets.value = divideSubnetEqually(cidrInput.value, divisionCount.value)
    } else {
      subnets.value = divideSubnetBySize(cidrInput.value, newCidr.value)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '分割エラーが発生しました'
  }
}

const copyAllSubnets = () => {
  const text = subnets.value.map(s => s.network).join('\n')
  copyToClipboard(text)
}

const exportCSV = () => {
  const headers = ['ネットワーク', 'ネットワークアドレス', 'ブロードキャスト', 'ホスト範囲', 'ホスト数']
  const rows = subnets.value.map(s => [
    s.network,
    s.networkAddress,
    s.broadcastAddress,
    `${s.firstHost} - ${s.lastHost}`,
    s.hostCount.toString()
  ])

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `subnets_${cidrInput.value.replace('/', '_')}.csv`
  link.click()
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
          v-model="cidrInput"
          type="text"
          placeholder="例: 192.168.0.0/24"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          分割方法
        </label>
        <div class="flex gap-4">
          <label class="flex items-center cursor-pointer">
            <input
              v-model="divisionMethod"
              type="radio"
              value="equal"
              class="mr-2"
            />
            <span class="text-gray-700 dark:text-gray-300">等分割</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input
              v-model="divisionMethod"
              type="radio"
              value="size"
              class="mr-2"
            />
            <span class="text-gray-700 dark:text-gray-300">サイズ指定</span>
          </label>
        </div>
      </div>

      <div v-if="divisionMethod === 'equal'">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          分割数
        </label>
        <input
          v-model.number="divisionCount"
          type="number"
          min="2"
          max="256"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div v-if="divisionMethod === 'size'">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          新しいCIDR値
        </label>
        <input
          v-model.number="newCidr"
          type="number"
          min="1"
          max="32"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <button
        @click="divideSubnet"
        class="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        分割
      </button>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
      {{ error }}
    </div>

    <!-- 結果 -->
    <div v-if="subnets.length > 0" class="space-y-4">
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
            分割結果 ({{ subnets.length }}個のサブネット)
          </h3>
          <div class="flex gap-2">
            <button
              @click="copyAllSubnets"
              class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              :class="{ 'bg-green-600 hover:bg-green-700': copied }"
            >
              {{ copied ? 'コピー完了' : '全てコピー' }}
            </button>
            <button
              @click="exportCSV"
              class="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              CSV出力
            </button>
          </div>
        </div>

        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="(subnet, index) in subnets"
            :key="index"
            class="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600"
          >
            <div class="font-mono font-semibold text-blue-600 dark:text-blue-400 mb-2">
              {{ subnet.network }}
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-600 dark:text-gray-400">ネットワーク:</span>
                <span class="font-mono ml-2 dark:text-gray-200">{{ subnet.networkAddress }}</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">ブロードキャスト:</span>
                <span class="font-mono ml-2 dark:text-gray-200">{{ subnet.broadcastAddress }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-gray-600 dark:text-gray-400">ホスト範囲:</span>
                <span class="font-mono ml-2 dark:text-gray-200">{{ subnet.firstHost }} - {{ subnet.lastHost }}</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">ホスト数:</span>
                <span class="font-mono ml-2 dark:text-gray-200">{{ subnet.hostCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
