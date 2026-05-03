<script setup lang="ts">
import type { CampoAdicional, CampoTipo } from '~/interfaces/plan.interface'

const props = defineProps<{
  modelValue: CampoAdicional[]
}>()

const emit = defineEmits<{
  'update:modelValue': [campos: CampoAdicional[]]
}>()

const toast = useToast()
const isOpen = ref(false)
const localCampos = ref<CampoAdicional[]>([])
const editingIndex = ref<number | null>(null)

// ── Tipos de campo ─────────────────────────────────────────────────────────────
const FIELD_TYPES: { label: string; value: CampoTipo; icon: string }[] = [
  { label: 'Texto corto', value: 'text', icon: 'i-lucide-type' },
  { label: 'Email', value: 'email', icon: 'i-lucide-mail' },
  { label: 'Número', value: 'number', icon: 'i-lucide-hash' },
  { label: 'Teléfono', value: 'tel', icon: 'i-lucide-phone' },
  { label: 'URL', value: 'url', icon: 'i-lucide-link' },
  { label: 'Fecha', value: 'date', icon: 'i-lucide-calendar' },
  { label: 'Fecha y hora', value: 'datetime-local', icon: 'i-lucide-calendar-clock' },
  { label: 'Contraseña', value: 'password', icon: 'i-lucide-lock' },
  { label: 'Texto largo', value: 'textarea', icon: 'i-lucide-align-left' },
  { label: 'Selector (select)', value: 'select', icon: 'i-lucide-chevrons-up-down' },
  { label: 'Casilla (checkbox)', value: 'checkbox', icon: 'i-lucide-check-square' },
  { label: 'Opciones (radio)', value: 'radio', icon: 'i-lucide-circle-dot' },
]

const FIELD_TYPE_LABELS: Record<CampoTipo, string> = {
  text: 'Texto',
  email: 'Email',
  number: 'Número',
  tel: 'Teléfono',
  url: 'URL',
  date: 'Fecha',
  'datetime-local': 'Fecha y hora',
  password: 'Contraseña',
  textarea: 'Texto largo',
  select: 'Selector',
  checkbox: 'Casilla',
  radio: 'Opciones',
}

const FIELD_TYPE_ICONS: Record<CampoTipo, string> = {
  text: 'i-lucide-type',
  email: 'i-lucide-mail',
  number: 'i-lucide-hash',
  tel: 'i-lucide-phone',
  url: 'i-lucide-link',
  date: 'i-lucide-calendar',
  'datetime-local': 'i-lucide-calendar-clock',
  password: 'i-lucide-lock',
  textarea: 'i-lucide-align-left',
  select: 'i-lucide-chevrons-up-down',
  checkbox: 'i-lucide-check-square',
  radio: 'i-lucide-circle-dot',
}

const fieldTypeItems = computed(() =>
  FIELD_TYPES.map((t) => ({ label: t.label, value: t.value })),
)

// ── Formulario del nuevo campo ─────────────────────────────────────────────────
const buildEmptyFieldForm = () => ({
  key: '',
  label: '',
  type: 'text' as CampoTipo,
  placeholder: '',
  required: false,
  options: [] as string[],
})

const fieldForm = reactive(buildEmptyFieldForm())
const newOptionInput = ref('')

const needsOptions = computed(() => ['select', 'radio'].includes(fieldForm.type))
const isEditing = computed(() => editingIndex.value !== null)

// Auto-genera clave a partir del label (solo al crear, no al editar)
watch(
  () => fieldForm.label,
  (val) => {
    if (!isEditing.value) {
      fieldForm.key = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
    }
  },
)

// Al cambiar el tipo, limpia opciones si ya no las necesita
watch(
  () => fieldForm.type,
  (val) => {
    if (!['select', 'radio'].includes(val)) {
      fieldForm.options.splice(0)
    }
  },
)

// ── Gestión de opciones ────────────────────────────────────────────────────────
const addOption = () => {
  const opt = newOptionInput.value.trim()
  if (!opt) return
  if (fieldForm.options.includes(opt)) {
    toast.add({ title: 'Esa opción ya existe', color: 'warning' })
    return
  }
  fieldForm.options.push(opt)
  newOptionInput.value = ''
}

