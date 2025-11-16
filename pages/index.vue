<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// カテゴリーとタブの型定義
type Category = 'basic' | 'convert' | 'analyze' | 'advanced'
type BasicTab = 'network-info' | 'ip-analysis' | 'subnet-designer'
type ConvertTab = 'range-to-cidr' | 'mask-converter' | 'ipv6'
type AnalyzeTab = 'ip-calculator' | 'network-comparator'
type AdvancedTab = 'network-aggregator' | 'batch-processor'

// アクティブなカテゴリーとタブ
const activeCategory = ref<Category>('basic')
const activeTabs = ref({
  basic: 'network-info' as BasicTab,
  convert: 'range-to-cidr' as ConvertTab,
  analyze: 'ip-calculator' as AnalyzeTab,
  advanced: 'network-aggregator' as AdvancedTab
})

// カテゴリー設定
const categories = [
  { id: 'basic', label: '基本', icon: '📊' },
  { id: 'convert', label: '変換', icon: '🔄' },
  { id: 'analyze', label: '分析', icon: '🔬' },
  { id: 'advanced', label: '高度な機能', icon: '🚀' }
]

// サブタブ設定
const subTabs = {
  basic: [
    { id: 'network-info', label: 'ネットワーク情報' },
    { id: 'ip-analysis', label: 'IP分析' },
    { id: 'subnet-designer', label: 'サブネット設計' }
  ],
  convert: [
    { id: 'range-to-cidr', label: '範囲→CIDR' },
    { id: 'mask-converter', label: 'マスク変換' },
    { id: 'ipv6', label: 'IPv6計算' }
  ],
  analyze: [
    { id: 'ip-calculator', label: 'IP計算機' },
    { id: 'network-comparator', label: 'ネットワーク比較' }
  ],
  advanced: [
    { id: 'network-aggregator', label: 'ネットワーク集約' },
    { id: 'batch-processor', label: '一括処理' }
  ]
}

// 現在のアクティブなサブタブ
const currentSubTab = computed(() => activeTabs.value[activeCategory.value])

// カテゴリー変更時の処理
const setCategory = (category: Category) => {
  activeCategory.value = category
}

// サブタブ変更時の処理
const setSubTab = (tabId: string) => {
  activeTabs.value[activeCategory.value] = tabId as any
}

// ダークモード
const { isDark, toggle, init: initDarkMode } = useDarkMode()

// 履歴機能
const { init: initHistory } = useHistory()

// ページタイトル
useHead({
  title: 'IP Toolbox - Advanced Network Calculator'
})

onMounted(() => {
  initDarkMode()
  initHistory()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
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

      <!-- メインコンテナ -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <!-- カテゴリータブ（第1階層） -->
        <div class="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div class="flex">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="setCategory(category.id as Category)"
              :class="[
                'flex-1 py-3 px-4 text-center font-semibold transition-colors',
                activeCategory === category.id
                  ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]"
            >
              <span class="mr-2">{{ category.icon }}</span>
              <span class="hidden sm:inline">{{ category.label }}</span>
            </button>
          </div>
        </div>

        <!-- サブタブ（第2階層） -->
        <div class="border-b dark:border-gray-700 bg-white dark:bg-gray-800">
          <div class="flex flex-wrap">
            <button
              v-for="tab in subTabs[activeCategory]"
              :key="tab.id"
              @click="setSubTab(tab.id)"
              :class="[
                'flex-1 min-w-[120px] py-2 px-3 text-center text-sm font-medium transition-colors',
                currentSubTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-700'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- コンテンツエリア -->
        <div class="min-h-[400px]">
          <!-- 基本カテゴリー -->
          <NetworkInfoWithVisualization v-show="activeCategory === 'basic' && currentSubTab === 'network-info'" />
          <IPAnalysis v-show="activeCategory === 'basic' && currentSubTab === 'ip-analysis'" />
          <SubnetDesigner v-show="activeCategory === 'basic' && currentSubTab === 'subnet-designer'" />

          <!-- 変換カテゴリー -->
          <div v-show="activeCategory === 'convert' && currentSubTab === 'range-to-cidr'" class="p-6">
            <RangeToCIDR />
          </div>
          <div v-show="activeCategory === 'convert' && currentSubTab === 'mask-converter'" class="p-6">
            <SubnetMaskConverter />
          </div>
          <div v-show="activeCategory === 'convert' && currentSubTab === 'ipv6'" class="p-6">
            <IPv6Calculator />
          </div>

          <!-- 分析カテゴリー -->
          <div v-show="activeCategory === 'analyze' && currentSubTab === 'ip-calculator'" class="p-6">
            <IPCalculator />
          </div>
          <div v-show="activeCategory === 'analyze' && currentSubTab === 'network-comparator'" class="p-6">
            <NetworkComparator />
          </div>

          <!-- 高度な機能カテゴリー -->
          <div v-show="activeCategory === 'advanced' && currentSubTab === 'network-aggregator'" class="p-6">
            <NetworkAggregator />
          </div>
          <div v-show="activeCategory === 'advanced' && currentSubTab === 'batch-processor'" class="p-6">
            <BatchProcessor />
          </div>
        </div>
      </div>

      <!-- フッター情報 -->
      <div class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>10個の高度なネットワーク計算ツール | 統合UI v2.0</p>
      </div>
    </div>
  </div>
</template>
