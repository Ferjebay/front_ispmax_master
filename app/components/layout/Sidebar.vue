<script setup lang="ts">
const collapsed = useSidebar()
const { user } = useAuth()

const HOME_ITEM = {
  label: 'Inicio',
  ruta: '/dashboard',
  icono: 'house',
  orden: 0,
  permiso: '__home__',
  children: [],
  category: 'Dashboard',
}

const navGroups = computed(() => {
  const items = [HOME_ITEM, ...[...(user.value?.sidebar ?? [])].sort((a, b) => a.orden - b.orden)]
  const map = new Map<string, typeof items>()
  for (const item of items) {
    const key = item.category ?? ''
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
})

function toIcon(icono: string) {
  return `i-lucide-${icono}`
}
</script>

<template>
  <aside
    class="flex flex-col shrink-0 h-full border-r border-default bg-background transition-[width] duration-200 ease-in-out overflow-hidden"
    :class="collapsed ? 'w-0' : 'w-56'"
  >
    <nav class="flex flex-col gap-0.5 p-3 overflow-y-auto">
      <template v-for="group in navGroups" :key="group.category">
        <p
          v-if="group.category"
          class="px-2 pt-3 pb-1 text-xs font-semibold text-muted uppercase tracking-wider"
        >
          {{ group.category }}
        </p>
        <UButton
          v-for="item in group.items"
          :key="item.permiso"
          :to="item.ruta"
          :icon="toIcon(item.icono)"
          :label="item.label"
          color="neutral"
          variant="ghost"
          class="w-full justify-start"
        />
      </template>
    </nav>
  </aside>
</template>