const removeOption = (index: number) => {
  fieldForm.options.splice(index, 1)
}

// ── CRUD de campos ─────────────────────────────────────────────────────────────
const saveField = () => {
  if (!fieldForm.label.trim()) {
    toast.add({ title: 'El nombre del campo es requerido', color: 'error' })
    return
  }
  if (!fieldForm.key.trim()) {
    toast.add({ title: 'La clave del campo es requerida', color: 'error' })
    return
  }
  if (needsOptions.value && fieldForm.options.length === 0) {
    toast.add({ title: 'Agrega al menos una opción', color: 'error' })
    return
  }

  const isDuplicate = localCampos.value.some(
    (c, i) => c.key === fieldForm.key.trim() && i !== editingIndex.value,
  )
  if (isDuplicate) {
    toast.add({ title: 'Ya existe un campo con esa clave', color: 'error' })
    return
  }

  const campo: CampoAdicional = {
    key: fieldForm.key.trim(),
    label: fieldForm.label.trim(),
    type: fieldForm.type,
    required: fieldForm.required,
    ...(fieldForm.placeholder.trim() && { placeholder: fieldForm.placeholder.trim() }),
    ...(fieldForm.options.length > 0 && { options: [...fieldForm.options] }),
  }

  if (editingIndex.value !== null) {
    localCampos.value.splice(editingIndex.value, 1, campo)
    editingIndex.value = null
  } else {
    localCampos.value.push(campo)
  }

  Object.assign(fieldForm, buildEmptyFieldForm())
}

const editField = (index: number) => {
  const campo = localCampos.value[index]
  editingIndex.value = index
  fieldForm.key = campo.key
  fieldForm.label = campo.label
  fieldForm.type = campo.type
  fieldForm.placeholder = campo.placeholder ?? ''
  fieldForm.required = campo.required ?? false
  fieldForm.options = campo.options ? [...campo.options] : []
}

const removeField = (index: number) => {
  localCampos.value.splice(index, 1)
  if (editingIndex.value === index) {
    editingIndex.value = null
    Object.assign(fieldForm, buildEmptyFieldForm())
  } else if (editingIndex.value !== null && editingIndex.value > index) {
    editingIndex.value--
  }
}

const cancelEdit = () => {
  editingIndex.value = null
  Object.assign(fieldForm, buildEmptyFieldForm())
}

// ── Open / Apply / Close ───────────────────────────────────────────────────────
const open = () => {
  localCampos.value = props.modelValue.map((c) => ({
    ...c,
    options: c.options ? [...c.options] : undefined,
  }))
  editingIndex.value = null
  Object.assign(fieldForm, buildEmptyFieldForm())
  isOpen.value = true
}

const applyChanges = () => {
  emit('update:modelValue', [...localCampos.value])
  isOpen.value = false
}

const onClose = () => {
  isOpen.value = false
}

defineExpose({ open })
</script>

