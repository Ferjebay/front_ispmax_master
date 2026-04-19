<script setup lang="ts">
const collapsed = useSidebar()

const mainNav = [
  { label: 'Home', icon: 'i-lucide-house', to: '/dashboard' },
  { label: 'Inbox', icon: 'i-lucide-inbox', to: '/inbox' },
  { label: 'Contacts', icon: 'i-lucide-users', to: '/contacts' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' },
]

const secondaryNav = [
  { label: 'Help & Support', icon: 'i-lucide-info', to: '/help' },
]
</script>

<template>
  <aside
    class="flex flex-col shrink-0 h-full border-r border-default bg-elevated transition-[width] duration-200 ease-in-out"
    :class="collapsed ? 'w-16' : 'w-60'"
  >
    <div
      class="flex items-center h-16 px-3 gap-3 border-b border-default shrink-0"
      :class="collapsed ? 'justify-center' : 'justify-between'"
    >
      <span v-if="!collapsed" class="font-semibold text-highlighted truncate">ISPMax</span>
      <UButton
        :icon="collapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
        color="neutral"
        variant="ghost"
        @click="collapsed = !collapsed"
      />
    </div>

    <nav class="flex flex-col flex-1 gap-1 p-2 overflow-y-auto">
      <UButton
        v-for="item in mainNav"
        :key="item.label"
        :to="item.to"
        :icon="item.icon"
        :label="collapsed ? undefined : item.label"
        color="neutral"
        variant="ghost"
        class="w-full justify-start"
      />
    </nav>

    <div class="flex flex-col gap-1 border-t border-default p-2">
      <UButton
        v-for="item in secondaryNav"
        :key="item.label"
        :to="item.to"
        :icon="item.icon"
        :label="collapsed ? undefined : item.label"
        color="neutral"
        variant="ghost"
        class="w-full justify-start"
      />
      <UButton
        icon="i-lucide-user"
        :label="collapsed ? undefined : 'Usuario'"
        color="neutral"
        variant="ghost"
        class="w-full justify-start"
      />
    </div>
  </aside>
</template>
