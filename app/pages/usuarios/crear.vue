<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
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
        <h1 class="text-2xl font-semibold text-highlighted">Nuevo usuario</h1>
        <p class="text-sm text-muted mt-0.5">Completa los datos para crear un usuario</p>
      </div>
    </div>

    <UsuariosFormUsuario mode="create" />
  </div>
</template>
