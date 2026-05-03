<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Usuario } from '~/interfaces/usuario.interface'

definePageMeta({ middleware: 'auth' })

const { usuarios, loading, total, page, limit, loadUsuarios, removeUsuario } = useUsuario()

const columns: TableColumn<Usuario>[] = [
  { accessorKey: 'usuario', header: 'Usuario' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'celular', header: 'Celular' },
  { accessorKey: 'rol', header: 'Rol' },
  { accessorKey: 'estado', header: 'Estado' },
  { accessorKey: 'actions', header: 'Acciones' },
]

onMounted(() => loadUsuarios())
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <!-- Encabezado -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">Usuarios</h1>
        <p class="text-sm text-muted mt-0.5">Gestiona los usuarios del sistema</p>
      </div>

      <UButton
        icon="i-lucide-plus"
        label="Agregar usuario"
        to="/usuarios/crear"
      />
    </div>

    <!-- Tabla -->
    <UTable :data="usuarios" :columns="columns" :loading="loading">
      <template #celular-cell="{ row }">
        <span :class="!row.original.celular ? 'text-muted' : ''">
          {{ row.original.celular || '—' }}
        </span>
      </template>

      <template #rol-cell="{ row }">
        <span :class="!row.original.rol ? 'text-muted' : ''">
          {{ row.original.rol?.nombre || '—' }}
        </span>
      </template>

      <template #estado-cell="{ row }">
        <UBadge
          :color="row.original.isActive ? 'success' : 'error'"
          variant="subtle"
        >
          {{ row.original.isActive ? 'Activo' : 'Inactivo' }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex gap-2">
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="sm"
            :to="`/usuarios/${row.original.id}/editar`"
          />
          <UButton
            v-if="row.original.isActive"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            @click="removeUsuario(row.original.id)"
          />
        </div>
      </template>
    </UTable>

    <div class="flex justify-end">
      <UPagination
        v-model:page="page"
        :total="total"
        :items-per-page="limit"
        @update:page="loadUsuarios"
      />
    </div>
  </div>
</template>
