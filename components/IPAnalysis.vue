<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  isIpInNetwork,
  getIPType,
  isValidCIDR,
  isValidIP,
  IPType,
  classifyIPAddress,
  type IPClassification
} from '~/utils/network'

const checkIp = ref('192.168.0.10')
const checkCidr = ref('')
const checkResult = ref<{
  belongs: boolean
  ipType: IPType | null
  classification: IPClassification | null
} | null>(null)
const checkError = ref('')

const { getQueryParam, updateQueryParams } = useUrlState()

const checkIpBelonging = () => {
  checkError.value = ''
  checkResult.value = null

  try {
    if (!isValidIP(checkIp.value)) {
      throw new Error('有効なIPアドレスを入力してください')
    }

    // IP分類は常に実行
    const classification = classifyIPAddress(checkIp.value)

    // ネットワークが指定されている場合のみ所属判定
    let belongs = false
    let ipType: IPType | null = null

    if (checkCidr.value.trim()) {
      if (!isValidCIDR(checkCidr.value)) {
        throw new Error('有効なCIDR表記を入力してください')
      }
      belongs = isIpInNetwork(checkIp.value, checkCidr.value)
      ipType = belongs ? getIPType(checkIp.value, checkCidr.value) : null
    }

    checkResult.value = {
      belongs,
      ipType,
      classification
    }
  } catch (error) {
    checkError.value = error instanceof Error ? error.message : '判定エラーが発生しました'
  }
}

// URLパラメータとの同期
onMounted(() => {
  const urlCheckIp = getQueryParam('checkIp')
  const urlCheckCidr = getQueryParam('checkCidr')

  if (urlCheckIp) {
    checkIp.value = urlCheckIp
  }
  if (urlCheckCidr) {
    checkCidr.value = urlCheckCidr
  }

  if (urlCheckIp) {
    checkIpBelonging()
  }
})

// 入力値の変更をURLに反映
watch([checkIp, checkCidr], ([newIp, newCidr]) => {
  updateQueryParams({
    checkIp: newIp || null,
    checkCidr: newCidr || null
  })
})
</script>

