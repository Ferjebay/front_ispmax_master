<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import type { Role } from '~/composables/useRole'

definePageMeta({ middleware: 'auth' })

const { roles, loading, total, page, limit, loadRoles, removeRole, restoreRole } = useRole()

const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedRole = ref<Role | null>(null)

const columns: TableColumn<Role>[] = [
  { accessorKey: 'nombre', header: 'Nombre' },
  { accessorKey: 'descripcion', header: 'Descripción' },
  { accessorKey: 'status', header: 'Estado' },
  { accessorKey: 'actions', header: 'Acciones' },
]

const openCreate = () => {
  selectedRole.value = null
  modalMode.value = 'create'
  modalOpen.value = true
}

const openEdit = (row: Row<Role>) => {
  selectedRole.value = row.original
  modalMode.value = 'edit'
  modalOpen.value = true
}

onMounted(() => loadRoles())
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold text-highlighted">Roles</h1>
      <UButton icon="i-lucide-plus" label="Agregar rol" @click="openCreate" />
    </div>

    <UTable :data="roles" :columns="columns" :loading="loading">
      <template #descripcion-cell="{ row }">
        <span :class="!row.original.descripcion ? 'text-muted' : ''">
          {{ row.original.descripcion || '-------' }}
        </span>
      </template>

      <template #status-cell="{ row }">
        <UBadge :color="row.original.estado ? 'success' : 'error'" variant="subtle">
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
            @click="openEdit(row)"
          />
          <UButton
            v-if="row.original.estado"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            @click="removeRole(row.original.id)"
          />
          <UButton
            v-else
            icon="i-lucide-rotate-ccw"
            color="success"
            variant="ghost"
            size="sm"
            @click="restoreRole(row.original.id)"
          />
        </div>
      </template>
    </UTable>

    <div class="flex justify-end mt-4">
      <UPagination
        v-model:page="page"
        :total="total"
        :items-per-page="limit"
        @update:page="loadRoles"
      />
    </div>
  </div>

  <RolesFormRole
    :open="modalOpen"
    :mode="modalMode"
    :role="selectedRole"
    @close="modalOpen = false"
    @refresh="loadRoles()"
  />
</template>
