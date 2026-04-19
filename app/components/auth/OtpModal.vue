<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const { verify2fa, resetFlow } = useAuth()
const toast = useToast()
const loading = ref(false)
const code = ref<number[]>([])

watch(() => props.open, (v) => { if (v) code.value = [] })

function onClose() {
  emit('update:open', false)
  resetFlow()
}

async function onSubmit() {
  if (code.value.length !== 6) return
  loading.value = true
  try {
    await verify2fa(code.value.join(''))
  } catch (error: any) {
    toast.add({
      title: 'Código inválido',
      description: error?.data?.message ?? 'El código OTP es incorrecto',
      color: 'error',
    })
    code.value = []
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal :open="props.open" @update:open="(v) => !v && onClose()" :dismissible="false" title="Verificación en dos pasos">
    <template #body>
      <div class="flex flex-col items-center gap-5 py-2">
        <UIcon name="i-lucide-shield-check" class="size-12 text-primary" />
        <p class="text-sm text-center text-muted">
          Ingresa el código de 6 dígitos de tu aplicación de autenticación.
        </p>
        <UPinInput v-model="code" :length="6" type="number" autofocus @complete="onSubmit" />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton variant="ghost" color="neutral" :disabled="loading" @click="onClose">Cancelar</UButton>
        <UButton :loading="loading" :disabled="code.length !== 6" @click="onSubmit">Verificar</UButton>
      </div>
    </template>
  </UModal>
</template>
