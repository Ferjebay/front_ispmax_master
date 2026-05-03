<script setup lang="ts">
import type { Proyecto, CreateProyectoPayload } from '~/interfaces/proyecto.interface'

const emit = defineEmits<{
  refresh: []
}>()

const { createProyecto, updateProyecto, loadProyectos } = useProyecto()

const toast = useToast()
const loading = ref(false)
const isOpen = ref(false)
const mode = ref<'create' | 'edit'>('create')
const selectedProyecto = ref<Proyecto | null>(null)

const buildEmptyForm = (): CreateProyectoPayload => ({
  nombre: '',
  sku: '',
})

const form = reactive<CreateProyectoPayload>(buildEmptyForm())

const open = (openMode: 'create' | 'edit' = 'create', proyecto?: Proyecto) => {
  mode.value = openMode
  selectedProyecto.value = proyecto ?? null

  if (openMode === 'edit' && proyecto) {
    form.nombre = proyecto.nombre
    form.sku = proyecto.sku
  } else {
    Object.assign(form, buildEmptyForm())
  }

  isOpen.value = true
}

const close = () => {
  isOpen.value = false
  selectedProyecto.value = null
  Object.assign(form, buildEmptyForm())
}

const onSubmit = async () => {
  if (!form.nombre.trim()) {
    toast.add({ title: 'El nombre es requerido', color: 'error' })
    return
  }
  if (!form.sku.trim()) {
    toast.add({ title: 'El SKU es requerido', color: 'error' })
    return
  }

  loading.value = true
  try {
    const payload: CreateProyectoPayload = {
      nombre: form.nombre.trim(),
      sku: form.sku.trim(),
    }

    if (mode.value === 'create') {
      await createProyecto(payload)
    } else {
      await updateProyecto(selectedProyecto.value!.id, payload)
    }

    await loadProyectos()
    emit('refresh')
    close()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error?.data?.message ?? 'Fallo al guardar el proyecto',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

defineExpose({ open, close })
</script>

<template>
  <UModal
    :open="isOpen"
    :title="mode === 'create' ? 'Nuevo proyecto' : 'Editar proyecto'"
    @close="close"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Nombre" required>
          <UInput
            v-model="form.nombre"
            placeholder="Ej: Proyecto Alpha"
            class="w-full"
          />
        </UFormField>

        <UFormField label="SKU" required>
          <UInput
            v-model="form.sku"
            placeholder="Ej: PRY-001"
            class="w-full"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="outline"
          label="Cancelar"
          @click="close"
        />
        <UButton
          :label="mode === 'create' ? 'Crear proyecto' : 'Guardar cambios'"
          :loading="loading"
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>
