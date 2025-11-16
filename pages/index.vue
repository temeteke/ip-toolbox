<script setup lang="ts">
import { ref, onMounted } from 'vue'

// アクティブなタブ
const activeTab = ref<'network' | 'checker' | 'subnet' | 'range' | 'aggregate' | 'vlsm'>('network')

// ダークモード
const { isDark, toggle, init: initDarkMode } = useDarkMode()

// 履歴機能
const { init: initHistory } = useHistory()

// ページタイトル
useHead({
  title: 'IP Toolbox - Network Calculator'
})

onMounted(() => {
  initDarkMode()
  initHistory()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- ヘッダー -->
      <header class="text-center mb-8 relative">
        <h1 class="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          IP Toolbox
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          ネットワーク計算ツール - CIDR計算とIPアドレス分析
        </p>

        <!-- ダークモード切り替えボタン -->
        <button
          @click="toggle"
          class="absolute top-0 right-0 p-2 rounded-lg bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-all"
          :aria-label="isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'"
        >
          <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </header>

      <!-- タブナビゲーション -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
        <div class="flex flex-wrap border-b dark:border-gray-700">
          <button
            @click="activeTab = 'network'"
            :class="[
              'flex-1 min-w-[120px] py-3 px-4 text-center text-sm font-medium transition-colors',
              activeTab === 'network'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            ネットワーク情報
          </button>
          <button
            @click="activeTab = 'checker'"
            :class="[
              'flex-1 min-w-[120px] py-3 px-4 text-center text-sm font-medium transition-colors',
              activeTab === 'checker'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            IP判定
          </button>
          <button
            @click="activeTab = 'subnet'"
            :class="[
              'flex-1 min-w-[120px] py-3 px-4 text-center text-sm font-medium transition-colors',
              activeTab === 'subnet'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            サブネット分割
          </button>
          <button
            @click="activeTab = 'range'"
            :class="[
              'flex-1 min-w-[120px] py-3 px-4 text-center text-sm font-medium transition-colors',
              activeTab === 'range'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            範囲→CIDR
          </button>
          <button
            @click="activeTab = 'aggregate'"
            :class="[
              'flex-1 min-w-[120px] py-3 px-4 text-center text-sm font-medium transition-colors',
              activeTab === 'aggregate'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            ネットワーク集約
          </button>
          <button
            @click="activeTab = 'vlsm'"
            :class="[
              'flex-1 min-w-[120px] py-3 px-4 text-center text-sm font-medium transition-colors',
              activeTab === 'vlsm'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            VLSM
          </button>
        </div>

        <!-- ネットワーク情報タブ -->
        <NetworkCalculator v-show="activeTab === 'network'" />

        <!-- IP判定タブ -->
        <IPChecker v-show="activeTab === 'checker'" />

        <!-- サブネット分割タブ -->
        <SubnetDivider v-show="activeTab === 'subnet'" />

        <!-- 範囲→CIDRタブ -->
        <RangeToCIDR v-show="activeTab === 'range'" />

        <!-- ネットワーク集約タブ -->
        <NetworkAggregator v-show="activeTab === 'aggregate'" />

        <!-- VLSMタブ -->
        <VLSMCalculator v-show="activeTab === 'vlsm'" />
      </div>
    </div>
  </div>
</template>
