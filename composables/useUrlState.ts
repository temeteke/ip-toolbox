import { watch, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * URLクエリパラメータと状態を同期するcomposable
 */
export const useUrlState = () => {
  const router = useRouter()
  const route = useRoute()

  /**
   * URLクエリパラメータから値を取得
   */
  const getQueryParam = (key: string): string | null => {
    const value = route.query[key]
    return value ? String(value) : null
  }

  /**
   * URLクエリパラメータを更新
   */
  const updateQueryParam = (key: string, value: string | null) => {
    const query = { ...route.query }

    if (value === null || value === '') {
      delete query[key]
    } else {
      query[key] = value
    }

    router.replace({ query })
  }

  /**
   * 複数のクエリパラメータを一度に更新
   */
  const updateQueryParams = (params: Record<string, string | null>) => {
    const query = { ...route.query }

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '') {
        delete query[key]
      } else {
        query[key] = value
      }
    })

    router.replace({ query })
  }

  /**
   * Refとクエリパラメータを双方向同期
   */
  const syncWithUrl = <T extends string>(
    ref: Ref<T>,
    paramKey: string,
    defaultValue: T
  ) => {
    // URLから初期値を復元
    const urlValue = getQueryParam(paramKey)
    if (urlValue !== null) {
      ref.value = urlValue as T
    }

    // refの変更をURLに反映
    watch(ref, (newValue) => {
      updateQueryParam(paramKey, newValue === defaultValue ? null : newValue)
    })
  }

  return {
    getQueryParam,
    updateQueryParam,
    updateQueryParams,
    syncWithUrl
  }
}
