<script setup lang="ts">
import type { CampoAdicional } from '~/interfaces/plan.interface'

defineProps<{
  campos: CampoAdicional[]
  values: Record<string, any>
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <template v-for="campo in campos" :key="campo.key">

      <!-- text | email | number | tel | url | date | datetime-local | password -->
      <UFormField
        v-if="!['textarea', 'select', 'checkbox', 'radio'].includes(campo.type)"
        :label="campo.label"
        :required="campo.required"
      >
        <UInput
          :type="campo.type"
          :model-value="values[campo.key]"
          :placeholder="campo.placeholder"
          class="w-full"
          @update:model-value="values[campo.key] = $event"
        />
      </UFormField>

      <!-- textarea -->
      <UFormField
        v-else-if="campo.type === 'textarea'"
        :label="campo.label"
        :required="campo.required"
      >
        <UTextarea
          :model-value="values[campo.key]"
          :placeholder="campo.placeholder"
          class="w-full"
          @update:model-value="values[campo.key] = $event"
        />
      </UFormField>

      <!-- select -->
      <UFormField
        v-else-if="campo.type === 'select'"
        :label="campo.label"
        :required="campo.required"
      >
        <USelect
          :model-value="values[campo.key]"
          :items="(campo.options ?? []).map(o => ({ label: o, value: o }))"
          :placeholder="campo.placeholder || 'Selecciona una opción'"
          class="w-full"
          @update:model-value="values[campo.key] = $event"
        />
      </UFormField>

      <!-- checkbox -->
      <UFormField
        v-else-if="campo.type === 'checkbox'"
        :label="campo.label"
        :required="campo.required"
      >
        <div class="pt-1">
          <UCheckbox
            :model-value="values[campo.key]"
            :label="campo.label"
            @update:model-value="values[campo.key] = $event"
          />
        </div>
      </UFormField>

      <!-- radio -->
      <UFormField
        v-else-if="campo.type === 'radio'"
        :label="campo.label"
        :required="campo.required"
      >
        <URadioGroup
          :model-value="values[campo.key]"
          :items="(campo.options ?? []).map(o => ({ label: o, value: o }))"
          @update:model-value="values[campo.key] = $event"
        />
      </UFormField>

    </template>
  </div>
</template>
