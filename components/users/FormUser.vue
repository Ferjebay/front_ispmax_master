<script setup>
import Vue3QTelInput from 'vue3-q-tel-input'

const showModal = ref(false);
const telInput = ref(null);
const userToEdit = ref(null);
const loading = ref(false);
const { showAlert } = useUtils()
const { $api } = useNuxtApp()
const isPwd = ref(true);
const isPwd2 = ref(true);
const mode = ref('create');
const emits = defineEmits(['refresh'])

const objectFormMessage = {
  email: '',
  password: '',
  confirmPassword: '',
  usuario: '',
  celular: '',
  rol: ''
}

let camposRequeridos = ['email', 'usuario', 'celular', 'rol']
const formUser = ref({ ...objectFormMessage })

const validaciones = ref({
  email:    { message: '', isValid: true },
  password: { message: '', isValid: true },
  confirmPassword: { message: '', isValid: true },
  usuario:  { message: '', isValid: true },
  celular:  { message: '', isValid: true },
  rol:      { message: '', isValid: true },
})

const cleanForm = () => {
  formUser.value = { ...objectFormMessage }
}

const cleanErrors = () => {
  for (const campo of camposRequeridos)
    validaciones.value[campo].isValid = true;
}

const roles = [
  'SUPER_ADMIN',
  'ADMIN',
  'USUARIO'
]

const validate = () => {
  let existsError = false;

  if (formUser.value.password.length > 0) {
    if (formUser.value.password !== formUser.value.confirmPassword) {
      validaciones.value.confirmPassword.message = 'La confirmación no coincide con la contraseña'
      validaciones.value.confirmPassword.isValid = false;
      existsError = true
    }
  }

  for (const campo of camposRequeridos) {
    if ( formUser.value[campo]?.length == 0 || !formUser.value[campo] ) {
      validaciones.value[campo].message = 'Debes completar este campo'
      validaciones.value[campo].isValid = false;
      existsError = true;
    }
  }

  return existsError
}

const onSubmit = async () => {

  if (validate()) return

  loading.value = true;

  try {

    const { id, confirmPassword, ...rest } = formUser.value;

    if (mode.value === 'create') {
      await $api.post('/user', { ...rest })
    } else {
      const { password, ...user } = rest
      const objectUser = { ...user }

      if (password.length > 0)
        objectUser.password = password;

      await $api.patch(`/user/${ id }`, { ...objectUser })
    }

    showAlert(`Usuario ${ mode.value === 'create' ? 'creado' : 'editado' } exitosamente.`)
    showModal.value = false;
    emits('refresh');
  } catch (error) {
    console.log(error)
    showAlert(error.response.data.message ?? 'Fallo al enviar el mensaje', 'negative')
  } finally {
    loading.value = false;
  }
}

watch(showModal, (state) => {
  if (state) {
    cleanForm()
    cleanErrors()

    if (mode.value === 'edit') {
      camposRequeridos = camposRequeridos.filter(item => !['password', 'confirmPassword'].includes(item))
      const { id, usuario, celular, rol, email } = userToEdit.value;
      formUser.value = { usuario, celular, rol, email, id, password: '' };
    } else {
      camposRequeridos.push('password', 'confirmPassword')
    }
  }
})

defineExpose({ showModal, userToEdit, mode })
</script>

<template>
  <q-dialog v-model="showModal">
    <q-card style="width: 750px; max-width: 80vw;">
      <q-card-section>
        <div class="text-h6 text-center">
          {{ mode === 'create' ? 'Agregar usuario' : 'Editar usuario' }}
          <q-btn
            round
            flat
            dense
            icon="close"
            class="float-right"
            color="grey-8"
            v-close-popup
          />
        </div>
      </q-card-section>

      <q-separator inset></q-separator>

      <q-card-section class="q-pt-md">
        <q-form
          @submit="onSubmit"
          :class="{ 'q-mx-lg': !$q.screen.xs }"
        >
          <div class="row justify-center q-col-gutter-x-lg q-col-gutter-y-md">
            <div class="col-xs-12 col-md-6">
              <label>
                Nombre de usuario:
              </label>
              <q-input
                v-model="formUser.usuario"
                outlined
                dense
                rounded
                :error="!validaciones.usuario.isValid"
                @update:model-value="validaciones.usuario.isValid = true"
              >
                <template v-slot:error>
                  <label
                    class="text-body2"
                    :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validaciones.usuario.message }}
                  </label>
                </template>
              </q-input>
            </div>

            <div class="col-xs-12 col-md-6">
              <label>
                Email:
              </label>
              <q-input
                v-model="formUser.email"
                outlined
                dense
                rounded
                :error="!validaciones.email.isValid"
                @update:model-value="validaciones.email.isValid = true"
              >
                <template v-slot:error>
                  <label
                    class="text-body2"
                    :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validaciones.email.message }}
                  </label>
                </template>
              </q-input>
            </div>

            <div
              class="col-xs-12 col-md-6"
              style="display: flex;flex-direction: column;justify-content: center;"
            >
              <label>
                Rol:
              </label>
              <q-select
                style="min-width: 180px"
                rounded
                outlined
                v-model.trim="formUser.rol"
                :options="roles"
                emit-value
                map-options
                dense
                :error="!validaciones.rol.isValid"
                @update:model-value="validaciones.rol.isValid = true"
              >
                <template v-slot:error>
                  <label
                    class="text-body2"
                    :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validaciones.rol.message }}
                  </label>
                </template>
              </q-select>
            </div>

            <div class="col-xs-12 col-md-6">
              <label>Movil</label>
              <vue3-q-tel-input
                ref="telInput"
                v-model.trim="formUser.celular"
                default-country="ec"
                dense
                outlined
                rounded
                :error="!validaciones.celular.isValid"
                @update:model-value="validaciones.celular.isValid = true"
              >
                <template v-slot:error>
                  <label
                    class="text-body2"
                    :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validaciones.celular.message }}
                  </label>
                </template>
              </vue3-q-tel-input>
            </div>

            <div class="col-xs-12 col-md-6">
              <label>
                {{ mode === 'create' ? 'Contraseña' : 'Editar Contraseña' }}
              </label>
              <q-input
                v-model="formUser.password"
                outlined
                dense
                rounded
                :error="!validaciones.password.isValid"
                @update:model-value="validaciones.password.isValid = true"
                :type="isPwd2 ? 'password' : 'text'"
              >
                <template v-slot:error>
                  <label
                    class="text-body2"
                    :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validaciones.password.message }}
                  </label>
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isPwd2 ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd2 = !isPwd2"
                  />
                </template>
              </q-input>
            </div>

            <div class="col-xs-12 col-md-6">
              <label>
                Confirmar contraseña:
              </label>
              <q-input
                v-model="formUser.confirmPassword"
                outlined
                dense
                rounded
                :error="!validaciones.confirmPassword.isValid"
                @update:model-value="validaciones.confirmPassword.isValid = true"
                :type="isPwd ? 'password' : 'text'"
              >
                <template v-slot:error>
                  <label
                    class="text-body2"
                    :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validaciones.confirmPassword.message }}
                  </label>
                </template>
                 <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
            </div>

            <div class="col-12 text-center q-mb-md q-pt-lg">
              <q-btn
                type="submit"
                outline
                rounded
                color="primary"
                :label="mode === 'create' ? 'Agregar' : 'Editar'"
                class="q-mr-md"
                icon-right="save"
                :loading="loading"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style>
  @import 'vue3-q-tel-input/dist/vue3-q-tel-input.esm.css';
</style>