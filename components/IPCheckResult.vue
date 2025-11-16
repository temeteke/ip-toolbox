<script setup lang="ts">
import { IPType } from '~/utils/network'

const props = defineProps<{
  checkResult: {
    belongs: boolean
    ipType: IPType | null
  }
}>()
</script>

<template>
  <div class="bg-gray-50 rounded-lg p-4">
    <h3 class="text-lg font-semibold text-gray-800 mb-3">判定結果</h3>
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <span class="text-gray-600">ネットワーク所属:</span>
        <span
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium',
            checkResult.belongs
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          ]"
        >
          {{ checkResult.belongs ? '属する' : '属さない' }}
        </span>
      </div>
      <div v-if="checkResult.belongs && checkResult.ipType" class="flex items-center gap-2">
        <span class="text-gray-600">IPの種類:</span>
        <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {{ checkResult.ipType }}
        </span>
      </div>
    </div>
  </div>
</template>
