<script setup lang="ts">
import type { Permiso, CreatePermisoPayload } from '~/interfaces/permiso.interface'

const emit = defineEmits<{
  refresh: []
}>()

const {
  modalOpen,
  modalMode,
  selectedPermiso,
  closeModal,
  createPermiso,
  updatePermiso,
  loadPermisos,
} = usePermiso()

const toast = useToast()
const loading = ref(false)

const buildEmptyForm = (): CreatePermisoPayload => ({
  nombre: '',
  label: '',
  ruta: '',
  icono: '',
  orden: undefined,
  padre_id: '',
  visible_sidebar: false,
})

const form = reactive<CreatePermisoPayload>(buildEmptyForm())

watch(modalOpen, (isOpen) => {
  if (!isOpen) return
  if (modalMode.value === 'edit' && selectedPermiso.value) {
    const p = selectedPermiso.value
    form.nombre = p.nombre
    form.label = p.label ?? ''
    form.ruta = p.ruta ?? ''
    form.icono = p.icono ?? ''
    form.orden = p.orden
    form.padre_id = p.padre_id ?? ''
    form.visible_sidebar = p.visible_sidebar ?? false
  } else {
    Object.assign(form, buildEmptyForm())
  }
})

const onSubmit = async () => {
  if (!form.nombre.trim()) {
    toast.add({ title: 'El nombre es requerido', color: 'error' })
    return
  }

  loading.value = true
  try {
    const payload: CreatePermisoPayload = {
      nombre: form.nombre.trim(),
      ...(form.label?.trim() && { label: form.label.trim() }),
      ...(form.ruta?.trim() && { ruta: form.ruta.trim() }),
      ...(form.icono?.trim() && { icono: form.icono.trim() }),
      ...(form.orden != null && !isNaN(Number(form.orden)) && { orden: Number(form.orden) }),
      ...(form.padre_id?.trim() && { padre_id: form.padre_id.trim() }),
      visible_sidebar: form.visible_sidebar ?? false,
    }

    if (modalMode.value === 'create') {
      await createPermiso(payload)
    } else {
      await updatePermiso(selectedPermiso.value!._id, payload)
    }

    await loadPermisos()
    emit('refresh')
    closeModal()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error?.data?.message ?? 'Fallo al guardar el permiso',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Permite abrir/cerrar el modal desde un template ref externo
const open = (mode: 'create' | 'edit' = 'create', permiso?: Permiso) => {
  selectedPermiso.value = permiso ?? null
  modalMode.value = mode
  modalOpen.value = true
}

defineExpose({ open, close: closeModal })
</script>

<template>
  <UModal
    :open="modalOpen"
    :title="modalMode === 'create' ? 'Nuevo permiso' : 'Editar permiso'"
    @close="closeModal"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Nombre" required>
          <UInput
            v-model="form.nombre"
            placeholder="Ej: usuarios.ver"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Label (etiqueta visible)">
          <UInput
            v-model="form.label"
            placeholder="Ej: Ver usuarios"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Ruta">
            <UInput
              v-model="form.ruta"
              placeholder="Ej: /usuarios"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Ícono">
            <UInput
              v-model="form.icono"
              placeholder="Ej: i-lucide-users"
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Orden">
            <UInput
              v-model.number="form.orden"
              type="number"
              placeholder="Ej: 1"
              class="w-full"
            />
          </UFormField>
          <UFormField label="ID del padre (UUID)">
            <UInput
              v-model="form.padre_id"
              placeholder="UUID del permiso padre"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField label="Visible en sidebar">
          <div class="flex items-center gap-3 pt-1">
            <USwitch v-model="form.visible_sidebar" />
            <span class="text-sm text-muted">
              {{ form.visible_sidebar ? 'Sí, aparece en el menú' : 'No aparece en el menú' }}
            </span>
          </div>
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="outline"
          label="Cancelar"
          @click="closeModal"
        />
        <UButton
          :label="modalMode === 'create' ? 'Crear permiso' : 'Guardar cambios'"
          :loading="loading"
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>
