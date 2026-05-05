<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Log } from '~/interfaces/log.interface'

definePageMeta({ middleware: 'auth' })

const { logs, loading, total, page, limit, loadLogs } = useLog()

const columns: TableColumn<Log>[] = [
  { accessorKey: 'usuario', header: 'Usuario' },
  { accessorKey: 'accion', header: 'Acción' },
  { accessorKey: 'modulo', header: 'Módulo' },
  { accessorKey: 'descripcion', header: 'Descripción' },
  { accessorKey: 'ip', header: 'IP' },
  { accessorKey: 'createdAt', header: 'Fecha' },
]

const accionColor: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  CREATE: 'success',
  UPDATE: 'warning',
  DELETE: 'error',
  LOGIN: 'info',
  LOGOUT: 'neutral',
}

function getAccionColor(accion: string) {
  return accionColor[accion?.toUpperCase()] ?? 'neutral'
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

onMounted(() => loadLogs())
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <div>
      <h1 class="text-2xl font-semibold text-highlighted">Logs</h1>
      <p class="text-sm text-muted mt-0.5">Historial de actividad del sistema</p>
    </div>

    <UTable :data="logs" :columns="columns" :loading="loading">
      <template #usuario-cell="{ row }">
        <span :class="!row.original.usuario ? 'text-muted' : ''">
          {{ row.original.usuario?.nombres ?? '—' }}
        </span>
      </template>

      <template #accion-cell="{ row }">
        <UBadge
          :color="getAccionColor(row.original.accion)"
          variant="subtle"
        >
          {{ row.original.accion }}
        </UBadge>
      </template>

      <template #descripcion-cell="{ row }">
        <span class="text-sm text-muted">{{ row.original.descripcion }}</span>
      </template>

      <template #ip-cell="{ row }">
        <span class="font-mono text-sm">{{ row.original.ip ?? '—' }}</span>
      </template>

      <template #createdAt-cell="{ row }">
        {{ formatDate(row.original.createdAt) }}
      </template>
    </UTable>

    <div class="flex justify-end">
      <UPagination
        v-model:page="page"
        :total="total"
        :items-per-page="limit"
        @update:page="loadLogs"
      />
    </div>
  </div>
</template>
