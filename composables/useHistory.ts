/**
 * 計算履歴管理用のコンポーザブル
 */
export interface HistoryItem {
  id: string
  type: 'network' | 'checker' | 'subnet' | 'range' | 'aggregate' | 'vlsm'
  timestamp: number
  input: string
  label?: string
}

const MAX_HISTORY_ITEMS = 50

export const useHistory = () => {
  const history = useState<HistoryItem[]>('history', () => [])

  const init = () => {
    if (process.client) {
      const stored = localStorage.getItem('ipToolboxHistory')
      if (stored) {
        try {
          history.value = JSON.parse(stored)
        } catch (e) {
          history.value = []
        }
      }
    }
  }

  const saveHistory = () => {
    if (process.client) {
      localStorage.setItem('ipToolboxHistory', JSON.stringify(history.value))
    }
  }

  const addHistory = (type: HistoryItem['type'], input: string, label?: string) => {
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      timestamp: Date.now(),
      input,
      label
    }

    history.value.unshift(item)

    // 最大数を超えたら古いものを削除
    if (history.value.length > MAX_HISTORY_ITEMS) {
      history.value = history.value.slice(0, MAX_HISTORY_ITEMS)
    }

    saveHistory()
  }

  const removeHistory = (id: string) => {
    history.value = history.value.filter(item => item.id !== id)
    saveHistory()
  }

  const clearHistory = () => {
    history.value = []
    saveHistory()
  }

  const getHistoryByType = (type: HistoryItem['type']) => {
    return history.value.filter(item => item.type === type)
  }

  return {
    history,
    init,
    addHistory,
    removeHistory,
    clearHistory,
    getHistoryByType
  }
}
