<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  divideSubnetEqually,
  divideSubnetBySize,
  calculateVLSM,
  isValidCIDR,
  type SubnetInfo,
  type VLSMRequirement,
  type VLSMResult
} from '~/utils/network'

const cidrInput = ref('192.168.0.0/24')
const mode = ref<'equal' | 'size' | 'vlsm'>('equal')
const divisionCount = ref(4)
const newCidr = ref(26)
const requirements = ref<VLSMRequirement[]>([
  { name: 'オフィスA', hostsNeeded: 50 },
  { name: 'オフィスB', hostsNeeded: 20 },
  { name: 'DMZ', hostsNeeded: 10 }
])
const subnets = ref<SubnetInfo[]>([])
const vlsmResults = ref<VLSMResult[]>([])
const error = ref('')

const { copied, copyToClipboard } = useCopyToClipboard()
const { getQueryParam, updateQueryParams } = useUrlState()

const processSubnet = () => {
  error.value = ''
  subnets.value = []
  vlsmResults.value = []

  try {
    if (!isValidCIDR(cidrInput.value)) {
      throw new Error('有効なCIDR表記を入力してください (例: 192.168.0.0/24)')
    }

    if (mode.value === 'equal') {
      subnets.value = divideSubnetEqually(cidrInput.value, divisionCount.value)
    } else if (mode.value === 'size') {
      subnets.value = divideSubnetBySize(cidrInput.value, newCidr.value)
    } else if (mode.value === 'vlsm') {
      if (requirements.value.length === 0) {
        throw new Error('少なくとも1つの要件を追加してください')
      }
      vlsmResults.value = calculateVLSM(cidrInput.value, requirements.value)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'エラーが発生しました'
  }
}

const addRequirement = () => {
  requirements.value.push({ name: `ネットワーク${requirements.value.length + 1}`, hostsNeeded: 10 })
}

const removeRequirement = (index: number) => {
  requirements.value.splice(index, 1)
}

const copyAllSubnets = () => {
  const text = subnets.value.map(s => s.network).join('\n')
  copyToClipboard(text)
}

const copyVLSMResults = () => {
  const text = vlsmResults.value
    .map(r => `${r.name}: ${r.network} (ホスト: ${r.hostsAvailable})`)
    .join('\n')
  copyToClipboard(text)
}

const exportCSV = () => {
  let csv = ''
  let filename = ''

  if (mode.value === 'vlsm') {
    const headers = ['名前', 'ネットワーク', 'ネットワークアドレス', 'ブロードキャスト', 'ホスト範囲', '利用可能ホスト数', '必要ホスト数']
    const rows = vlsmResults.value.map(r => [
      r.name,
      r.network,
      r.networkAddress,
      r.broadcastAddress,
      `${r.firstHost} - ${r.lastHost}`,
      r.hostsAvailable.toString(),
      r.hostsNeeded.toString()
    ])
    csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    filename = `vlsm_${cidrInput.value.replace('/', '_')}.csv`
  } else {
    const headers = ['ネットワーク', 'ネットワークアドレス', 'ブロードキャスト', 'ホスト範囲', 'ホスト数']
    const rows = subnets.value.map(s => [
      s.network,
      s.networkAddress,
      s.broadcastAddress,
      `${s.firstHost} - ${s.lastHost}`,
      s.hostCount.toString()
    ])
    csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    filename = `subnets_${cidrInput.value.replace('/', '_')}.csv`
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

// URLパラメータとの同期
onMounted(() => {
  const urlCidr = getQueryParam('subnetCidr')
  const urlMode = getQueryParam('subnetMode')
  const urlDivisionCount = getQueryParam('divisionCount')
  const urlNewCidr = getQueryParam('newCidr')

  if (urlCidr) cidrInput.value = urlCidr
  if (urlMode && ['equal', 'size', 'vlsm'].includes(urlMode)) {
    mode.value = urlMode as 'equal' | 'size' | 'vlsm'
  }
  if (urlDivisionCount) divisionCount.value = parseInt(urlDivisionCount)
  if (urlNewCidr) newCidr.value = parseInt(urlNewCidr)

  if (urlCidr) {
    processSubnet()
  }
})

watch([cidrInput, mode, divisionCount, newCidr], ([newCidr, newMode, newDivCount, newCidrVal]) => {
  updateQueryParams({
    subnetCidr: newCidr || null,
    subnetMode: newMode,
    divisionCount: String(newDivCount),
    newCidr: String(newCidrVal)
  })
})
</script>

<template>
  <div class="p-6">
    <!-- モード選択 -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        設計モード
      </label>
      <div class="flex gap-2">
        <button
          @click="mode = 'equal'"
          class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          :class="mode === 'equal' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
        >
          等分割
        </button>
        <button
          @click="mode = 'size'"
          class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          :class="mode === 'size' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
        >
          サイズ指定
        </button>
        <button
          @click="mode = 'vlsm'"
          class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          :class="mode === 'vlsm' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
        >
          VLSM最適化
        </button>
      </div>
    </div>

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

      <!-- 等分割モード -->
      <div v-if="mode === 'equal'">
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

      <!-- サイズ指定モード -->
      <div v-if="mode === 'size'">
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

      <!-- VLSMモード -->
      <div v-if="mode === 'vlsm'">
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
        @click="processSubnet"
        class="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {{ mode === 'vlsm' ? '計算' : '分割' }}
      </button>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
      {{ error }}
    </div>

    <!-- 通常のサブネット分割結果 -->
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

    <!-- VLSM結果 -->
    <div v-if="vlsmResults.length > 0" class="space-y-4">
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
            VLSM設計結果
          </h3>
          <div class="flex gap-2">
            <button
              @click="copyVLSMResults"
              class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              :class="{ 'bg-green-600 hover:bg-green-700': copied }"
            >
              {{ copied ? 'コピー完了' : 'コピー' }}
            </button>
            <button
              @click="exportCSV"
              class="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              CSV出力
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="(result, index) in vlsmResults"
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
