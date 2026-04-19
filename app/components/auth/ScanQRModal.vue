<script setup lang="ts">
const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ "update:open": [boolean] }>();

const { flow, verify2fa, resetFlow } = useAuth();
const toast = useToast();
const loading = ref(false);
const code = ref<number[]>([]);
const step = ref<"qr" | "otp">("qr");

watch(
  () => props.open,
  (v) => {
    if (v) {
      code.value = [];
      step.value = "qr";
    }
  },
);

function onClose() {
  emit("update:open", false);
  resetFlow();
}

async function onSubmit() {
  if (code.value.length !== 6) return;
  loading.value = true;
  try {
    await verify2fa(code.value.join(""));
  } catch (error: any) {
    toast.add({
      title: "Código inválido",
      description: error?.data?.message ?? "El código OTP es incorrecto",
      color: "error",
    });
    code.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  console.log(props.open);
});
</script>

<template>
  <UModal
    :open="open"
    @update:open="(v) => !v && onClose()"
    :dismissible="false"
    title="Configurar autenticación en dos pasos"
  >
    <template #body>
      <div v-if="step === 'qr'" class="flex flex-col items-center gap-4 py-2">
        <p class="text-sm text-center text-muted">
          Escanea este código QR con tu aplicación de autenticación (Google
          Authenticator, Authy, etc).
        </p>
        <img
          v-if="flow.qrCode"
          :src="flow.qrCode"
          alt="QR 2FA"
          class="size-48 rounded-lg border"
        />
        <UButton class="w-full" @click="step = 'otp'">Ya lo escaneé</UButton>
      </div>
      <div v-else class="flex flex-col items-center gap-5 py-2">
        <UIcon name="i-lucide-shield-check" class="size-12 text-primary" />
        <p class="text-sm text-center text-muted">
          Ingresa el código de 6 dígitos que muestra tu aplicación.
        </p>
        <UPinInput
          v-model="code"
          :length="6"
          type="number"
          autofocus
          @complete="onSubmit"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between w-full gap-2">
        <UButton
          v-if="step === 'otp'"
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          :disabled="loading"
          @click="step = 'qr'"
          >Volver</UButton
        >
        <div class="flex gap-2 ml-auto">
          <UButton
            variant="ghost"
            color="neutral"
            :disabled="loading"
            @click="onClose"
            >Cancelar</UButton
          >
          <UButton
            v-if="step === 'otp'"
            :loading="loading"
            :disabled="code.length !== 6"
            @click="onSubmit"
            >Verificar</UButton
          >
        </div>
      </div>
    </template>
  </UModal>
</template>
