import type { Log, PaginationMeta } from '~/interfaces/log.interface'

export function useLog() {
  const toast = useToast()

  const logs = ref<Log[]>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  const loadLogs = async (currentPage = page.value, currentLimit = limit.value) => {
    loading.value = true
    try {
      const { data, meta } = await $fetch<{ data: Log[]; meta: PaginationMeta }>(
        '/api/logs',
        { params: { page: currentPage, limit: currentLimit } },
      )
      logs.value = data
      total.value = meta.total
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

  return {
    logs,
    loading,
    total,
    page,
    limit,
    loadLogs,
  }
}
