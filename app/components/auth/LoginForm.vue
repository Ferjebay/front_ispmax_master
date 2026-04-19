<script setup lang="ts">
import { authSchema } from "~/validations/auth.validations";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Schema } from "~/types/schema.type";

const fields = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Ingresa tu email",
    required: true,
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "Ingresa tu contraseña",
    required: true,
  },
];

const { login, loading, flow } = useAuth();

const onSubmit = ({ data }: FormSubmitEvent<Schema<typeof authSchema>>) =>
  login(data.email, data.password);

const otpOpen = ref(false);
const qrOpen = ref(false);
const devicesOpen = ref(false);

watch(
  () => flow.value,
  ({ step }) => {
    otpOpen.value = step === "otp";
    qrOpen.value = step === "qr";
    devicesOpen.value = step === "devices";
  },
);
</script>

<template>
  <UPageCard class="w-full max-w-md">
    <UAuthForm
      :schema="authSchema"
      title="Iniciar sesión"
      description="Ingresa tus credenciales para acceder."
      icon="i-lucide-user"
      :fields="fields"
      :loading="loading"
      @submit="onSubmit"
    />
  </UPageCard>

  <AuthOtpModal :open="otpOpen" />
  <AuthScanQRModal :open="qrOpen" />
  <AuthDevicesModal :open="devicesOpen" />
</template>
