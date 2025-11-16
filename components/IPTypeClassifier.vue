<template>
  <div class="space-y-6">
    <div>
      <label for="ip-input" class="block text-sm font-medium mb-2">
        IPアドレスを入力
      </label>
      <input
        id="ip-input"
        v-model="input"
        type="text"
        placeholder="例: 192.168.1.1"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        @input="handleClassify"
      />
    </div>

    <div v-if="error" class="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>

    <div v-if="result" class="space-y-4">
      <h3 class="text-lg font-semibold">IPアドレス分類</h3>

      <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <p class="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">{{ result.description }}</p>
        <p v-if="result.rfc" class="text-sm text-blue-700 dark:text-blue-300">参照: {{ result.rfc }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">IPクラス</p>
          <p class="text-lg font-semibold">{{ result.class || 'N/A' }}</p>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">アドレスタイプ</p>
          <div class="flex flex-wrap gap-2 mt-2">
            <span
              v-if="result.isPrivate"
              class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-sm"
            >
              プライベート
            </span>
            <span
              v-if="result.isLoopback"
              class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm"
            >
              ループバック
            </span>
            <span
              v-if="result.isLinkLocal"
              class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-sm"
            >
              リンクローカル
            </span>
            <span
              v-if="result.isMulticast"
              class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-sm"
            >
              マルチキャスト
            </span>
            <span
              v-if="result.isBroadcast"
              class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-sm"
            >
              ブロードキャスト
            </span>
            <span
              v-if="result.isReserved"
              class="px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 rounded text-sm"
            >
              予約済み
            </span>
            <span
              v-if="!result.isPrivate && !result.isLoopback && !result.isLinkLocal && !result.isMulticast && !result.isBroadcast && !result.isReserved"
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
            <span class="mr-2">{{ result.isPrivate ? '✅' : '❌' }}</span>
            <span class="text-sm">プライベートIP</span>
          </div>
          <div class="flex items-center">
            <span class="mr-2">{{ result.isLoopback ? '✅' : '❌' }}</span>
            <span class="text-sm">ループバック</span>
          </div>
          <div class="flex items-center">
            <span class="mr-2">{{ result.isLinkLocal ? '✅' : '❌' }}</span>
            <span class="text-sm">リンクローカル</span>
          </div>
          <div class="flex items-center">
            <span class="mr-2">{{ result.isMulticast ? '✅' : '❌' }}</span>
            <span class="text-sm">マルチキャスト</span>
          </div>
          <div class="flex items-center">
            <span class="mr-2">{{ result.isBroadcast ? '✅' : '❌' }}</span>
            <span class="text-sm">ブロードキャスト</span>
          </div>
          <div class="flex items-center">
            <span class="mr-2">{{ result.isReserved ? '✅' : '❌' }}</span>
            <span class="text-sm">予約済み</span>
          </div>
        </div>
      </div>

      <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <p class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 使用ガイド</p>
        <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li v-if="result.isPrivate">• このIPアドレスはインターネット上では使用できません（プライベート用）</li>
          <li v-if="result.isLoopback">• このIPアドレスはローカルホスト（自分自身）を指します</li>
          <li v-if="result.isLinkLocal">• このIPアドレスは同一リンク内でのみ使用可能です</li>
          <li v-if="result.isMulticast">• このIPアドレスはグループ通信に使用されます</li>
          <li v-if="result.isBroadcast">• このIPアドレスはすべてのホストに送信されます</li>
          <li v-if="result.isReserved">• このIPアドレスは特別な用途のために予約されています</li>
          <li v-if="!result.isPrivate && !result.isLoopback && !result.isLinkLocal && !result.isMulticast && !result.isBroadcast && !result.isReserved">
            • このIPアドレスはインターネット上で使用可能です（グローバルIP）
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { classifyIPAddress, type IPClassification } from '~/utils/network'

const input = ref('')
const result = ref<IPClassification | null>(null)
const error = ref('')

const handleClassify = () => {
  if (!input.value.trim()) {
    result.value = null
    error.value = ''
    return
  }

  try {
    result.value = classifyIPAddress(input.value.trim())
    error.value = ''
  } catch (e) {
    result.value = null
    error.value = e instanceof Error ? e.message : '分類に失敗しました'
  }
}
</script>
