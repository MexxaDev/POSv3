<template>
  <div class="base-card" :class="{ 'base-card--hoverable': hoverable }">
    <div v-if="$slots.header || title" class="base-card__header">
      <slot name="header">
        <h3 class="base-card__title">{{ title }}</h3>
        <div v-if="$slots.actions" class="base-card__actions">
          <slot name="actions" />
        </div>
      </slot>
    </div>
    <div class="base-card__body" :class="{ 'base-card__body--no-padding': noPadding }">
      <slot />
    </div>
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  hoverable: {
    type: Boolean,
    default: false
  },
  noPadding: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.base-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  border: var(--border-subtle);
  overflow: hidden;
  transition: all var(--transition);
}

.base-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.base-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border-bottom: var(--border-subtle);
}

.base-card__title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
}

.base-card__actions {
  display: flex;
  gap: var(--space-2);
}

.base-card__body {
  padding: var(--space-5);
}

.base-card__body--no-padding {
  padding: 0;
}

.base-card__footer {
  padding: var(--space-4) var(--space-5);
  border-top: var(--border-subtle);
  background: var(--bg-primary);
}
</style>