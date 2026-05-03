<script setup lang="ts">
import type { Plan } from '~/interfaces/plan.interface'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string

const { getPlan } = usePlan()
const plan = ref<Plan | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    plan.value = await getPlan(id)
  } catch {
    await navigateTo('/planes')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <div class="flex items-center gap-3">
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/planes"
      />
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">Editar plan</h1>
        <p class="text-sm text-muted mt-0.5">Modifica los datos del plan</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-muted size-6" />
    </div>

    <PlanesFormPlan
      v-else-if="plan"
      mode="edit"
      :initial-data="plan"
    />
  </div>
</template>