<template>
  <div class="p-6">
    <div class="mb-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          IPアドレス
        </label>
        <input
          v-model="checkIp"
          type="text"
          placeholder="例: 192.168.0.10"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          @keyup.enter="checkIpBelonging"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ネットワーク (CIDR表記) - オプション
        </label>
        <input
          v-model="checkCidr"
          type="text"
          placeholder="例: 192.168.0.0/24 (任意)"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          @keyup.enter="checkIpBelonging"
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          ネットワークを指定すると、所属判定も表示されます
        </p>
      </div>
      <button
        @click="checkIpBelonging"
        class="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        分析
      </button>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="checkError" class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
      {{ checkError }}
    </div>

    <!-- 結果表示 -->
    <div v-if="checkResult" class="space-y-4">
      <!-- ネットワーク所属判定（ネットワークが指定されている場合のみ） -->
      <div v-if="checkCidr.trim()" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">ネットワーク所属判定</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border dark:border-gray-600">
            <span class="text-sm text-gray-600 dark:text-gray-400">ネットワーク:</span>
            <span class="font-mono font-semibold">{{ checkCidr }}</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded" :class="checkResult.belongs ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'">
            <span class="text-sm font-medium" :class="checkResult.belongs ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
              所属判定:
            </span>
            <span class="font-semibold" :class="checkResult.belongs ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
              {{ checkResult.belongs ? '✅ 所属しています' : '❌ 所属していません' }}
            </span>
          </div>
          <div v-if="checkResult.ipType" class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800">
            <span class="text-sm text-blue-700 dark:text-blue-300">IPタイプ:</span>
            <span class="font-semibold text-blue-700 dark:text-blue-300">{{ checkResult.ipType }}</span>
          </div>
        </div>
      </div>

      <!-- IP分類情報（常に表示） -->
      <div v-if="checkResult.classification" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">IPアドレス分類</h3>

        <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p class="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">{{ checkResult.classification.description }}</p>
          <p v-if="checkResult.classification.rfc" class="text-sm text-blue-700 dark:text-blue-300">参照: {{ checkResult.classification.rfc }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">IPクラス</p>
            <p class="text-lg font-semibold">{{ checkResult.classification.class || 'N/A' }}</p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">アドレスタイプ</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <span
                v-if="checkResult.classification.isPrivate"
                class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-sm"
              >
                プライベート
              </span>
              <span
                v-if="checkResult.classification.isLoopback"
                class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm"
              >
                ループバック
              </span>
              <span
                v-if="checkResult.classification.isLinkLocal"
                class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-sm"
              >
                リンクローカル
              </span>
              <span
                v-if="checkResult.classification.isMulticast"
                class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-sm"
              >
                マルチキャスト
              </span>
              <span
                v-if="checkResult.classification.isBroadcast"
                class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-sm"
              >
                ブロードキャスト
              </span>
              <span
                v-if="checkResult.classification.isReserved"
                class="px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 rounded text-sm"
              >
                予約済み
              </span>
              <span
                v-if="!checkResult.classification.isPrivate && !checkResult.classification.isLoopback && !checkResult.classification.isLinkLocal && !checkResult.classification.isMulticast && !checkResult.classification.isBroadcast && !checkResult.classification.isReserved"
                class="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded text-sm"
              >
                グローバル
              </span>
            </div>
          </div>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">特性チェック</p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div class="flex items-center">
              <span class="mr-2">{{ checkResult.classification.isPrivate ? '✅' : '❌' }}</span>
              <span class="text-sm">プライベートIP</span>
            </div>
            <div class="flex items-center">
              <span class="mr-2">{{ checkResult.classification.isLoopback ? '✅' : '❌' }}</span>
              <span class="text-sm">ループバック</span>
            </div>
            <div class="flex items-center">
              <span class="mr-2">{{ checkResult.classification.isLinkLocal ? '✅' : '❌' }}</span>
              <span class="text-sm">リンクローカル</span>
            </div>
            <div class="flex items-center">
              <span class="mr-2">{{ checkResult.classification.isMulticast ? '✅' : '❌' }}</span>
              <span class="text-sm">マルチキャスト</span>
            </div>
            <div class="flex items-center">
              <span class="mr-2">{{ checkResult.classification.isBroadcast ? '✅' : '❌' }}</span>
              <span class="text-sm">ブロードキャスト</span>
            </div>
            <div class="flex items-center">
              <span class="mr-2">{{ checkResult.classification.isReserved ? '✅' : '❌' }}</span>
              <span class="text-sm">予約済み</span>
            </div>
          </div>
        </div>

        <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 使用ガイド</p>
          <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li v-if="checkResult.classification.isPrivate">• このIPアドレスはインターネット上では使用できません（プライベート用）</li>
            <li v-if="checkResult.classification.isLoopback">• このIPアドレスはローカルホスト（自分自身）を指します</li>
            <li v-if="checkResult.classification.isLinkLocal">• このIPアドレスは同一リンク内でのみ使用可能です</li>
            <li v-if="checkResult.classification.isMulticast">• このIPアドレスはグループ通信に使用されます</li>
            <li v-if="checkResult.classification.isBroadcast">• このIPアドレスはすべてのホストに送信されます</li>
            <li v-if="checkResult.classification.isReserved">• このIPアドレスは特別な用途のために予約されています</li>
            <li v-if="!checkResult.classification.isPrivate && !checkResult.classification.isLoopback && !checkResult.classification.isLinkLocal && !checkResult.classification.isMulticast && !checkResult.classification.isBroadcast && !checkResult.classification.isReserved">
              • このIPアドレスはインターネット上で使用可能です（グローバルIP）
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
