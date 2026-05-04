import type { Permiso, CreatePermisoPayload } from '~/interfaces/permiso.interface'

export function usePermiso() {
  const toast = useToast()

  // --- Estado de datos (local a cada instancia del composable) ---
  const permisos = ref<Permiso[]>([])
  const loading = ref(false)
  const uploading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  // --- Estado compartido del modal (useState = compartido entre componentes SSR-safe) ---
  const modalOpen = useState<boolean>('permiso:modal_open', () => false)
  const modalMode = useState<'create' | 'edit'>('permiso:modal_mode', () => 'create')
  const selectedPermiso = useState<Permiso | null>('permiso:selected', () => null)

  const openCreateModal = () => {
    selectedPermiso.value = null
    modalMode.value = 'create'
    modalOpen.value = true
  }

  const openEditModal = (permiso: Permiso) => {
    selectedPermiso.value = permiso
    modalMode.value = 'edit'
    modalOpen.value = true
  }

  const closeModal = () => {
    modalOpen.value = false
  }

  // --- CRUD ---
  const loadPermisos = async (currentPage = page.value, currentLimit = limit.value) => {
    loading.value = true
    try {
      const response = await $fetch<{ data: Permiso[]; total: number }>(
        '/api/permisos',
        { params: { page: currentPage, limit: currentLimit } },
      )
      permisos.value = response.data
      total.value = response.total
      page.value = currentPage
    } catch (error: any) {
      toast.add({
        title: 'Error al cargar permisos',
        description: error?.data?.message ?? 'Intenta nuevamente',
        color: 'error',
      })
    } finally {
      loading.value = false
    }
  }

  const createPermiso = async (dto: CreatePermisoPayload): Promise<void> => {
    await $fetch('/api/permisos', { method: 'POST', body: dto })
    toast.add({ title: 'Permiso creado exitosamente.' })
  }

  const updatePermiso = async (id: string, dto: Partial<CreatePermisoPayload>): Promise<void> => {
    await $fetch(`/api/permisos/${id}`, { method: 'PATCH', body: dto })
    toast.add({ title: 'Permiso actualizado exitosamente.' })
  }

  const removePermiso = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/permisos/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Permiso eliminado.' })
      await loadPermisos()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message ?? 'Fallo al eliminar el permiso',
        color: 'error',
      })
    }
  }

  const restorePermiso = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/permisos/restore/${id}`, { method: 'PUT' })
      toast.add({ title: 'Permiso restaurado.' })
      await loadPermisos()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message ?? 'Fallo al restaurar el permiso',
        color: 'error',
      })
    }
  }

  // --- Excel ---

  // La plantilla vive en /public/plantilla_permisos.xlsx (archivo estático)
  const downloadTemplate = (): void => {
    const anchor = document.createElement('a')
    anchor.href = '/plantilla_permisos.xlsx'
    anchor.download = 'plantilla_permisos.xlsx'
    anchor.click()
  }

  // Parsing client-side con xlsx (dynamic import evita problemas ESM en Windows/Nitro)
  const uploadBulk = async (file: File): Promise<void> => {
    uploading.value = true
    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]

      if (!ws) throw new Error('El archivo no contiene hojas de cálculo válidas')

      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

      const permisos = rawRows
        .filter((row) => String(row['nombre'] ?? '').trim())
        .map((row) => ({
          nombre: String(row['nombre']).trim(),
          ...(row['label'] && { label: String(row['label']).trim() }),
          ...(row['ruta'] && { ruta: String(row['ruta']).trim() }),
          ...(row['icono'] && { icono: String(row['icono']).trim() }),
          ...(row['orden'] !== '' && row['orden'] != null && { orden: Number(row['orden']) }),
          ...(String(row['padre_id'] ?? '').trim() && { padre_id: String(row['padre_id']).trim() }),
          visible_sidebar: String(row['visible_sidebar']).toLowerCase() === 'true',
        }))

      if (!permisos.length) throw new Error('No se encontraron registros válidos en el archivo')

      await $fetch('/api/permisos/bulk', { method: 'POST', body: { permisos } })

      toast.add({ title: `${permisos.length} permisos importados exitosamente.` })
      await loadPermisos()
    } catch (error: any) {
      toast.add({
        title: 'Error en importación masiva',
        description: error?.message ?? error?.data?.message ?? 'Fallo al procesar el archivo',
        color: 'error',
      })
    } finally {
      uploading.value = false
    }
  }

  return {
    // Datos
    permisos,
    loading,
    uploading,
    total,
    page,
    limit,
    // Modal
    modalOpen,
    modalMode,
    selectedPermiso,
    openCreateModal,
    openEditModal,
    closeModal,
    // CRUD
    loadPermisos,
    createPermiso,
    updatePermiso,
    removePermiso,
    restorePermiso,
    // Excel
    downloadTemplate,
    uploadBulk,
  }
}
