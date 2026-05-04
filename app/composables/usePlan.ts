import type { Plan, CreatePlanPayload, UpdatePlanPayload } from '~/interfaces/plan.interface'

export function usePlan() {
  const toast = useToast()

  const planes = ref<Plan[]>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  const loadPlanes = async (currentPage = page.value, currentLimit = limit.value) => {
    loading.value = true
    try {
      const response = await $fetch<{ data: Plan[]; total: number }>(
        '/api/planes',
        { params: { page: currentPage, limit: currentLimit } },
      )
      planes.value = response.data
      total.value = response.total
      page.value = currentPage
    } catch (error: any) {
      toast.add({
        title: 'Error al cargar planes',
        description: error?.data?.message ?? 'Intenta nuevamente',
        color: 'error',
      })
    } finally {
      loading.value = false
    }
  }

  const getPlan = async (id: string): Promise<Plan> => {
    return $fetch<Plan>(`/api/planes/${id}`)
  }

  const createPlan = async (dto: CreatePlanPayload): Promise<void> => {
    await $fetch('/api/planes', { method: 'POST', body: dto })
    toast.add({ title: 'Plan creado exitosamente.' })
  }

  const updatePlan = async (id: string, dto: UpdatePlanPayload): Promise<void> => {
    await $fetch(`/api/planes/${id}`, { method: 'PATCH', body: dto })
    toast.add({ title: 'Plan actualizado exitosamente.' })
  }

  const removePlan = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/planes/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Plan eliminado.' })
      await loadPlanes()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message ?? 'Fallo al eliminar el plan',
        color: 'error',
      })
    }
  }

  const restorePlan = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/planes/restore/${id}`, { method: 'PUT' })
      toast.add({ title: 'Plan restaurado.' })
      await loadPlanes()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message ?? 'Fallo al restaurar el plan',
        color: 'error',
      })
    }
  }

  return {
    planes,
    loading,
    total,
    page,
    limit,
    loadPlanes,
    getPlan,
    createPlan,
    updatePlan,
    removePlan,
    restorePlan,
  }
}
