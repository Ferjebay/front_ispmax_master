<script setup lang="ts">
import type { Role } from '~/composables/useRole'

const props = defineProps<{ open: boolean; role?: Role | null; mode: 'create' | 'edit' }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'refresh'): void }>()

const { api } = useHelper()
const toast = useToast()
const loading = ref(false)

const form = reactive({ nombre: '', descripcion: '' })

watch(
  () => props.open,
  (val) => {
    if (!val) return
    if (props.mode === 'edit' && props.role) {
      form.nombre = props.role.nombre
      form.descripcion = props.role.descripcion ?? ''
    } else {
      form.nombre = ''
      form.descripcion = ''
    }
  },
)

const onSubmit = async () => {
  if (!form.nombre.trim()) {
    toast.add({ title: 'El nombre es requerido', color: 'error' })
    return
  }

  loading.value = true
  try {
    if (props.mode === 'create') {
      await api('roles', { method: 'POST', body: { ...form } })
    } else {
      await api(`roles/${props.role!.id}`, { method: 'PATCH', body: { ...form } })
    }
    toast.add({ title: `Rol ${props.mode === 'create' ? 'creado' : 'editado'} exitosamente.` })
    emit('refresh')
    emit('close')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error?.data?.message ?? 'Fallo al guardar el rol',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal :open="open" :title="mode === 'create' ? 'Crear rol' : 'Editar rol'" @close="emit('close')">
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Nombre" required>
          <UInput v-model="form.nombre" placeholder="Nombre del rol" class="w-full" />
        </UFormField>
        <UFormField label="Descripción">
          <UTextarea v-model="form.descripcion" placeholder="Descripción del rol" class="w-full" />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Cancelar" @click="emit('close')" />
        <UButton
          :label="mode === 'create' ? 'Crear' : 'Guardar'"
          :loading="loading"
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>
