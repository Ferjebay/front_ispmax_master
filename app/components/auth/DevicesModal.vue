<script setup lang="ts">
import type { Device } from '~/composables/useAuth'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const { flow, removeDevice, resetFlow } = useAuth()
const toast = useToast()
const removingId = ref<string | null>(null)

function onClose() {
  emit('update:open', false)
  resetFlow()
}

function formatDevice(userAgent: string) {
  if (/mobile/i.test(userAgent)) return 'Móvil'
  if (/tablet/i.test(userAgent)) return 'Tablet'
  return 'Escritorio'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

async function onRemove(device: Device) {
  removingId.value = device.id
  try {
    await removeDevice(device.id)
    toast.add({ title: 'Dispositivo eliminado', description: 'Puedes iniciar sesión nuevamente.', color: 'success' })
    onClose()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error?.data?.message ?? 'No se pudo eliminar el dispositivo', color: 'error' })
  } finally {
    removingId.value = null
  }
}
</script>

<template>
  <UModal :open="props.open" @update:open="(v) => !v && onClose()" :dismissible="false" title="Límite de dispositivos alcanzado">
    <template #body>
      <div class="flex flex-col gap-4">
        <p class="text-sm text-muted">Has alcanzado el límite de dispositivos activos. Elimina uno para continuar.</p>
        <ul class="flex flex-col gap-2">
          <li v-for="device in flow.devices" :key="device.id" class="flex items-center justify-between rounded-lg border p-3 gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <UIcon :name="formatDevice(device.userAgent) === 'Móvil' ? 'i-lucide-smartphone' : 'i-lucide-monitor'" class="size-5 shrink-0 text-muted" />
              <div class="min-w-0">
                <p class="text-sm font-medium truncate">{{ device.ip }}</p>
                <p class="text-xs text-muted truncate">{{ formatDate(device.created_at) }}</p>
              </div>
            </div>
            <UButton color="error" variant="ghost" icon="i-lucide-trash-2" size="sm" :loading="removingId === device.id" :disabled="removingId !== null" @click="onRemove(device)" />
          </li>
        </ul>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton variant="ghost" color="neutral" :disabled="removingId !== null" @click="onClose">Cancelar</UButton>
      </div>
    </template>
  </UModal>
</template>
