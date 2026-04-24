<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <i :class="getIcon(toast.type)"></i>
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '../../composables/useToast'

const { toasts } = useToast()

const getIcon = (type) => {
  const icons = {
    success: 'ti ti-check',
    error: 'ti ti-x',
    warning: 'ti ti-alert-triangle',
    info: 'ti ti-info-circle'
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--text-primary);
  color: white;
  font-size: var(--font-size-base);
  font-weight: 500;
  box-shadow: var(--shadow-float);
}

.toast--success { background: var(--success); }
.toast--error { background: var(--error); }
.toast--warning { background: var(--warning); }
.toast--info { background: var(--info); }

.toast-enter-active,
.toast-leave-active {
  transition: all var(--transition);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>