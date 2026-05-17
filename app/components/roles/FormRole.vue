<script setup lang="ts">
import type { Role } from '~/composables/useRole'
import type { Permiso } from '~/interfaces/permiso.interface'

const props = defineProps<{ open: boolean; role?: Role | null; mode: 'create' | 'edit' }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'refresh'): void }>()

const { api } = useHelper()
const toast = useToast()
const loading = ref(false)
const loadingPermisos = ref(false)

const form = reactive({ nombre: '', permisos: [] as string[] })
const allPermisos = ref<Permiso[]>([])
const searchPermiso = ref('')

const groupedPermisos = computed(() => {
  const filter = searchPermiso.value.toLowerCase()
  const filtered = filter
    ? allPermisos.value.filter(p =>
        (p.label ?? p.nombre).toLowerCase().includes(filter) ||
        p.nombre.toLowerCase().includes(filter),
      )
    : allPermisos.value

  const groups: Record<string, Permiso[]> = {}
  for (const p of filtered) {
    const prefix = p.nombre.split('.')[0] ?? 'otros'
    if (!groups[prefix]) groups[prefix] = []
    groups[prefix].push(p)
  }
  return groups
})

const togglePermiso = (id: string) => {
  const idx = form.permisos.indexOf(id)
  if (idx === -1) form.permisos.push(id)
  else form.permisos.splice(idx, 1)
}

const toggleGroup = (permisoGroup: Permiso[]) => {
  const ids = permisoGroup.map(p => p._id)
  const allSelected = ids.every(id => form.permisos.includes(id))
  if (allSelected) {
    form.permisos = form.permisos.filter(id => !ids.includes(id))
  } else {
    for (const id of ids) {
      if (!form.permisos.includes(id)) form.permisos.push(id)
    }
  }
}

const isGroupSelected = (permisoGroup: Permiso[]) =>
  permisoGroup.every(p => form.permisos.includes(p._id))

const isGroupIndeterminate = (permisoGroup: Permiso[]) => {
  const selected = permisoGroup.filter(p => form.permisos.includes(p._id)).length
  return selected > 0 && selected < permisoGroup.length
}

const loadAllPermisos = async () => {
  loadingPermisos.value = true
  try {
    const response = await $fetch<{ data: Permiso[]; total: number }>('/api/permisos', {
      params: { limit: 500 },
    })
    allPermisos.value = response.data
  } catch {
    allPermisos.value = []
  } finally {
    loadingPermisos.value = false
  }
}

watch(
  () => props.open,
  async (val) => {
    if (!val) return

    searchPermiso.value = ''
    await loadAllPermisos()

    if (props.mode === 'edit' && props.role) {
      form.nombre = props.role.nombre
      try {
        const roleDetail = await api<Role & { permisos: (string | Permiso)[] }>(`roles/${props.role.id}`)
        const raw = roleDetail.permisos ?? []
        form.permisos = raw.map((p: string | Permiso) =>
          typeof p === 'string' ? p : p._id,
        )
      } catch {
        form.permisos = []
      }
    } else {
      form.nombre = ''
      form.permisos = []
    }
  },
)

const onSubmit = async () => {
  if (!form.nombre.trim()) {
    toast.add({ title: 'El nombre es requerido', color: 'error' })
    return
  }

  loading.value = true
  try {
    const body = {
      nombre: form.nombre.trim(),
      permisos: form.permisos,
    }
    if (props.mode === 'create') {
      await api('roles', { method: 'POST', body })
    } else {
      await api(`roles/${props.role!.id}`, { method: 'PATCH', body })
    }
    toast.add({ title: `Rol ${props.mode === 'create' ? 'creado' : 'editado'} exitosamente.` })
    emit('refresh')
    emit('close')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error?.data?.message ?? 'Fallo al guardar el rol',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    :open="open"
    :title="mode === 'create' ? 'Crear rol' : 'Editar rol'"
    :ui="{ content: 'max-w-2xl' }"
    @close="emit('close')"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Nombre" required>
          <UInput v-model="form.nombre" placeholder="Nombre del rol" class="w-full" />
        </UFormField>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Permisos</span>
            <span class="text-xs text-muted">
              {{ form.permisos.length }} de {{ allPermisos.length }} seleccionados
            </span>
          </div>

          <UInput
            v-model="searchPermiso"
            placeholder="Buscar permiso..."
            icon="i-lucide-search"
            size="sm"
            class="w-full mb-2"
          />

          <div
            class="border border-default rounded-lg overflow-y-auto"
            style="max-height: 280px"
          >
            <div v-if="loadingPermisos" class="flex justify-center items-center py-8">
              <UIcon name="i-lucide-loader-2" class="animate-spin text-muted" size="20" />
            </div>

            <div
              v-else-if="Object.keys(groupedPermisos).length === 0"
              class="py-8 text-center text-sm text-muted"
            >
              No se encontraron permisos
            </div>

            <template v-else v-for="(permisoGroup, groupName) in groupedPermisos" :key="groupName">
              <div
                class="flex items-center gap-2 px-3 py-2 bg-elevated border-b border-default cursor-pointer select-none"
                @click="toggleGroup(permisoGroup)"
              >
                <UCheckbox
                  :model-value="isGroupSelected(permisoGroup)"
                  :indeterminate="isGroupIndeterminate(permisoGroup)"
                  @click.stop
                  @update:model-value="toggleGroup(permisoGroup)"
                />
                <span class="text-xs font-semibold text-muted uppercase tracking-wide">
                  {{ groupName }}
                </span>
                <span class="ml-auto text-xs text-muted">
                  {{ permisoGroup.filter(p => form.permisos.includes(p._id)).length }}/{{ permisoGroup.length }}
                </span>
              </div>

              <div
                v-for="p in permisoGroup"
                :key="p._id"
                class="flex items-center gap-3 px-3 py-2 hover:bg-elevated cursor-pointer border-b border-default last:border-0"
                @click="togglePermiso(p._id)"
              >
                <UCheckbox
                  :model-value="form.permisos.includes(p._id)"
                  @click.stop
                  @update:model-value="togglePermiso(p._id)"
                />
                <div class="flex flex-col min-w-0">
                  <span class="text-sm truncate">{{ p.label ?? p.nombre }}</span>
                  <span v-if="p.label" class="text-xs text-muted truncate">{{ p.nombre }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Cancelar" @click="emit('close')" />
        <UButton
          :label="mode === 'create' ? 'Crear' : 'Guardar'"
          :loading="loading"
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>
