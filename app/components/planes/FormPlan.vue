<script setup lang="ts">
import type { Plan, CreatePlanPayload, UpdatePlanPayload, CampoAdicional, CampoTipo } from '~/interfaces/plan.interface'
import type { Proyecto } from '~/interfaces/proyecto.interface'

const props = defineProps<{
  mode: 'create' | 'edit'
  initialData?: Plan | null
}>()

const toast = useToast()
const { api } = useHelper()
const { createPlan, updatePlan } = usePlan()

const loading = ref(false)
const proyectos = ref<Proyecto[]>([])

// Esquema de campos (definido en el drawer)
const campos = ref<CampoAdicional[]>([])

// Valores de los campos dinámicos (llenados en el formulario)
const campoValues = reactive<Record<string, any>>({})

interface DrawerRef { open: () => void }
const drawerRef = ref<DrawerRef>()

// ── Formulario principal ───────────────────────────────────────────────────────
const buildEmptyForm = () => ({
  proyecto_id: '',
  vps_id: null as string | null,
  nombre: '',
  precio: 0,
  max_clients: 1,
  estado: true,
})

const form = reactive(buildEmptyForm())

const proyectoItems = computed(() =>
  proyectos.value.map((p) => ({ label: p.nombre, value: p.id })),
)

// ── Sincronización de valores al cambiar esquema ───────────────────────────────
// Cuando el usuario aplica cambios en el drawer, inicializa los nuevos campos
// y elimina los que ya no existen sin afectar los que permanecen.
watch(
  campos,
  (newCampos, oldCampos) => {
    const newKeys = new Set(newCampos.map((c) => c.key))

    // Eliminar valores de campos removidos
    if (oldCampos) {
      oldCampos.forEach((c) => {
        if (!newKeys.has(c.key)) delete campoValues[c.key]
      })
    }

    // Inicializar valores para campos nuevos
    newCampos.forEach((campo) => {
      if (!(campo.key in campoValues)) {
        campoValues[campo.key] = campo.type === 'checkbox' ? false : ''
      }
    })
  },
  { deep: true },
)

// ── Conversión campos_adiciones ↔ esquema + valores ───────────────────────────
const loadFromRecord = (record: Record<string, any>) => {
  const schemaList: CampoAdicional[] = []

  Object.entries(record).forEach(([key, val]) => {
    schemaList.push({
      key,
      label: val?.label ?? key,
      type: (val?.type as CampoTipo) ?? 'text',
      placeholder: val?.placeholder,
      options: Array.isArray(val?.options) ? val.options : undefined,
      required: val?.required ?? false,
    })
    // Inicializar valor: usa el guardado o el default del tipo
    const defaultVal = val?.type === 'checkbox' ? false : ''
    campoValues[key] = val?.value !== undefined ? val.value : defaultVal
  })

  campos.value = schemaList
}

const buildRecord = (): Record<string, any> => {
  return campos.value.reduce(
    (acc, campo) => {
      acc[campo.key] = {
        type: campo.type,
        label: campo.label,
        required: campo.required ?? false,
        value: campoValues[campo.key] ?? (campo.type === 'checkbox' ? false : ''),
        ...(campo.placeholder && { placeholder: campo.placeholder }),
        ...(campo.options && { options: campo.options }),
      }
      return acc
    },
    {} as Record<string, any>,
  )
}

// ── Carga de proyectos ─────────────────────────────────────────────────────────
const loadProyectos = async () => {
  try {
    const { data } = await api<{ data: Proyecto[] }>('proyectos', { params: { limit: 100 } })
    proyectos.value = data
  } catch {
    // no bloqueante
  }
}

// ── Inicialización ─────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadProyectos()

  if (props.mode === 'edit' && props.initialData) {
    const p = props.initialData
    form.proyecto_id = p.proyecto_id
    form.vps_id = p.vps_id ?? null
    form.nombre = p.nombre
    form.precio = p.precio
    form.max_clients = p.max_clients
    form.estado = p.estado

    if (p.campos_adiciones && Object.keys(p.campos_adiciones).length > 0) {
      loadFromRecord(p.campos_adiciones)
    }
  }
})

