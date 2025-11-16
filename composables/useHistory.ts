/**
 * 計算履歴管理用のコンポーザブル
 */
export interface HistoryItem {
  id: string
  type: 'network' | 'checker' | 'subnet' | 'range' | 'aggregate' | 'vlsm' | 'mask-converter' | 'ip-classifier' | 'ip-calculator' | 'network-comparator' | 'ipv6' | 'batch'
  timestamp: number
  input: string
  label?: string
  isFavorite?: boolean
  tags?: string[]
  notes?: string
}

const MAX_HISTORY_ITEMS = 100

export const useHistory = () => {
  const history = useState<HistoryItem[]>('history', () => [])
  const favorites = useState<string[]>('favorites', () => [])

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

      const storedFavorites = localStorage.getItem('ipToolboxFavorites')
      if (storedFavorites) {
        try {
          favorites.value = JSON.parse(storedFavorites)
        } catch (e) {
          favorites.value = []
        }
      }
    }
  }

  const saveHistory = () => {
    if (process.client) {
      localStorage.setItem('ipToolboxHistory', JSON.stringify(history.value))
    }
  }

  const saveFavorites = () => {
    if (process.client) {
      localStorage.setItem('ipToolboxFavorites', JSON.stringify(favorites.value))
    }
  }

  const addHistory = (
    type: HistoryItem['type'],
    input: string,
    label?: string,
    tags?: string[],
    notes?: string
  ) => {
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      timestamp: Date.now(),
      input,
      label,
      isFavorite: false,
      tags: tags || [],
      notes: notes || ''
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

  const toggleFavorite = (id: string) => {
    const item = history.value.find(h => h.id === id)
    if (item) {
      item.isFavorite = !item.isFavorite
      if (item.isFavorite) {
        if (!favorites.value.includes(id)) {
          favorites.value.push(id)
        }
      } else {
        favorites.value = favorites.value.filter(fid => fid !== id)
      }
      saveHistory()
      saveFavorites()
    }
  }

  const getFavorites = () => {
    return history.value.filter(item => item.isFavorite)
  }

  const searchHistory = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return history.value.filter(item => {
      return (
        item.input.toLowerCase().includes(lowerQuery) ||
        item.label?.toLowerCase().includes(lowerQuery) ||
        item.notes?.toLowerCase().includes(lowerQuery) ||
        item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    })
  }

  const updateHistoryItem = (id: string, updates: Partial<HistoryItem>) => {
    const item = history.value.find(h => h.id === id)
    if (item) {
      Object.assign(item, updates)
      saveHistory()
    }
  }

  const addTagToItem = (id: string, tag: string) => {
    const item = history.value.find(h => h.id === id)
    if (item) {
      if (!item.tags) {
        item.tags = []
      }
      if (!item.tags.includes(tag)) {
        item.tags.push(tag)
        saveHistory()
      }
    }
  }

  const removeTagFromItem = (id: string, tag: string) => {
    const item = history.value.find(h => h.id === id)
    if (item && item.tags) {
      item.tags = item.tags.filter(t => t !== tag)
      saveHistory()
    }
  }

  const getAllTags = () => {
    const tagSet = new Set<string>()
    history.value.forEach(item => {
      item.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet)
  }

  const getHistoryByTag = (tag: string) => {
    return history.value.filter(item => item.tags?.includes(tag))
  }

  const exportHistory = () => {
    return JSON.stringify(history.value, null, 2)
  }

  const importHistory = (jsonData: string) => {
    try {
      const imported = JSON.parse(jsonData)
      if (Array.isArray(imported)) {
        history.value = imported
        saveHistory()
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }

  return {
    history,
    favorites,
    init,
    addHistory,
    removeHistory,
    clearHistory,
    getHistoryByType,
    toggleFavorite,
    getFavorites,
    searchHistory,
    updateHistoryItem,
    addTagToItem,
    removeTagFromItem,
    getAllTags,
    getHistoryByTag,
    exportHistory,
    importHistory
  }
}
