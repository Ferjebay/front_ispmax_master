<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Cliente, UpdateClientePayload, Suscripcion, HistorialPago } from '~/interfaces/cliente.interface'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string

const { updateCliente } = useCliente()
const toast = useToast()
const saving = ref(false)

const { data: cliente, pending, error } = await useFetch<Cliente>(`/api/clientes/${id}`)

const form = reactive<UpdateClientePayload>({
  identificacion: '',
  nombres: '',
  email: '',
  empresa: '',
  estado: true,
})

watch(cliente, (val) => {
  if (!val) return
  form.identificacion = val.identificacion
  form.nombres = val.nombres
  form.email = val.email
  form.empresa = val.empresa
  form.estado = val.estado
}, { immediate: true })

const validate = (): string | null => {
  if ((form.identificacion ?? '').trim().length < 5) return 'La identificación debe tener al menos 5 caracteres'
  if ((form.nombres ?? '').trim().length < 2) return 'El nombre debe tener al menos 2 caracteres'
  if (!(form.email ?? '').trim()) return 'El email es requerido'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email ?? '')) return 'El email no tiene un formato válido'
  if ((form.empresa ?? '').trim().length < 2) return 'La empresa debe tener al menos 2 caracteres'
  return null
}

const onSave = async () => {
  const error = validate()
  if (error) {
    toast.add({ title: error, color: 'error' })
    return
  }

  saving.value = true
  try {
    await updateCliente(id, {
      identificacion: form.identificacion?.trim(),
      nombres: form.nombres?.trim(),
      email: form.email?.trim(),
      empresa: form.empresa?.trim(),
      estado: form.estado,
    })
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err?.data?.message ?? 'Fallo al guardar el cliente',
      color: 'error',
    })
  } finally {
    saving.value = false
  }
}

const tabs = [
  { label: 'Información', slot: 'info' },
  { label: 'Suscripciones', slot: 'subscriptions' },
  { label: 'Historial de pago', slot: 'payments' },
]

const suscripcionColumns: TableColumn<Suscripcion>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'plan_id', header: 'Plan' },
  { accessorKey: 'costo', header: 'Costo' },
  { accessorKey: 'descuento', header: 'Descuento' },
  { accessorKey: 'tipo_periodo', header: 'Tipo período' },
  { accessorKey: 'periodo_meses', header: 'Meses' },
  { accessorKey: 'estado', header: 'Estado' },
  { accessorKey: 'created_at', header: 'Creado' },
]

const pagoColumns: TableColumn<HistorialPago>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'suscripcion_id', header: 'Suscripción' },
  { accessorKey: 'monto', header: 'Monto' },
  { accessorKey: 'numero_ciclo', header: 'Ciclo' },
  { accessorKey: 'estado', header: 'Estado' },
  { accessorKey: 'fecha_inicio', header: 'Inicio' },
  { accessorKey: 'fecha_fin', header: 'Fin' },
  { accessorKey: 'paid_at', header: 'Pagado' },
  { accessorKey: 'referencia_pago', header: 'Referencia' },
]

const formatDate = (val: string | null) =>
  val ? new Date(val).toLocaleDateString('es-EC') : '—'
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
      <div v-if="pending">
        <div class="h-6 w-40 bg-muted animate-pulse rounded" />
        <div class="h-4 w-24 bg-muted animate-pulse rounded mt-1" />
      </div>
      <div v-else>
        <h1 class="text-2xl font-semibold text-highlighted">
          {{ cliente?.nombres ?? 'Cliente' }}
        </h1>
        <p class="text-sm text-muted mt-0.5">{{ cliente?.identificacion }}</p>
      </div>
    </div>

    <!-- Error -->
    <UAlert
      v-if="error"
      color="error"
      title="No se pudo cargar el cliente"
      :description="error.message"
    />

    <!-- Tabs -->
    <UTabs v-else :items="tabs" class="w-full">
      <template #info>
        <div class="max-w-2xl flex flex-col gap-4 pt-4">
          <template v-if="pending">
            <div v-for="i in 4" :key="i" class="h-10 bg-muted animate-pulse rounded" />
          </template>

          <template v-else>
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

            <UFormField label="Estado">
              <UToggle v-model="form.estado" />
            </UFormField>

            <div class="flex justify-end gap-2 pt-2">
              <UButton
                color="neutral"
                variant="outline"
                label="Cancelar"
                to="/clientes"
              />
              <UButton
                label="Guardar cambios"
                icon="i-lucide-save"
                :loading="saving"
                @click="onSave"
              />
            </div>
          </template>
        </div>
      </template>

      <template #subscriptions>
        <div class="pt-4">
          <template v-if="pending">
            <div v-for="i in 3" :key="i" class="h-10 bg-muted animate-pulse rounded mb-2" />
          </template>
          <template v-else-if="!cliente?.suscripciones?.length">
            <p class="text-sm text-muted">No hay suscripciones registradas.</p>
          </template>
          <template v-else>
            <UTable :data="cliente.suscripciones" :columns="suscripcionColumns" class="w-full">
              <template #id-cell="{ row }">
                <span class="font-mono text-xs">{{ row.original.id.slice(0, 8) }}...</span>
              </template>
              <template #plan_id-cell="{ row }">
                <span class="font-mono text-xs">{{ row.original.plan_id.slice(0, 8) }}...</span>
              </template>
              <template #costo-cell="{ row }">
                ${{ row.original.costo }}
              </template>
              <template #descuento-cell="{ row }">
                {{ row.original.descuento ? `$${row.original.descuento}` : '—' }}
              </template>
              <template #estado-cell="{ row }">
                <UBadge
                  :color="row.original.estado === 'activo' ? 'success' : 'warning'"
                  variant="subtle"
                >
                  {{ row.original.estado }}
                </UBadge>
              </template>
              <template #created_at-cell="{ row }">
                {{ formatDate(row.original.created_at) }}
              </template>
            </UTable>
          </template>
        </div>
      </template>

      <template #payments>
        <div class="pt-4">
          <template v-if="pending">
            <div v-for="i in 3" :key="i" class="h-10 bg-muted animate-pulse rounded mb-2" />
          </template>
          <template v-else-if="!cliente?.historial_pagos?.length">
            <p class="text-sm text-muted">No hay historial de pagos registrado.</p>
          </template>
          <template v-else>
            <UTable :data="cliente.historial_pagos" :columns="pagoColumns" class="w-full">
              <template #id-cell="{ row }">
                <span class="font-mono text-xs">{{ row.original.id.slice(0, 8) }}...</span>
              </template>
              <template #suscripcion_id-cell="{ row }">
                <span class="font-mono text-xs">{{ row.original.suscripcion_id.slice(0, 8) }}...</span>
              </template>
              <template #monto-cell="{ row }">
                {{ row.original.monto ? `$${row.original.monto}` : '—' }}
              </template>
              <template #numero_ciclo-cell="{ row }">
                {{ row.original.numero_ciclo ?? '—' }}
              </template>
              <template #estado-cell="{ row }">
                {{ row.original.estado ?? '—' }}
              </template>
              <template #fecha_inicio-cell="{ row }">
                {{ formatDate(row.original.fecha_inicio) }}
              </template>
              <template #fecha_fin-cell="{ row }">
                {{ formatDate(row.original.fecha_fin) }}
              </template>
              <template #paid_at-cell="{ row }">
                {{ formatDate(row.original.paid_at) }}
              </template>
              <template #referencia_pago-cell="{ row }">
                {{ row.original.referencia_pago ?? '—' }}
              </template>
            </UTable>
          </template>
        </div>
      </template>
    </UTabs>
  </div>
</template>