// ── Validación ─────────────────────────────────────────────────────────────────
const validate = (): boolean => {
  if (!form.proyecto_id) {
    toast.add({ title: 'Selecciona un proyecto', color: 'error' })
    return false
  }
  if (!form.nombre.trim() || form.nombre.trim().length < 2) {
    toast.add({ title: 'El nombre debe tener al menos 2 caracteres', color: 'error' })
    return false
  }
  if (Number(form.precio) < 0) {
    toast.add({ title: 'El precio no puede ser negativo', color: 'error' })
    return false
  }
  if (!Number.isInteger(Number(form.max_clients)) || Number(form.max_clients) < 1) {
    toast.add({ title: 'El máximo de clientes debe ser un entero mayor a 0', color: 'error' })
    return false
  }

  // Validar campos requeridos
  for (const campo of campos.value) {
    if (campo.required) {
      const val = campoValues[campo.key]
      const isEmpty =
        val === undefined ||
        val === null ||
        val === '' ||
        (campo.type === 'checkbox' && val === false)
      if (isEmpty) {
        toast.add({ title: `El campo "${campo.label}" es requerido`, color: 'error' })
        return false
      }
    }
  }

  return true
}

// ── Submit ─────────────────────────────────────────────────────────────────────
const onSubmit = async () => {
  if (!validate()) return

  loading.value = true
  try {
    const camposAdiciones = campos.value.length > 0 ? buildRecord() : undefined

    if (props.mode === 'create') {
      const payload: CreatePlanPayload = {
        proyecto_id: form.proyecto_id,
        nombre: form.nombre.trim(),
        precio: Number(form.precio),
        max_clients: Number(form.max_clients),
        ...(form.vps_id && { vps_id: form.vps_id }),
        ...(camposAdiciones && { campos_adiciones: camposAdiciones }),
      }
      await createPlan(payload)
    } else {
      const payload: UpdatePlanPayload = {
        proyecto_id: form.proyecto_id,
        nombre: form.nombre.trim(),
        precio: Number(form.precio),
        max_clients: Number(form.max_clients),
        estado: form.estado,
        ...(form.vps_id && { vps_id: form.vps_id }),
        campos_adiciones: camposAdiciones ?? {},
      }
      await updatePlan(props.initialData!.id, payload)
    }

    await navigateTo('/planes')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error?.data?.message ?? 'Fallo al guardar el plan',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <div class="flex flex-col gap-5">

      <!-- Proyecto -->
      <UFormField label="Proyecto" required>
        <USelect
          v-model="form.proyecto_id"
          :items="proyectoItems"
          placeholder="Selecciona un proyecto"
          class="w-full"
        />
      </UFormField>

      <!-- Nombre y VPS -->
      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Nombre del plan" required>
          <UInput
            v-model="form.nombre"
            placeholder="Ej: Plan Básico"
            class="w-full"
          />
        </UFormField>

        <UFormField label="VPS">
          <USelect
            v-model="form.vps_id"
            :items="[]"
            placeholder="Seleccionar VPS"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Precio y Máx. clientes -->
      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Precio" required>
          <UInput
            v-model.number="form.precio"
            type="number"
            :min="0"
            placeholder="0.00"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Máximo de clientes" required>
          <UInput
            v-model.number="form.max_clients"
            type="number"
            :min="1"
            placeholder="1"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Estado (solo en edición) -->
      <UFormField v-if="mode === 'edit'" label="Estado">
        <div class="flex items-center gap-3 pt-1.5">
          <USwitch v-model="form.estado" />
          <span class="text-sm text-muted">
            {{ form.estado ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
      </UFormField>

      <!-- ── Campos adicionales ─────────────────────────────────────────────── -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">Campos adicionales</p>
            <p class="text-xs text-muted">
              {{ campos.length ? `${campos.length} campo(s) configurado(s)` : 'Sin campos adicionales' }}
            </p>
          </div>
          <UButton
            icon="i-lucide-settings-2"
            :label="campos.length ? `Editar campos (${campos.length})` : 'Agregar campos'"
            size="sm"
            variant="soft"
            @click="drawerRef?.open()"
          />
        </div>

        <!-- Campos renderizados como inputs reales de Nuxt UI -->
        <PlanesCamposAdicionalesForm
          v-if="campos.length"
          :campos="campos"
          :values="campoValues"
        />

        <div
          v-else
          class="text-sm text-muted text-center py-4 border border-dashed rounded-lg"
        >
          Haz clic en "Agregar campos" para definir campos personalizados
        </div>
      </div>

      <!-- Acciones del formulario -->
      <div class="flex justify-end gap-2 pt-2">
        <UButton
          color="neutral"
          variant="outline"
          label="Cancelar"
          to="/planes"
        />
        <UButton
          :label="mode === 'create' ? 'Crear plan' : 'Guardar cambios'"
          :loading="loading"
          @click="onSubmit"
        />
      </div>
    </div>
  </div>

  <!-- Drawer de configuración de campos -->
  <PlanesDrawerCamposAdicionales
    ref="drawerRef"
    v-model="campos"
  />
</template>
