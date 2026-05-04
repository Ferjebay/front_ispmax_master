import type { Device } from '~/interfaces/device.interface'

export function useDispositivo() {
  const toast = useToast()

  const dispositivos = ref<Device[]>([])
  const loading = ref(false)

  const loadDispositivos = async () => {
    loading.value = true
    try {
      dispositivos.value = await $fetch<Device[]>('/api/dispositivos')
    } catch (error: any) {
      toast.add({
        title: 'Error al cargar dispositivos',
        description: error?.data?.message ?? 'Intenta nuevamente',
        color: 'error',
      })
    } finally {
      loading.value = false
    }
  }

  return {
    dispositivos,
    loading,
    loadDispositivos,
  }
}
