<script setup lang="ts">
import { ref } from 'vue'

// アクティブなタブ
const activeTab = ref<'network' | 'checker'>('network')

// ページタイトル
useHead({
  title: 'IP Toolbox - Network Calculator'
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- ヘッダー -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          IP Toolbox
        </h1>
        <p class="text-gray-600">
          ネットワーク計算ツール - CIDR計算とIPアドレス分析
        </p>
      </header>

      <!-- タブナビゲーション -->
      <div class="bg-white rounded-lg shadow-md mb-6">
        <div class="flex border-b">
          <button
            @click="activeTab = 'network'"
            :class="[
              'flex-1 py-4 px-6 text-center font-medium transition-colors',
              activeTab === 'network'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            ]"
          >
            ネットワーク情報
          </button>
          <button
            @click="activeTab = 'checker'"
            :class="[
              'flex-1 py-4 px-6 text-center font-medium transition-colors',
              activeTab === 'checker'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            ]"
          >
            IP判定
          </button>
        </div>

        <!-- ネットワーク情報タブ -->
        <NetworkCalculator v-show="activeTab === 'network'" />

        <!-- IP判定タブ -->
        <IPChecker v-show="activeTab === 'checker'" />
      </div>
    </div>
  </div>
</template>
