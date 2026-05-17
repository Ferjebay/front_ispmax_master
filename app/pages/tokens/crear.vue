<script setup lang="ts">
import type { CreateTokenPayload } from '~/interfaces/token.interface'
import type { Cliente } from '~/interfaces/cliente.interface'
import type { Plan } from '~/interfaces/plan.interface'

definePageMeta({ middleware: 'auth' })

const { createToken } = useToken()
const toast = useToast()
const router = useRouter()
const loading = ref(false)

const clientes = ref<Cliente[]>([])
const planes = ref<Plan[]>([])

const form = reactive<CreateTokenPayload>({
  cliente_id: '',
  plan_id: '',
  tipo_periodo: 'mensual',
  periodo_meses: 1,
  costo: 0,
  descuento: undefined,
  periodo_meses_gracias: undefined,
  tipo: 'activacion',
  expires_at: undefined,
})

const clienteItems = computed(() =>
  clientes.value.map((c) => ({ label: `${c.nombres} — ${c.empresa}`, value: c.id })),
)

const planItems = computed(() =>
  planes.value.map((p) => ({ label: p.nombre, value: p.id })),
)

const tipoPeriodoItems = [
  { label: 'Mensual', value: 'mensual' },
  { label: 'Semestral', value: 'semestral' },
  { label: 'Anual', value: 'anual' },
]

const tipoTokenItems = [
  { label: 'Activación', value: 'activacion' },
  { label: 'API Token', value: 'api_token' },
]

const validate = (): string | null => {
  if (!form.cliente_id) return 'Selecciona un cliente'
  if (!form.plan_id) return 'Selecciona un plan'
  if (!form.periodo_meses || form.periodo_meses < 1) return 'El período debe ser al menos 1 mes'
  if (form.costo < 0) return 'El costo no puede ser negativo'
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
    const payload: CreateTokenPayload = {
      cliente_id: form.cliente_id,
      plan_id: form.plan_id,
      tipo_periodo: form.tipo_periodo,
      periodo_meses: Number(form.periodo_meses),
      costo: Number(form.costo),
      tipo: form.tipo,
    }
    if (form.descuento !== undefined && form.descuento !== null) payload.descuento = Number(form.descuento)
    if (form.periodo_meses_gracias !== undefined && form.periodo_meses_gracias !== null) payload.periodo_meses_gracias = Number(form.periodo_meses_gracias)
    if (form.expires_at) payload.expires_at = form.expires_at

    await createToken(payload)
    router.push('/tokens')
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err?.data?.message ?? 'Fallo al crear el token',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const [clientesRes, planesRes] = await Promise.all([
    $fetch<{ data: Cliente[] }>('/api/clientes', { params: { limit: 100 } }),
    $fetch<{ data: Plan[] }>('/api/planes', { params: { limit: 100 } }),
  ])
  clientes.value = clientesRes.data
  planes.value = planesRes.data
})
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <div class="flex items-center gap-3">
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/tokens"
      />
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">Nuevo token</h1>
        <p class="text-sm text-muted mt-0.5">Crea un token de activación o API para un cliente</p>
      </div>
    </div>

    <div class="max-w-2xl flex flex-col gap-4">
      <UFormField label="Cliente" required>
        <USelect
          v-model="form.cliente_id"
          :items="clienteItems"
          value-key="value"
          label-key="label"
          placeholder="Selecciona un cliente"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Plan" required>
        <USelect
          v-model="form.plan_id"
          :items="planItems"
          value-key="value"
          label-key="label"
          placeholder="Selecciona un plan"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Tipo de token" required>
        <USelect
          v-model="form.tipo"
          :items="tipoTokenItems"
          value-key="value"
          label-key="label"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Período" required>
        <USelect
          v-model="form.tipo_periodo"
          :items="tipoPeriodoItems"
          value-key="value"
          label-key="label"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Meses del período" required>
        <UInput
          v-model="form.periodo_meses"
          type="number"
          :min="1"
          placeholder="Ej: 1"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Costo" required>
        <UInput
          v-model="form.costo"
          type="number"
          :min="0"
          :step="0.01"
          placeholder="Ej: 29.99"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Descuento (opcional)">
        <UInput
          v-model="form.descuento"
          type="number"
          :min="0"
          :step="0.01"
          placeholder="Ej: 5.00"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Meses de gracia (opcional)">
        <UInput
          v-model="form.periodo_meses_gracias"
          type="number"
          :min="0"
          placeholder="Ej: 1"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Fecha de expiración (opcional)">
        <UInput
          v-model="form.expires_at"
          type="date"
          class="w-full"
        />
      </UFormField>

      <div class="flex justify-end gap-2 pt-2">
        <UButton
          color="neutral"
          variant="outline"
          label="Cancelar"
          to="/tokens"
        />
        <UButton
          label="Crear token"
          icon="i-lucide-save"
          :loading="loading"
          @click="onSubmit"
        />
      </div>
    </div>
  </div>
</template>
