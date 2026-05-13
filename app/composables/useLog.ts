import type { Log, LogStats } from '~/interfaces/log.interface'

export function useLog() {
  const toast = useToast()

  const logs = ref<Log[]>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  const stats = ref<LogStats | null>(null)
  const loadingStats = ref(false)

  const loadLogs = async (
    currentPage = page.value,
    currentLimit = limit.value,
  ) => {
    loading.value = true
    try {
      const response = await $fetch<{ data: Log[]; total: number }>(
        '/api/logs',
        { params: { page: currentPage, limit: currentLimit } },
      )
      logs.value = response.data
      total.value = response.total
      page.value = currentPage
    } catch (error: any) {
      toast.add({
        title: 'Error al cargar logs',
        description: error?.data?.message ?? 'Intenta nuevamente',
        color: 'error',
      })
    } finally {
      loading.value = false
    }
  }

  const loadStats = async () => {
    loadingStats.value = true
    try {
      const data = await $fetch<LogStats>('/api/logs/stats')
      stats.value = data
    } catch (error: any) {
      toast.add({
        title: 'Error al cargar estadísticas',
        description: error?.data?.message ?? 'Intenta nuevamente',
        color: 'error',
      })
    } finally {
      loadingStats.value = false
    }
  }

  return {
    logs,
    loading,
    total,
    page,
    limit,
    loadLogs,
    stats,
    loadingStats,
    loadStats,
  }
}
