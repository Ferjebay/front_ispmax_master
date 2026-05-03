<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Cliente } from '~/interfaces/cliente.interface'

definePageMeta({ middleware: 'auth' })

const { clientes, loading, total, page, limit, loadClientes, removeCliente, restoreCliente } = useCliente()

interface FormClienteRef {
  open: (mode: 'create' | 'edit', cliente?: Cliente) => void
  close: () => void
}

const formRef = ref<FormClienteRef>()

const columns: TableColumn<Cliente>[] = [
  { accessorKey: 'identificacion', header: 'Identificación' },
  { accessorKey: 'nombres', header: 'Nombres' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'empresa', header: 'Empresa' },
  { accessorKey: 'dns', header: 'DNS' },
  { accessorKey: 'estado', header: 'Estado' },
  { accessorKey: 'actions', header: 'Acciones' },
]

onMounted(() => loadClientes())
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <!-- Encabezado -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">Clientes</h1>
        <p class="text-sm text-muted mt-0.5">Gestiona los clientes del sistema</p>
      </div>

      <UButton
        icon="i-lucide-plus"
        label="Agregar cliente"
        to="/clientes/crear"
      />
    </div>

    <!-- Tabla -->
    <UTable :data="clientes" :columns="columns" :loading="loading">
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
            @click="removeCliente(row.original.id)"
          />
          <UButton
            v-else
            icon="i-lucide-rotate-ccw"
            color="success"
            variant="ghost"
            size="sm"
            @click="restoreCliente(row.original.id)"
          />
        </div>
      </template>
    </UTable>

    <div class="flex justify-end">
      <UPagination
        v-model:page="page"
        :total="total"
        :items-per-page="limit"
        @update:page="loadClientes"
      />
    </div>
  </div>

  <ClientesFormCliente ref="formRef" @refresh="loadClientes" />
</template>
