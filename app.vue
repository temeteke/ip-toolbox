<template>
  <div>
    <NuxtPwaAssets />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'ja'
  }
})
</script>
