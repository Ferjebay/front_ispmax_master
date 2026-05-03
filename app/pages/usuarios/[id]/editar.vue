<script setup lang="ts">
import type { Usuario } from '~/interfaces/usuario.interface'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string

const { getUsuario } = useUsuario()
const usuario = ref<Usuario | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    usuario.value = await getUsuario(id)
  } catch {
    await navigateTo('/usuarios')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <div class="flex items-center gap-3">
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/usuarios"
      />
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">Editar usuario</h1>
        <p class="text-sm text-muted mt-0.5">Modifica los datos del usuario</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-muted size-6" />
    </div>

    <UsuariosFormUsuario
      v-else-if="usuario"
      mode="edit"
      :initial-data="usuario"
    />
  </div>
</template>
