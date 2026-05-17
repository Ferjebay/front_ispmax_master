<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Token } from '~/interfaces/token.interface'

definePageMeta({ middleware: 'auth' })

const { tokens, loading, total, page, limit, loadTokens, deactivateToken, removeToken } = useToken()

const estadoColor: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  activo: 'success',
  en_uso: 'info',
  inactivo: 'warning',
  expirado: 'error',
}

const columns: TableColumn<Token>[] = [
  { accessorKey: 'tipo', header: 'Tipo' },
  { accessorKey: 'tipo_periodo', header: 'Período' },
  { accessorKey: 'periodo_meses', header: 'Meses' },
  { accessorKey: 'costo', header: 'Costo' },
  { accessorKey: 'estado', header: 'Estado' },
  { accessorKey: 'expires_at', header: 'Vence' },
  { accessorKey: 'actions', header: 'Acciones' },
]

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString('es-EC') : '—'

onMounted(() => loadTokens())
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">Tokens</h1>
        <p class="text-sm text-muted mt-0.5">Gestiona los tokens de activación y API</p>
      </div>

      <UButton
        icon="i-lucide-plus"
        label="Crear token"
        to="/tokens/crear"
      />
    </div>

    <UTable :data="tokens" :columns="columns" :loading="loading">
      <template #tipo-cell="{ row }">
        <UBadge color="neutral" variant="subtle">
          {{ row.original.tipo === 'api_token' ? 'API Token' : 'Activación' }}
        </UBadge>
      </template>

      <template #tipo_periodo-cell="{ row }">
        <span class="capitalize">{{ row.original.tipo_periodo }}</span>
      </template>

      <template #costo-cell="{ row }">
        ${{ row.original.costo.toFixed(2) }}
      </template>

      <template #estado-cell="{ row }">
        <UBadge
          :color="estadoColor[row.original.estado] ?? 'neutral'"
          variant="subtle"
          class="capitalize"
        >
          {{ row.original.estado }}
        </UBadge>
      </template>

      <template #expires_at-cell="{ row }">
        {{ formatDate(row.original.expires_at) }}
      </template>

      <template #actions-cell="{ row }">
        <div class="flex gap-2">
          <UButton
            v-if="row.original.estado === 'activo' || row.original.estado === 'en_uso'"
            icon="i-lucide-power-off"
            color="warning"
            variant="ghost"
            size="sm"
            title="Desactivar"
            @click="deactivateToken(row.original.id)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            title="Eliminar"
            @click="removeToken(row.original.id)"
          />
        </div>
      </template>
    </UTable>

    <div class="flex justify-end">
      <UPagination
        v-model:page="page"
        :total="total"
        :items-per-page="limit"
        @update:page="loadTokens"
      />
    </div>
  </div>
</template>
