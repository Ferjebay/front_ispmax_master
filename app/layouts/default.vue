<template>
  <div class="flex h-dvh overflow-hidden bg-background">
    <LayoutSidebar />

    <div class="flex flex-col flex-1 min-w-0">
      <LayoutNavbar />
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
