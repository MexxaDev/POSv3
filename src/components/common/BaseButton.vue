<template>
  <button
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      { 'base-button--block': block, 'base-button--loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="base-button__spinner"></span>
    <slot v-else />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'ghost'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-weight: 600;
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  outline: none;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.base-button--sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
}

.base-button--md {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-base);
}

.base-button--lg {
  padding: var(--space-3) var(--space-5);
  font-size: var(--font-size-md);
}

/* Variants */
.base-button--primary {
  background: var(--accent);
  color: white;
}

.base-button--primary:hover:not(:disabled) {
  background: var(--accent-dark);
  transform: scale(1.02);
}

.base-button--primary:active:not(:disabled) {
  transform: scale(0.98);
}

.base-button--secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: var(--border);
}

.base-button--secondary:hover:not(:disabled) {
  background: #E8E8E8;
}

.base-button--danger {
  background: var(--error);
  color: white;
}

.base-button--danger:hover:not(:disabled) {
  background: #D63026;
}

.base-button--ghost {
  background: transparent;
  color: var(--text-secondary);
}

.base-button--ghost:hover:not(:disabled) {
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* Block */
.base-button--block {
  width: 100%;
}

/* Loading */
.base-button__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>