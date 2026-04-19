<script setup lang="ts">
interface UserState {
  firstName?: string
  lastName?: string
  avatar?: string
}

const collapsed = useSidebar()
const { logout } = useAuth()
const user = useState<UserState | null>('user', () => null)

const fullName = computed(() => {
  if (!user.value) return ''
  return `${user.value.firstName ?? ''} ${user.value.lastName ?? ''}`.trim()
})

const dropdownItems = computed(() => [[
  { label: 'Cerrar sesión', icon: 'i-lucide-log-out', onSelect: logout },
]])
</script>

<template>
  <header class="flex items-center h-16 px-4 gap-3 shrink-0 bg-ispblue-900">
    <UButton
      :icon="collapsed ? 'i-lucide-panel-left-open' : 'i-lucide-chevron-left'"
      color="neutral"
      variant="ghost"
      class="text-white hover:bg-white/10"
      @click="collapsed = !collapsed"
    />

    <UAvatar src="/favicon.ico" alt="ISPMax" size="sm" />

    <span class="text-white text-sm flex-1">
      <template v-if="fullName">
        ¡Bienvenido de nuevo <strong>{{ fullName }}</strong>!
      </template>
    </span>

    <div class="flex items-center gap-1">
      <UButton
        icon="i-lucide-bell"
        color="neutral"
        variant="ghost"
        class="text-white hover:bg-white/10"
      />
      <UButton
        icon="i-lucide-sun"
        color="neutral"
        variant="ghost"
        class="text-white hover:bg-white/10"
      />
      <UDropdownMenu :items="dropdownItems">
        <UButton color="neutral" variant="ghost" class="text-white hover:bg-white/10 gap-1">
          <UAvatar :alt="fullName || 'Usuario'" size="sm" />
          <UIcon name="i-lucide-chevron-down" class="w-4 h-4" />
        </UButton>
      </UDropdownMenu>
    </div>
  </header>
</template>
