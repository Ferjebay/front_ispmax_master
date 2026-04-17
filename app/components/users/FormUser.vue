<script setup>
import Vue3QTelInput from "vue3-q-tel-input";

const showModal = ref(false);
const telInput = ref(null);
const userToEdit = ref(null);
const loading = ref(false);
const { showAlert } = useUtils();
const { $api } = useNuxtApp();
const isPwd = ref(true);
const isPwd2 = ref(true);
const mode = ref("create");
const emits = defineEmits(["refresh"]);

const objectFormMessage = {
  email: "",
  password: "",
  confirmPassword: "",
  usuario: "",
  celular: "",
  rol: "",
};

let camposRequeridos = ["email", "usuario", "celular", "rol"];
const formUser = ref({ ...objectFormMessage });

const validaciones = ref({
  email: { message: "", isValid: true },
  password: { message: "", isValid: true },
  confirmPassword: { message: "", isValid: true },
  usuario: { message: "", isValid: true },
  celular: { message: "", isValid: true },
  rol: { message: "", isValid: true },
});

const cleanForm = () => {
  formUser.value = { ...objectFormMessage };
};

const cleanErrors = () => {
  for (const campo of camposRequeridos)
    validaciones.value[campo].isValid = true;
};

const roles = ["SUPER_ADMIN", "ADMIN", "USUARIO"];

const validate = () => {
  let existsError = false;

  if (formUser.value.password.length > 0) {
    if (formUser.value.password !== formUser.value.confirmPassword) {
      validaciones.value.confirmPassword.message =
        "La confirmación no coincide con la contraseña";
      validaciones.value.confirmPassword.isValid = false;
      existsError = true;
    }
  }

  for (const campo of camposRequeridos) {
    if (formUser.value[campo]?.length == 0 || !formUser.value[campo]) {
      validaciones.value[campo].message = "Debes completar este campo";
      validaciones.value[campo].isValid = false;
      existsError = true;
    }
  }

  return existsError;
};

const onSubmit = async () => {
  if (validate()) return;

  loading.value = true;

  try {
    const { id, confirmPassword, ...rest } = formUser.value;

    if (mode.value === "create") {
      await $api.post("/user", { ...rest });
    } else {
      const { password, ...user } = rest;
      const objectUser = { ...user };

      if (password.length > 0) objectUser.password = password;

      await $api.patch(`/user/${id}`, { ...objectUser });
    }

    showAlert(
      `Usuario ${mode.value === "create" ? "creado" : "editado"} exitosamente.`,
    );
    showModal.value = false;
    emits("refresh");
  } catch (error) {
    console.log(error);
    showAlert(
      error.response.data.message ?? "Fallo al enviar el mensaje",
      "negative",
    );
  } finally {
    loading.value = false;
  }
};

watch(showModal, (state) => {
  if (state) {
    cleanForm();
    cleanErrors();

    if (mode.value === "edit") {
      camposRequeridos = camposRequeridos.filter(
        (item) => !["password", "confirmPassword"].includes(item),
      );
      const { id, usuario, celular, rol, email } = userToEdit.value;
      formUser.value = { usuario, celular, rol, email, id, password: "" };
    } else {
      camposRequeridos.push("password", "confirmPassword");
    }
  }
});

defineExpose({ showModal, userToEdit, mode });
</script>

<template>
  <p>Hola</p>
</template>
