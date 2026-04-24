<template>
  <div class="base-table__wrapper">
    <table class="base-table">
      <thead v-if="headers.length" class="base-table__header">
        <tr>
          <th v-for="header in headers" :key="header.key" :style="{ width: header.width }">
            {{ header.label }}
          </th>
        </tr>
      </thead>
      <tbody class="base-table__body">
        <tr v-for="(row, index) in data" :key="index" @click="$emit('row-click', row)">
          <td v-for="header in headers" :key="header.key">
            <slot :name="`cell-${header.key}`" :row="row" :value="row[header.key]">
              {{ row[header.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="!data.length && !$slots.empty">
          <td :colspan="headers.length" class="base-table__empty">
            {{ emptyText }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!data.length && $slots.empty" class="base-table__empty-slot">
      <slot name="empty" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  headers: {
    type: Array,
    default: () => []
  },
  data: {
    type: Array,
    default: () => []
  },
  emptyText: {
    type: String,
    default: 'No hay datos'
  }
})

defineEmits(['row-click'])
</script>

<style scoped>
.base-table__wrapper {
  overflow-x: auto;
}

.base-table {
  width: 100%;
  border-collapse: collapse;
}

.base-table__header th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--bg-primary);
  border-bottom: var(--border-subtle);
}

.base-table__body td {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  border-bottom: var(--border-subtle);
}

.base-table__body tr {
  transition: background var(--transition-fast);
}

.base-table__body tr:hover td {
  background: var(--bg-primary);
  cursor: pointer;
}

.base-table__empty {
  text-align: center;
  padding: var(--space-8);
  color: var(--text-muted);
}

.base-table__empty-slot {
  padding: var(--space-8);
}
</style>