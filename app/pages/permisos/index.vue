<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import type { Permiso } from '~/interfaces/permiso.interface'

definePageMeta({ middleware: 'auth' })

const {
  permisos,
  loading,
  uploading,
  total,
  page,
  limit,
  openCreateModal,
  openEditModal,
  loadPermisos,
  removePermiso,
  restorePermiso,
  downloadTemplate,
  uploadBulk,
} = usePermiso()

const search = ref('')

const filteredPermisos = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return permisos.value
  return permisos.value.filter(p =>
    p.nombre?.toLowerCase().includes(q)
    || p.label?.toLowerCase().includes(q)
    || p.ruta?.toLowerCase().includes(q),
  )
})

const fileInputRef = ref<HTMLInputElement>()

const columns: TableColumn<Permiso>[] = [
  { accessorKey: 'nombre', header: 'Nombre' },
  { accessorKey: 'label', header: 'Label' },
  { accessorKey: 'ruta', header: 'Ruta' },
  { accessorKey: 'orden', header: 'Orden' },
  { accessorKey: 'visible_sidebar', header: 'Sidebar' },
  { accessorKey: 'estado', header: 'Estado' },
  { accessorKey: 'actions', header: 'Acciones' },
]

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  await uploadBulk(file)
  target.value = ''
}

onMounted(() => loadPermisos())
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <!-- Encabezado -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">Permisos</h1>
        <p class="text-sm text-muted mt-0.5">Gestiona los permisos del sistema</p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-download"
          color="neutral"
          variant="outline"
          label="Descargar plantilla"
          @click="downloadTemplate"
        />
        <UButton
          icon="i-lucide-upload"
          color="neutral"
          variant="outline"
          label="Importar Excel"
          :loading="uploading"
          @click="fileInputRef?.click()"
        />
        <UButton
          icon="i-lucide-plus"
          label="Agregar permiso"
          @click="openCreateModal"
        />

        <input
          ref="fileInputRef"
          type="file"
          accept=".xlsx,.xls"
          class="hidden"
          @change="handleFileUpload"
        />
      </div>
    </div>

    <!-- Buscador -->
    <UInput
      v-model="search"
      icon="i-lucide-search"
      placeholder="Buscar por nombre, label o ruta..."
      class="max-w-sm"
    />

    <!-- Tabla -->
    <UTable :data="filteredPermisos" :columns="columns" :loading="loading">
      <template #label-cell="{ row }">
        <span :class="!row.original.label ? 'text-muted' : ''">
          {{ row.original.label || '—' }}
        </span>
      </template>

      <template #ruta-cell="{ row }">
        <code
          v-if="row.original.ruta"
          class="text-xs bg-elevated px-1.5 py-0.5 rounded font-mono"
        >
          {{ row.original.ruta }}
        </code>
        <span v-else class="text-muted">—</span>
      </template>

      <template #orden-cell="{ row }">
        <span class="text-muted">{{ row.original.orden ?? '—' }}</span>
      </template>

      <template #visible_sidebar-cell="{ row }">
        <UBadge
          :color="row.original.visible_sidebar ? 'primary' : 'neutral'"
          variant="subtle"
        >
          {{ row.original.visible_sidebar ? 'Sí' : 'No' }}
        </UBadge>
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
            @click="openEditModal(row.original)"
          />
          <UButton
            v-if="row.original.estado"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            @click="removePermiso(row.original._id)"
          />
          <UButton
            v-else
            icon="i-lucide-rotate-ccw"
            color="success"
            variant="ghost"
            size="sm"
            @click="restorePermiso(row.original._id)"
          />
        </div>
      </template>
    </UTable>

    <div class="flex justify-end">
      <UPagination
        v-model:page="page"
        :total="total"
        :items-per-page="limit"
        @update:page="loadPermisos"
      />
    </div>
  </div>

  <!-- Modal: no necesita props, lee estado del composable internamente -->
  <PermisosFormPermiso @refresh="loadPermisos" />
</template>
