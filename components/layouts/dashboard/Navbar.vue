<template>
  <q-scroll-area style="position: relative; height: 100%;">

    <q-item
      class="q-ml-sm animated-border"
      active-class="tab-active"
      :class="$q.dark.isActive ? 'text-white' : ''"
      :to="{ name: 'users' }"
      exact
      clickable
      v-ripple
    >
      <q-item-section avatar>
        <q-icon name="groups" size="24px" />
      </q-item-section>
      <q-item-section> Usuarios </q-item-section>
    </q-item>

  </q-scroll-area>
</template>