<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="base-modal__overlay" @click.self="closeOnOverlay && close()">
        <div class="base-modal" :class="`base-modal--${size}`">
          <div class="base-modal__header">
            <h2 class="base-modal__title">{{ title }}</h2>
            <button class="base-modal__close" @click="close">
              <i class="ti ti-x"></i>
            </button>
          </div>
          <div class="base-modal__body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="base-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v)
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.base-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-4);
}

.base-modal {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-float);
  border: var(--border-subtle);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.base-modal--sm { max-width: 360px; }
.base-modal--md { max-width: 480px; }
.base-modal--lg { max-width: 640px; }
.base-modal--xl { max-width: 800px; }

.base-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border-bottom: var(--border-subtle);
  background: var(--bg-primary);
}

.base-modal__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.base-modal__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.base-modal__close:hover {
  background: var(--bg-primary);
  color: var(--error);
}

.base-modal__body {
  padding: var(--space-5);
  overflow-y: auto;
  flex: 1;
}

.base-modal__footer {
  padding: var(--space-4) var(--space-5);
  border-top: var(--border-subtle);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  background: var(--bg-primary);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-fast);
}

.modal-enter-active .base-modal,
.modal-leave-active .base-modal {
  transition: all var(--transition);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .base-modal,
.modal-leave-to .base-modal {
  transform: scale(0.95) translateY(20px);
}
</style>