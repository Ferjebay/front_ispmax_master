<script setup lang="ts">
const collapsed = useSidebar()
const route = useRoute()

const title = computed(() => (route.meta.title as string) || 'ISPMax')
</script>

<template>
  <header class="flex items-center h-16 px-4 gap-3 border-b border-default bg-background shrink-0">
    <UButton
      :icon="collapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
      color="neutral"
      variant="ghost"
      class="lg:hidden"
      @click="collapsed = !collapsed"
    />
    <h2 class="font-semibold text-highlighted">{{ title }}</h2>
  </header>
</template>
