<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Device } from '~/interfaces/device.interface'

definePageMeta({ middleware: 'auth' })

const { dispositivos, loading, loadDispositivos } = useDispositivo()

const columns: TableColumn<Device>[] = [
  { accessorKey: 'ip', header: 'IP' },
  { accessorKey: 'tipo', header: 'Tipo' },
  { accessorKey: 'deviceName', header: 'Nombre' },
  { accessorKey: 'lastUsed', header: 'Último uso' },
  { accessorKey: 'created_at', header: 'Registrado' },
]

function deviceType(userAgent: string): 'Móvil' | 'Tablet' | 'Escritorio' {
  if (/mobile/i.test(userAgent)) return 'Móvil'
  if (/tablet/i.test(userAgent)) return 'Tablet'
  return 'Escritorio'
}

function deviceIcon(userAgent: string) {
  const type = deviceType(userAgent)
  if (type === 'Móvil') return 'i-lucide-smartphone'
  if (type === 'Tablet') return 'i-lucide-tablet'
  return 'i-lucide-monitor'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => loadDispositivos())
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <div>
      <h1 class="text-2xl font-semibold text-highlighted">Dispositivos</h1>
      <p class="text-sm text-muted mt-0.5">Sesiones activas registradas en tu cuenta</p>
    </div>

    <UTable :data="dispositivos" :columns="columns" :loading="loading">
      <template #tipo-cell="{ row }">
        <div class="flex items-center gap-2">
          <UIcon :name="deviceIcon(row.original.userAgent)" class="size-4 text-muted shrink-0" />
          <span>{{ deviceType(row.original.userAgent) }}</span>
        </div>
      </template>

      <template #deviceName-cell="{ row }">
        <span :class="!row.original.deviceName ? 'text-muted' : ''">
          {{ row.original.deviceName || '—' }}
        </span>
      </template>

      <template #lastUsed-cell="{ row }">
        {{ formatDate(row.original.lastUsed) }}
      </template>

      <template #created_at-cell="{ row }">
        {{ formatDate(row.original.created_at) }}
      </template>
    </UTable>
  </div>
</template>
