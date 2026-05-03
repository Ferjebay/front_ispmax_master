<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Plan } from '~/interfaces/plan.interface'

definePageMeta({ middleware: 'auth' })

const { planes, loading, total, page, limit, loadPlanes, removePlan, restorePlan } = usePlan()

const columns: TableColumn<Plan>[] = [
  { accessorKey: 'nombre', header: 'Nombre' },
  { accessorKey: 'proyecto', header: 'Proyecto' },
  { accessorKey: 'precio', header: 'Precio' },
  { accessorKey: 'max_clients', header: 'Máx. clientes' },
  { accessorKey: 'estado', header: 'Estado' },
  { accessorKey: 'actions', header: 'Acciones' },
]

onMounted(() => loadPlanes())
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">Planes</h1>
        <p class="text-sm text-muted mt-0.5">Gestiona los planes del sistema</p>
      </div>

      <UButton
        icon="i-lucide-plus"
        label="Agregar plan"
        to="/planes/crear"
      />
    </div>

    <UTable :data="planes" :columns="columns" :loading="loading">
      <template #proyecto-cell="{ row }">
        <span :class="!row.original.proyecto ? 'text-muted' : ''">
          {{ row.original.proyecto?.nombre || '—' }}
        </span>
      </template>

      <template #precio-cell="{ row }">
        <span>${{ row.original.precio.toLocaleString() }}</span>
      </template>

      <template #estado-cell="{ row }">
        <UBadge
          :color="row.original.estado ? 'success' : 'error'"
          variant="subtle"
        >
          {{ row.original.estado ? 'Activo' : 'Inactivo' }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex gap-2">
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="sm"
            :to="`/planes/${row.original.id}/editar`"
          />
          <UButton
            v-if="row.original.estado"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            @click="removePlan(row.original.id)"
          />
          <UButton
            v-else
            icon="i-lucide-rotate-ccw"
            color="success"
            variant="ghost"
            size="sm"
            @click="restorePlan(row.original.id)"
          />
        </div>
      </template>
    </UTable>

    <div class="flex justify-end">
      <UPagination
        v-model:page="page"
        :total="total"
        :items-per-page="limit"
        @update:page="loadPlanes"
      />
    </div>
  </div>
</template>
