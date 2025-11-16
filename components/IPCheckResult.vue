<script setup lang="ts">
import { IPType, type IPClassification } from '~/utils/network'

const props = defineProps<{
  checkResult: {
    belongs: boolean
    ipType: IPType | null
    classification: IPClassification | null
  }
}>()
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">判定結果</h3>
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <span class="text-gray-600 dark:text-gray-400">ネットワーク所属:</span>
        <span
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium',
            checkResult.belongs
              ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
          ]"
        >
          {{ checkResult.belongs ? '属する' : '属さない' }}
        </span>
      </div>
      <div v-if="checkResult.belongs && checkResult.ipType" class="flex items-center gap-2">
        <span class="text-gray-600 dark:text-gray-400">IPの種類:</span>
        <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
          {{ checkResult.ipType }}
        </span>
      </div>
    </div>

    <!-- IPアドレス分類情報 -->
    <div v-if="checkResult.classification" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
      <h4 class="text-md font-semibold text-gray-800 dark:text-gray-100 mb-3">IPアドレス分類</h4>
      <div class="space-y-2">
        <div class="flex items-start gap-2">
          <span class="text-gray-600 dark:text-gray-400 min-w-[100px]">分類:</span>
          <div class="flex-1">
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ checkResult.classification.description }}
            </div>
            <div v-if="checkResult.classification.rfc" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ checkResult.classification.rfc }}
            </div>
          </div>
        </div>
        <div v-if="checkResult.classification.class" class="flex items-center gap-2">
          <span class="text-gray-600 dark:text-gray-400 min-w-[100px]">クラス:</span>
          <span class="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ checkResult.classification.class }}
          </span>
        </div>
        <div class="flex flex-wrap gap-2 mt-3">
          <span
            v-if="checkResult.classification.isPrivate"
            class="px-2 py-1 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300"
          >
            プライベート
          </span>
          <span
            v-if="checkResult.classification.isLoopback"
            class="px-2 py-1 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300"
          >
            ループバック
          </span>
          <span
            v-if="checkResult.classification.isLinkLocal"
            class="px-2 py-1 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"
          >
            リンクローカル
          </span>
          <span
            v-if="checkResult.classification.isMulticast"
            class="px-2 py-1 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300"
          >
            マルチキャスト
          </span>
          <span
            v-if="checkResult.classification.isBroadcast"
            class="px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300"
          >
            ブロードキャスト
          </span>
          <span
            v-if="checkResult.classification.isReserved"
            class="px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
          >
            予約済み
          </span>
          <span
            v-if="!checkResult.classification.isPrivate && !checkResult.classification.isLoopback && !checkResult.classification.isLinkLocal && !checkResult.classification.isMulticast && !checkResult.classification.isBroadcast && !checkResult.classification.isReserved"
            class="px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300"
          >
            グローバル
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
