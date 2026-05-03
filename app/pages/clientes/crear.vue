<script setup lang="ts">
import type { CreateClientePayload } from '~/interfaces/cliente.interface'

definePageMeta({ middleware: 'auth' })

const { createCliente } = useCliente()
const toast = useToast()
const router = useRouter()
const loading = ref(false)

const form = reactive<CreateClientePayload>({
  identificacion: '',
  nombres: '',
  email: '',
  empresa: '',
  dns: '',
  estado: true,
})

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
    await createCliente({
      identificacion: form.identificacion.trim(),
      nombres: form.nombres.trim(),
      email: form.email.trim(),
      empresa: form.empresa.trim(),
      dns: form.dns.trim(),
      estado: form.estado,
    })
    router.push('/clientes')
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err?.data?.message ?? 'Fallo al crear el cliente',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <!-- Encabezado -->
    <div class="flex items-center gap-3">
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/clientes"
      />
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">Nuevo cliente</h1>
        <p class="text-sm text-muted mt-0.5">Completa los datos para registrar un cliente</p>
      </div>
    </div>

    <!-- Formulario -->
    <div class="max-w-2xl flex flex-col gap-4">
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

      <div class="flex justify-end gap-2 pt-2">
        <UButton
          color="neutral"
          variant="outline"
          label="Cancelar"
          to="/clientes"
        />
        <UButton
          label="Crear cliente"
          icon="i-lucide-save"
          :loading="loading"
          @click="onSubmit"
        />
      </div>
    </div>
  </div>
</template>
