<script setup lang="ts">
import type { Usuario, CreateUsuarioPayload, UpdateUsuarioPayload } from '~/interfaces/usuario.interface'
import type { Role } from '~/composables/useRole'

const props = defineProps<{
  mode: 'create' | 'edit'
  initialData?: Usuario | null
}>()

const toast = useToast()
const { api } = useHelper()
const { createUsuario, updateUsuario } = useUsuario()

const loading = ref(false)
const roles = ref<Role[]>([])

const buildEmptyForm = () => ({
  email: '',
  password: '',
  confirmarPassword: '',
  usuario: '',
  celular: '',
  rol_id: null as string | null,
  isActive: true,
})

const form = reactive(buildEmptyForm())

const roleItems = computed(() =>
  roles.value.map((r) => ({ label: r.nombre, value: r.id })),
)

const loadRoles = async () => {
  try {
    const { data } = await api<{ data: Role[] }>('roles', { params: { limit: 100 } })
    roles.value = data
  } catch {
    // no bloqueante, el campo es opcional
  }
}

onMounted(() => {
  loadRoles()

  if (props.mode === 'edit' && props.initialData) {
    const u = props.initialData
    form.email = u.email
    form.usuario = u.usuario
    form.celular = u.celular ?? ''
    form.rol_id = u.rol?.id ?? null
    form.isActive = u.isActive
    form.password = ''
    form.confirmarPassword = ''
  }
})

const validate = (): boolean => {
  if (!form.email.trim()) {
    toast.add({ title: 'El email es requerido', color: 'error' })
    return false
  }
  if (props.mode === 'create' && !form.password) {
    toast.add({ title: 'La contraseña es requerida', color: 'error' })
    return false
  }
  if (form.password && form.password !== form.confirmarPassword) {
    toast.add({ title: 'Las contraseñas no coinciden', color: 'error' })
    return false
  }
  if (!form.usuario.trim() || form.usuario.trim().length < 5) {
    toast.add({ title: 'El usuario debe tener al menos 5 caracteres', color: 'error' })
    return false
  }
  return true
}

const onSubmit = async () => {
  if (!validate()) return

  loading.value = true
  try {
    if (props.mode === 'create') {
      const payload: CreateUsuarioPayload = {
        email: form.email.trim(),
        password: form.password,
        usuario: form.usuario.trim(),
        ...(form.celular.trim() && { celular: form.celular.trim() }),
        ...(form.rol_id && { rol_id: form.rol_id }),
      }
      await createUsuario(payload)
    } else {
      const payload: UpdateUsuarioPayload = {
        email: form.email.trim(),
        usuario: form.usuario.trim(),
        isActive: form.isActive,
        ...(form.celular.trim() && { celular: form.celular.trim() }),
        ...(form.rol_id && { rol_id: form.rol_id }),
        ...(form.password && { password: form.password }),
      }
      await updateUsuario(props.initialData!.id, payload)
    }
    await navigateTo('/usuarios')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error?.data?.message ?? 'Fallo al guardar el usuario',
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
      <UFormField label="Email" required class="col-span-2">
        <UInput
          v-model="form.email"
          type="email"
          placeholder="correo@ejemplo.com"
          class="w-full"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Usuario" required>
          <UInput
            v-model="form.usuario"
            placeholder="nombre_usuario"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Celular">
          <UInput
            v-model="form.celular"
            placeholder="+57 300 000 0000"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UFormField
          :label="mode === 'create' ? 'Contraseña' : 'Nueva contraseña (opcional)'"
          :required="mode === 'create'"
        >
          <UInput
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="mode === 'create' ? 'Confirmar contraseña' : 'Confirmar nueva contraseña'"
          :required="mode === 'create'"
        >
          <UInput
            v-model="form.confirmarPassword"
            type="password"
            placeholder="••••••••"
            class="w-full"
          />
        </UFormField>
      </div>

      <p v-if="mode === 'create'" class="text-xs text-muted -mt-3">
        La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.
      </p>

      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Rol">
          <USelect
            v-model="form.rol_id"
            :items="roleItems"
            placeholder="Selecciona un rol"
            class="w-full"
          />
        </UFormField>

        <UFormField v-if="mode === 'edit'" label="Estado">
          <div class="flex items-center gap-3 pt-1.5">
            <USwitch v-model="form.isActive" />
            <span class="text-sm text-muted">
              {{ form.isActive ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </UFormField>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <UButton
          color="neutral"
          variant="outline"
          label="Cancelar"
          to="/usuarios"
        />
        <UButton
          :label="mode === 'create' ? 'Crear usuario' : 'Guardar cambios'"
          :loading="loading"
          @click="onSubmit"
        />
      </div>
    </div>
  </div>
</template>
