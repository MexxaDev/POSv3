<template>
  <div class="base-input" :class="{ 'base-input--error': error, 'base-input--focused': focused }">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>
    <div class="base-input__wrapper">
      <i v-if="iconLeft" :class="iconLeft" class="base-input__icon base-input__icon--left"></i>
      <input
        :id="inputId"
        class="base-input__field"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <i v-if="iconRight" :class="iconRight" class="base-input__icon base-input__icon--right"></i>
    </div>
    <span v-if="error" class="base-input__error-text">{{ error }}</span>
    <span v-else-if="hint" class="base-input__hint">{{ hint }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  hint: String,
  error: String,
  disabled: Boolean,
  readonly: Boolean,
  required: Boolean,
  iconLeft: String,
  iconRight: String
})

defineEmits(['update:modelValue'])

const focused = ref(false)
const inputId = computed(() => `input_${Math.random().toString(36).substr(2, 9)}`)

const handleFocus = () => { focused.value = true }
const handleBlur = () => { focused.value = false }
</script>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.base-input__label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.base-input__required {
  color: var(--error);
  margin-left: 2px;
}

.base-input__wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.base-input__field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background: var(--bg-input);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  outline: none;
  transition: all var(--transition-fast);
}

.base-input__field::placeholder {
  color: var(--text-muted);
}

.base-input__field:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.base-input__field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-input--error .base-input__field {
  border-color: var(--error);
}

.base-input--error .base-input__field:focus {
  box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.1);
}

.base-input__icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: var(--font-size-base);
}

.base-input__icon--left {
  left: var(--space-3);
}

.base-input__icon--right {
  right: var(--space-3);
}

.base-input__field:has(~ .base-input__icon--right) {
  padding-right: var(--space-10);
}

.base-input__error-text {
  font-size: var(--font-size-sm);
  color: var(--error);
}

.base-input__hint {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}
</style>