<template>
  <USlideover
    :open="isOpen"
    title="Campos adicionales"
    description="Define campos personalizados para este plan"
    @update:open="onClose"
  >
    <template #body>
      <div class="flex flex-col gap-6 py-2">

        <!-- ── Lista de campos configurados ──────────────────────────────────── -->
        <div class="flex flex-col gap-2">
          <p class="text-sm font-medium">
            Campos configurados
            <span v-if="localCampos.length" class="text-muted font-normal">({{ localCampos.length }})</span>
          </p>

          <div
            v-if="localCampos.length === 0"
            class="text-sm text-muted text-center py-5 border border-dashed rounded-lg"
          >
            No hay campos configurados aún
          </div>

          <div
            v-for="(campo, index) in localCampos"
            :key="campo.key"
            class="flex items-center gap-3 px-3 py-2.5 border rounded-lg"
            :class="editingIndex === index ? 'border-primary bg-primary/5' : 'bg-elevated'"
          >
            <UIcon
              :name="FIELD_TYPE_ICONS[campo.type]"
              class="size-4 text-muted shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ campo.label }}</p>
              <p class="text-xs text-muted">
                <span class="font-mono">{{ campo.key }}</span>
                · {{ FIELD_TYPE_LABELS[campo.type] }}
                <span v-if="campo.required" class="text-error"> · Requerido</span>
              </p>
            </div>
            <div class="flex gap-1 shrink-0">
              <UButton
                icon="i-lucide-pencil"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="editField(index)"
              />
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                @click="removeField(index)"
              />
            </div>
          </div>
        </div>

        <USeparator />

        <!-- ── Formulario: agregar / editar campo ────────────────────────────── -->
        <div class="flex flex-col gap-4">
          <p class="text-sm font-medium">
            {{ isEditing ? 'Editar campo' : 'Nuevo campo' }}
          </p>

          <!-- Nombre del campo -->
          <UFormField label="Nombre del campo" required>
            <UInput
              v-model="fieldForm.label"
              placeholder="Ej: Límite de almacenamiento"
              class="w-full"
            />
          </UFormField>

          <!-- Clave única (key) -->
          <UFormField label="Clave (key)" required>
            <UInput
              v-model="fieldForm.key"
              placeholder="limite_almacenamiento"
              class="w-full font-mono"
            />
            <template #hint>
              <span class="text-xs text-muted">Identificador único sin espacios</span>
            </template>
          </UFormField>

          <!-- Tipo de campo -->
          <UFormField label="Tipo de campo" required>
            <USelect
              v-model="fieldForm.type"
              :items="fieldTypeItems"
              class="w-full"
            />
          </UFormField>

          <!-- Placeholder (solo para tipos de texto) -->
          <UFormField
            v-if="!['checkbox', 'select', 'radio', 'date', 'datetime-local'].includes(fieldForm.type)"
            label="Placeholder"
          >
            <UInput
              v-model="fieldForm.placeholder"
              placeholder="Texto de ayuda opcional"
              class="w-full"
            />
          </UFormField>

          <!-- Opciones (select / radio) -->
          <div v-if="needsOptions" class="flex flex-col gap-2">
            <p class="text-sm font-medium">
              Opciones
              <span class="text-error text-xs">*</span>
            </p>

            <div
              v-if="fieldForm.options.length === 0"
              class="text-xs text-muted text-center py-3 border border-dashed rounded-lg"
            >
              Sin opciones — agrega al menos una
            </div>

            <div
              v-for="(opt, i) in fieldForm.options"
              :key="i"
              class="flex items-center gap-2 px-3 py-1.5 bg-elevated rounded-lg"
            >
              <span class="flex-1 text-sm">{{ opt }}</span>
              <UButton
                icon="i-lucide-x"
                color="error"
                variant="ghost"
                size="xs"
                @click="removeOption(i)"
              />
            </div>

            <div class="flex gap-2">
              <UInput
                v-model="newOptionInput"
                placeholder="Nueva opción"
                class="flex-1"
                @keydown.enter.prevent="addOption"
              />
              <UButton
                icon="i-lucide-plus"
                variant="soft"
                @click="addOption"
              />
            </div>
          </div>

          <!-- Requerido -->
          <div class="flex items-center gap-3">
            <USwitch v-model="fieldForm.required" />
            <span class="text-sm text-muted">Campo requerido</span>
          </div>

          <!-- Botones del formulario interno -->
          <div class="flex gap-2">
            <UButton
              v-if="isEditing"
              color="neutral"
              variant="outline"
              label="Cancelar edición"
              class="flex-1"
              @click="cancelEdit"
            />
            <UButton
              :label="isEditing ? 'Actualizar campo' : 'Agregar campo'"
              :icon="isEditing ? 'i-lucide-check' : 'i-lucide-plus'"
              class="flex-1"
              @click="saveField"
            />
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          color="neutral"
          variant="outline"
          label="Cancelar"
          @click="onClose"
        />
        <UButton
          label="Aplicar cambios"
          icon="i-lucide-check"
          @click="applyChanges"
        />
      </div>
    </template>
  </USlideover>
</template>
