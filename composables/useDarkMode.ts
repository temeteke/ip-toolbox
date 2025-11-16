/**
 * ダークモード管理用のコンポーザブル
 */
export const useDarkMode = () => {
  const isDark = useState('darkMode', () => false)

  // 初期化
  const init = () => {
    if (process.client) {
      // LocalStorageから読み込み、またはシステム設定を使用
      const stored = localStorage.getItem('darkMode')
      if (stored !== null) {
        isDark.value = stored === 'true'
      } else {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      applyDarkMode()
    }
  }

  // ダークモードの適用
  const applyDarkMode = () => {
    if (process.client) {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  // トグル
  const toggle = () => {
    isDark.value = !isDark.value
    if (process.client) {
      localStorage.setItem('darkMode', String(isDark.value))
      applyDarkMode()
    }
  }

  return {
    isDark,
    toggle,
    init
  }
}
