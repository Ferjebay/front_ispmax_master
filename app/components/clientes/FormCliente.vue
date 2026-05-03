<script setup lang="ts">
import type { Cliente, CreateClientePayload, UpdateClientePayload } from '~/interfaces/cliente.interface'

const emit = defineEmits<{
  refresh: []
}>()

const { createCliente, updateCliente, loadClientes } = useCliente()

const toast = useToast()
const loading = ref(false)
const isOpen = ref(false)
const mode = ref<'create' | 'edit'>('create')
const selectedCliente = ref<Cliente | null>(null)

const buildEmptyForm = (): CreateClientePayload => ({
  identificacion: '',
  nombres: '',
  email: '',
  empresa: '',
  dns: '',
  estado: true,
})

const form = reactive<CreateClientePayload>(buildEmptyForm())

const open = (openMode: 'create' | 'edit' = 'create', cliente?: Cliente) => {
  mode.value = openMode
  selectedCliente.value = cliente ?? null

  if (openMode === 'edit' && cliente) {
    form.identificacion = cliente.identificacion
    form.nombres = cliente.nombres
    form.email = cliente.email
    form.empresa = cliente.empresa
    form.dns = cliente.dns
    form.estado = cliente.estado
  } else {
    Object.assign(form, buildEmptyForm())
  }

  isOpen.value = true
}

const close = () => {
  isOpen.value = false
  selectedCliente.value = null
  Object.assign(form, buildEmptyForm())
}

const validate = (): string | null => {
  if (form.identificacion.trim().length < 5) return 'La identificación debe tener al menos 5 caracteres'
  if (form.nombres.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres'
  if (!form.email.trim()) return 'El email es requerido'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) return 'El email no tiene un formato válido'
  if (form.empresa.trim().length < 2) return 'La empresa debe tener al menos 2 caracteres'
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipRegex.test(form.dns)) return 'El DNS debe ser una IP válida (ej: 192.168.1.1)'
  return null
}

const onSubmit = async () => {
  const error = validate()
  if (error) {
    toast.add({ title: error, color: 'error' })
    return
  }

  loading.value = true
  try {
    const payload: CreateClientePayload = {
      identificacion: form.identificacion.trim(),
      nombres: form.nombres.trim(),
      email: form.email.trim(),
      empresa: form.empresa.trim(),
      dns: form.dns.trim(),
      estado: form.estado,
    }

    if (mode.value === 'create') {
      await createCliente(payload)
    } else {
      const updatePayload: UpdateClientePayload = { ...payload }
      await updateCliente(selectedCliente.value!.id, updatePayload)
    }

    await loadClientes()
    emit('refresh')
    close()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err?.data?.message ?? 'Fallo al guardar el cliente',
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
    :title="mode === 'create' ? 'Nuevo cliente' : 'Editar cliente'"
    @close="close"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Identificación" required>
          <UInput
            v-model="form.identificacion"
            placeholder="Ej: 1234567890"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Nombres" required>
          <UInput
            v-model="form.nombres"
            placeholder="Ej: Juan Pérez"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="Ej: cliente@empresa.com"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Empresa" required>
          <UInput
            v-model="form.empresa"
            placeholder="Ej: Acme Corp"
            class="w-full"
          />
        </UFormField>

        <UFormField label="DNS (IP)" required>
          <UInput
            v-model="form.dns"
            placeholder="Ej: 192.168.1.1"
            class="w-full"
          />
        </UFormField>

        <UFormField v-if="mode === 'edit'" label="Estado">
          <UToggle v-model="form.estado" />
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
          :label="mode === 'create' ? 'Crear cliente' : 'Guardar cambios'"
          :loading="loading"
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>
