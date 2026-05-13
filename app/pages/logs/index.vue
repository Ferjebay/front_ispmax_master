<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Log } from '~/interfaces/log.interface'

definePageMeta({ middleware: 'auth' })

const { logs, loading, total, page, limit, loadLogs, stats, loadingStats, loadStats } = useLog()

const activeTab = ref<'actividad' | 'estadisticas'>('actividad')
const selectedLog = ref<Log | null>(null)
const sliderOpen = ref(false)

const columns: TableColumn<Log>[] = [
  { accessorKey: 'user', header: 'Usuario' },
  { accessorKey: 'action', header: 'Acción' },
  { accessorKey: 'module', header: 'Módulo' },
  { accessorKey: 'severity', header: 'Severidad' },
  { accessorKey: 'description', header: 'Descripción' },
  { accessorKey: 'createdAt', header: 'Fecha' },
  { accessorKey: 'detail', header: '' },
]

const accionColor: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  CREATE: 'success',
  UPDATE: 'warning',
  DELETE: 'error',
  LOGIN: 'info',
  LOGOUT: 'neutral',
}

const severityColor: Record<string, 'info' | 'error' | 'warning' | 'neutral'> = {
  INFO: 'info',
  ERROR: 'error',
  WARNING: 'warning',
  DEBUG: 'neutral',
}

function getAccionColor(v: string) {
  return accionColor[v?.toUpperCase()] ?? 'neutral'
}

function getSeverityColor(v: string) {
  return severityColor[v?.toUpperCase()] ?? 'neutral'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function openDetails(log: Log) {
  selectedLog.value = log
  sliderOpen.value = true
}

function setTab(tab: 'actividad' | 'estadisticas') {
  activeTab.value = tab
  if (tab === 'estadisticas' && !stats.value) {
    loadStats()
  }
}

function barPct(val: number, max: number) {
  return max > 0 ? Math.round((val / max) * 100) : 0
}

const sortedByAction = computed(() => {
  if (!stats.value) return []
  return Object.entries(stats.value.byAction)
    .sort((a, b) => b[1] - a[1])
    .map(([key, val]) => ({ key, val }))
})

const sortedByModule = computed(() => {
  if (!stats.value) return []
  return Object.entries(stats.value.byModule)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, val]) => ({ key, val }))
})

const sortedBySeverity = computed(() => {
  if (!stats.value) return []
  return Object.entries(stats.value.bySeverity)
    .sort((a, b) => b[1] - a[1])
    .map(([key, val]) => ({ key, val }))
})

const maxAction = computed(() => sortedByAction.value[0]?.val ?? 1)
const maxModule = computed(() => sortedByModule.value[0]?.val ?? 1)
const maxSeverity = computed(() => sortedBySeverity.value[0]?.val ?? 1)

