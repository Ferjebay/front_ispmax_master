import type { Proyecto, CreateProyectoPayload, PaginationMeta } from '~/interfaces/proyecto.interface'

export function useProyecto() {
  const toast = useToast()

  const proyectos = ref<Proyecto[]>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  const loadProyectos = async (currentPage = page.value, currentLimit = limit.value) => {
    loading.value = true
    try {
      const { data, meta } = await $fetch<{ data: Proyecto[]; meta: PaginationMeta }>(
        '/api/proyectos',
        { params: { page: currentPage, limit: currentLimit } },
      )
      proyectos.value = data
      total.value = meta.total
      page.value = currentPage
    } catch (error: any) {
      toast.add({
        title: 'Error al cargar proyectos',
        description: error?.data?.message ?? 'Intenta nuevamente',
        color: 'error',
      })
    } finally {
      loading.value = false
    }
  }

  const createProyecto = async (dto: CreateProyectoPayload): Promise<void> => {
    await $fetch('/api/proyectos', { method: 'POST', body: dto })
    toast.add({ title: 'Proyecto creado exitosamente.' })
  }

  const updateProyecto = async (id: string, dto: Partial<CreateProyectoPayload>): Promise<void> => {
    await $fetch(`/api/proyectos/${id}`, { method: 'PATCH', body: dto })
    toast.add({ title: 'Proyecto actualizado exitosamente.' })
  }

  const removeProyecto = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/proyectos/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Proyecto eliminado.' })
      await loadProyectos()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message ?? 'Fallo al eliminar el proyecto',
        color: 'error',
      })
    }
  }

  return {
    proyectos,
    loading,
    total,
    page,
    limit,
    loadProyectos,
    createProyecto,
    updateProyecto,
    removeProyecto,
  }
}
