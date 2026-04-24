<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-card__icon">
        <i class="ti ti-point-of-sale"></i>
      </div>
      <h1 class="login-card__title">Sistema POS</h1>
      <p class="login-card__subtitle">Ingresa tu PIN para continuar</p>

      <form class="login-card__form" @submit.prevent="handleLogin">
        <div v-if="error" class="login-card__error">
          <i class="ti ti-alert-circle"></i>
          {{ error }}
        </div>

        <div class="login-card__pin-wrapper">
          <input
            ref="pinInput"
            v-model="pin"
            type="password"
            class="login-card__pin"
            placeholder="••••"
            maxlength="4"
            autocomplete="off"
            @input="handlePinInput"
            @keyup.enter="handleLogin"
          />
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          block
          :loading="loading"
        >
          <i class="ti ti-login"></i>
          Ingresar
        </BaseButton>
      </form>

      <div class="login-card__hint">
        <p>PIN por defecto: <strong>1234</strong></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BaseButton from '../components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const pin = ref('')
const error = ref('')
const loading = ref(false)
const pinInput = ref(null)

onMounted(() => {
  pinInput.value?.focus()
})

const handlePinInput = (e) => {
  const value = e.target.value.replace(/\D/g, '')
  pin.value = value.slice(0, 4)
  error.value = ''
}

const handleLogin = async () => {
  if (pin.value.length !== 4) {
    error.value = 'Ingresa un PIN de 4 dígitos'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const success = await authStore.login(pin.value)
    if (success) {
      router.push('/')
    } else {
      error.value = 'PIN incorrecto'
      pin.value = ''
    }
  } catch (e) {
    error.value = 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: var(--space-4);
}

.login-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-10);
  width: 100%;
  max-width: 380px;
  box-shadow: var(--shadow-float);
}

.login-card__icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: var(--accent);
  font-size: var(--font-size-2xl);
  color: white;
}

.login-card__title {
  text-align: center;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.login-card__subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

.login-card__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.login-card__error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: rgba(255, 59, 48, 0.1);
  color: var(--error);
  font-size: var(--font-size-sm);
}

.login-card__pin-wrapper {
  display: flex;
  justify-content: center;
}

.login-card__pin {
  width: 140px;
  padding: var(--space-4);
  font-size: var(--font-size-2xl);
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.5em;
  background: var(--bg-primary);
  border: 2px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  outline: none;
  transition: all var(--transition-fast);
}

.login-card__pin:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.login-card__hint {
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: var(--border-subtle);
  text-align: center;
}

.login-card__hint p {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.login-card__hint strong {
  color: var(--text-primary);
}
</style>