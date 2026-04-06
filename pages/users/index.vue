<script setup>
const formUserRef = ref(null)
const filter = ref('')

const {
  users,
  loading,
  pagination,
  loadUsers,
  setStatusUser,
  onRequest,
} = useUser()

const columns = [
  { align: 'left',   label: 'USUARIO', field: 'usuario' },
  { align: 'left',   label: 'EMAIL',   field: 'email'   },
  { align: 'left',   label: 'ROL',     field: 'rol'     },
  { align: 'center', label: 'ESTADO',  name:  'status'  },
  { align: 'center', label: 'ACCIONES',name:  'actions' },
]

const editUser = (user) => {
  formUserRef.value.userToEdit = user
  formUserRef.value.mode = 'edit'
  formUserRef.value.showModal = true
}

onMounted(() => loadUsers())
</script>

<template>
  <div class="q-mx-lg q-my-md">
    <q-table
      ref="tableRef"
      title="Listado de usuarios"
      :rows="users"
      :columns="columns"
      :filter="filter"
      :loading="loading"
      v-model:pagination="pagination"
      row-key="id"
      dense
      @request="onRequest"
    >
      <template #top-right>
        <q-btn
          outline
          rounded
          color="primary"
          label="Agregar usuario"
          class="q-mr-md"
          @click="formUserRef.mode = 'create', formUserRef.showModal = true"
        />
        <q-input outlined dense debounce="600" v-model="filter" placeholder="Buscar">
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template #no-data>
        <div class="full-width row flex-center text-lime-10 q-gutter-sm">
          <span class="text-subtitle1">No se encontró ningún resultado.</span>
        </div>
      </template>

      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge class="q-px-md q-py-xs" :color="props.row.isActive ? 'secondary' : 'negative'">
            {{ props.row.isActive ? 'Activo' : 'Inactivo' }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round color="primary" icon="edit" @click="editUser(props.row)">
            <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">Editar</q-tooltip>
          </q-btn>
          <q-btn
            flat round
            :color="props.row.isActive ? 'blue-grey-7' : 'secondary'"
            :icon="props.row.isActive ? 'block' : 'check_circle'"
            @click="setStatusUser(props.row.isActive, props.row.id, pagination.page)"
          >
            <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
              {{ props.row.isActive ? 'Inactivar' : 'Activar' }}
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </div>

  <users-form-user
    ref="formUserRef"
    @refresh="loadUsers(pagination.page)"
  />
</template>