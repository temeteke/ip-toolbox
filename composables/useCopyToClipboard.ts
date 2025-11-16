import { ref } from 'vue'

export function useCopyToClipboard() {
  const copied = ref(false)
  let timeoutId: NodeJS.Timeout | null = null

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true

      // 2秒後にcopiedをリセット
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        copied.value = false
      }, 2000)

      return true
    } catch (error) {
      console.error('クリップボードへのコピーに失敗しました:', error)
      return false
    }
  }

  return {
    copied,
    copyToClipboard
  }
}
