<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Proyecto } from '~/interfaces/proyecto.interface'

definePageMeta({ middleware: 'auth' })

const { proyectos, loading, total, page, limit, loadProyectos, removeProyecto } = useProyecto()

interface FormProyectoRef {
  open: (mode: 'create' | 'edit', proyecto?: Proyecto) => void
  close: () => void
}

const formRef = ref<FormProyectoRef>()

const columns: TableColumn<Proyecto>[] = [
  { accessorKey: 'nombre', header: 'Nombre' },
  { accessorKey: 'sku', header: 'SKU' },
  { accessorKey: 'estado', header: 'Estado' },
  { accessorKey: 'actions', header: 'Acciones' },
]

onMounted(() => loadProyectos())
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <!-- Encabezado -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">Proyectos</h1>
        <p class="text-sm text-muted mt-0.5">Gestiona los proyectos del sistema</p>
      </div>

      <UButton
        icon="i-lucide-plus"
        label="Agregar proyecto"
        @click="formRef?.open('create')"
      />
    </div>

    <!-- Tabla -->
    <UTable :data="proyectos" :columns="columns" :loading="loading">
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
            @click="formRef?.open('edit', row.original)"
          />
          <UButton
            v-if="row.original.estado"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            @click="removeProyecto(row.original.id)"
          />
        </div>
      </template>
    </UTable>

    <div class="flex justify-end">
      <UPagination
        v-model:page="page"
        :total="total"
        :items-per-page="limit"
        @update:page="loadProyectos"
      />
    </div>
  </div>

  <ProyectosFormProyecto ref="formRef" @refresh="loadProyectos" />
</template>