onMounted(() => loadLogs())
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-semibold text-highlighted">Logs</h1>
      <p class="text-sm text-muted mt-0.5">Historial de actividad del sistema</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-0 border-b border-default">
      <button
        v-for="tab in [
          { value: 'actividad', label: 'Actividad', icon: 'i-lucide-list' },
          { value: 'estadisticas', label: 'Estadísticas', icon: 'i-lucide-bar-chart-2' },
        ]"
        :key="tab.value"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer"
        :class="activeTab === tab.value
          ? 'border-primary text-highlighted'
          : 'border-transparent text-muted hover:text-highlighted'"
        @click="setTab(tab.value as any)"
      >
        <UIcon :name="tab.icon" class="text-base" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab: Actividad -->
    <div v-if="activeTab === 'actividad'" class="flex flex-col gap-4">
      <UTable :data="logs" :columns="columns" :loading="loading">
        <template #user-cell="{ row }">
          <span :class="!row.original.user ? 'text-muted italic' : 'font-medium'">
            {{ row.original.user?.nombres ?? '—' }}
          </span>
        </template>

        <template #action-cell="{ row }">
          <UBadge :color="getAccionColor(row.original.action)" variant="subtle">
            {{ row.original.action }}
          </UBadge>
        </template>

        <template #module-cell="{ row }">
          <span class="text-sm font-mono capitalize">{{ row.original.module ?? '—' }}</span>
        </template>

        <template #severity-cell="{ row }">
          <UBadge
            v-if="row.original.severity"
            :color="getSeverityColor(row.original.severity)"
            variant="soft"
            size="sm"
          >
            {{ row.original.severity }}
          </UBadge>
          <span v-else class="text-muted">—</span>
        </template>

        <template #description-cell="{ row }">
          <span class="text-sm text-muted line-clamp-1 max-w-xs">
            {{ row.original.description ?? '—' }}
          </span>
        </template>

        <template #createdAt-cell="{ row }">
          <span class="text-sm text-muted">{{ formatDate(row.original.createdAt) }}</span>
        </template>

        <template #detail-cell="{ row }">
          <UButton
            v-if="row.original.new_value || row.original.prev_value"
            icon="i-lucide-eye"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="openDetails(row.original)"
          />
        </template>
      </UTable>

      <div class="flex justify-end">
        <UPagination
          v-model:page="page"
          :total="total"
          :items-per-page="limit"
          @update:page="loadLogs"
        />
      </div>
    </div>

    <!-- Tab: Estadísticas -->
    <div v-else-if="activeTab === 'estadisticas'">
      <!-- Loading -->
      <div v-if="loadingStats" class="flex items-center justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-muted" />
      </div>

      <!-- Stats content -->
      <div v-else-if="stats" class="flex flex-col gap-6">
        <!-- Cards de resumen -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-muted uppercase tracking-wide">Total registros</span>
              <span class="text-3xl font-bold text-highlighted">{{ stats.total.toLocaleString() }}</span>
            </div>
          </UCard>
          <UCard v-for="(count, sev) in stats.bySeverity" :key="sev">
            <div class="flex flex-col gap-2">
              <UBadge :color="getSeverityColor(String(sev))" variant="soft" class="w-fit text-xs">
                {{ sev }}
              </UBadge>
              <span class="text-3xl font-bold text-highlighted">{{ count.toLocaleString() }}</span>
            </div>
          </UCard>
        </div>

        <!-- Por acción -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-zap" class="text-muted" />
              <span class="font-semibold">Por acción</span>
            </div>
          </template>
          <div class="flex flex-col gap-4">
            <div v-for="item in sortedByAction" :key="item.key" class="flex items-center gap-3">
              <div class="w-24 flex justify-end">
                <UBadge :color="getAccionColor(item.key)" variant="subtle" class="text-xs">
                  {{ item.key }}
                </UBadge>
              </div>
              <div class="flex-1 rounded-full h-3 overflow-hidden" style="background: var(--ui-bg-muted)">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  style="background: var(--ui-primary)"
                  :style="{ width: barPct(item.val, maxAction) + '%' }"
                />
              </div>
              <span class="text-sm font-semibold w-12 text-right">{{ item.val }}</span>
              <span class="text-xs text-muted w-10 text-right">{{ barPct(item.val, maxAction) }}%</span>
            </div>
          </div>
        </UCard>

        <!-- Por módulo -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-boxes" class="text-muted" />
              <span class="font-semibold">Por módulo</span>
              <span class="text-xs text-muted">(top 10)</span>
            </div>
          </template>
          <div class="flex flex-col gap-4">
            <div v-for="item in sortedByModule" :key="item.key" class="flex items-center gap-3">
              <div class="w-28 text-right">
                <span class="text-sm font-mono capitalize truncate block">{{ item.key }}</span>
              </div>
              <div class="flex-1 rounded-full h-3 overflow-hidden" style="background: var(--ui-bg-muted)">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  style="background: var(--ui-color-info-500)"
                  :style="{ width: barPct(item.val, maxModule) + '%' }"
                />
              </div>
              <span class="text-sm font-semibold w-12 text-right">{{ item.val }}</span>
              <span class="text-xs text-muted w-10 text-right">{{ barPct(item.val, maxModule) }}%</span>
            </div>
          </div>
        </UCard>

        <!-- Por severidad -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-alert-triangle" class="text-muted" />
              <span class="font-semibold">Por severidad</span>
            </div>
          </template>
          <div class="flex flex-col gap-4">
            <div v-for="item in sortedBySeverity" :key="item.key" class="flex items-center gap-3">
              <div class="w-24 flex justify-end">
                <UBadge :color="getSeverityColor(item.key)" variant="soft" class="text-xs">
                  {{ item.key }}
                </UBadge>
              </div>
              <div class="flex-1 rounded-full h-3 overflow-hidden" style="background: var(--ui-bg-muted)">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: barPct(item.val, maxSeverity) + '%',
                    background: item.key === 'ERROR'
                      ? 'var(--ui-color-error-500)'
                      : item.key === 'WARNING'
                        ? 'var(--ui-color-warning-500)'
                        : 'var(--ui-color-info-500)',
                  }"
                />
              </div>
              <span class="text-sm font-semibold w-12 text-right">{{ item.val }}</span>
              <span class="text-xs text-muted w-10 text-right">{{ barPct(item.val, maxSeverity) }}%</span>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center gap-4 py-20 text-muted">
        <UIcon name="i-lucide-bar-chart-2" class="text-5xl" />
        <p class="text-sm">No se pudieron cargar las estadísticas</p>
        <UButton label="Reintentar" icon="i-lucide-refresh-cw" variant="outline" @click="loadStats" />
      </div>
    </div>
  </div>

  <!-- Slideover: detalle del log -->
  <USlideover
    :open="sliderOpen"
    title="Detalle del log"
    :description="selectedLog?.description"
    @update:open="sliderOpen = $event"
  >
    <template #body>
      <div v-if="selectedLog" class="flex flex-col gap-5 p-4">
        <!-- Meta badges -->
        <div class="flex flex-wrap items-center gap-2">
          <UBadge :color="getAccionColor(selectedLog.action)" variant="subtle">
            {{ selectedLog.action }}
          </UBadge>
          <UBadge
            v-if="selectedLog.severity"
            :color="getSeverityColor(selectedLog.severity)"
            variant="soft"
          >
            {{ selectedLog.severity }}
          </UBadge>
          <span class="text-sm font-mono text-muted capitalize">{{ selectedLog.module }}</span>
        </div>

        <!-- Info -->
        <div class="flex flex-col gap-1 text-sm">
          <div class="flex gap-2">
            <span class="text-muted w-20">Usuario</span>
            <span class="font-medium">{{ selectedLog.user?.nombres ?? '—' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted w-20">Fecha</span>
            <span>{{ formatDate(selectedLog.createdAt) }}</span>
          </div>
          <div v-if="selectedLog.user?.email" class="flex gap-2">
            <span class="text-muted w-20">Email</span>
            <span class="font-mono text-xs">{{ selectedLog.user.email }}</span>
          </div>
        </div>

        <UDivider />

        <!-- Diff prev vs new -->
        <div
          v-if="selectedLog.prev_value || selectedLog.new_value"
          class="flex flex-col gap-4"
        >
          <div v-if="selectedLog.prev_value">
            <p class="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
              Valor anterior
            </p>
            <pre class="text-xs rounded-lg p-3 overflow-auto max-h-72 border border-default" style="background: var(--ui-bg-muted)">{{ JSON.stringify(selectedLog.prev_value, null, 2) }}</pre>
          </div>
          <div v-if="selectedLog.new_value">
            <p class="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
              Valor nuevo
            </p>
            <pre class="text-xs rounded-lg p-3 overflow-auto max-h-72 border border-default" style="background: var(--ui-bg-muted)">{{ JSON.stringify(selectedLog.new_value, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
