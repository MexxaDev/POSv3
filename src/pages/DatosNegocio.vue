<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <h1 class="page-title">Datos del Negocio</h1>
        <p class="page-subtitle">Configuración general</p>
      </div>
    </div>

    <div class="negocio-grid">
      <BaseCard title="Información">
        <form class="form" @submit.prevent="guardar">
          <BaseInput
            v-model="form.nombre"
            label="Nombre del negocio"
            placeholder="Mi Negocio"
          />
          <BaseInput
            v-model="form.direccion"
            label="Dirección"
            placeholder="Dirección comercial"
          />
          <BaseInput
            v-model="form.telefono"
            label="Teléfono"
            placeholder="+54 XXX XXXXXXX"
          />
          <BaseInput
            v-model="form.whatsapp"
            label="WhatsApp"
            placeholder="549XXXXXXXXX"
            hint="Sin + ni guiones. Para envío de cierres."
          />
          <BaseInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="contacto@ejemplo.com"
          />

          <div class="form-actions">
            <BaseButton variant="primary" type="submit" :loading="saving">
              <i class="ti ti-device-floppy"></i>
              Guardar
            </BaseButton>
          </div>
        </form>
      </BaseCard>

      <BaseCard title="Vista Previa Ticket">
        <div class="ticket-preview">
          <div class="ticket-header">
            <h3>{{ form.nombre || 'Nombre del Negocio' }}</h3>
            <p v-if="form.direccion">{{ form.direccion }}</p>
            <p v-if="form.telefono">Tel: {{ form.telefono }}</p>
          </div>
          <div class="ticket-divider">--------------------------------</div>
          <div class="ticket-items">
            <div class="ticket-item">
              <span>Producto Ejemplo</span>
              <span>x1</span>
              <span>$1.000</span>
            </div>
          </div>
          <div class="ticket-divider">--------------------------------</div>
          <div class="ticket-summary">
            <div class="ticket-row">
              <span>Subtotal:</span>
              <span>$1.000</span>
            </div>
            <div class="ticket-row ticket-row--total">
              <span>TOTAL:</span>
              <span>$1.000</span>
            </div>
          </div>
          <div class="ticket-footer">
            <p>¡Gracias por su compra!</p>
          </div>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import BaseButton from '../components/common/BaseButton.vue'
import BaseInput from '../components/common/BaseInput.vue'
import BaseCard from '../components/common/BaseCard.vue'
import { useNegocioStore } from '../stores/negocio'
import { useToast } from '../composables/useToast'

const negocioStore = useNegocioStore()
const toast = useToast()

const saving = ref(false)

const form = ref({
  nombre: '',
  direccion: '',
  telefono: '',
  whatsapp: '',
  email: '',
  logo: ''
})

onMounted(async () => {
  await negocioStore.cargarDatos()
  form.value = { ...negocioStore.datos }
})

const guardar = async () => {
  saving.value = true

  try {
    await negocioStore.guardarDatos(form.value)
    toast.success('Datos actualizados correctamente')
  } catch (e) {
    toast.error('Error al guardar')
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5);
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.page-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.negocio-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-actions {
  margin-top: var(--space-4);
}

.ticket-preview {
  background: white;
  color: black;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.ticket-header {
  text-align: center;
  margin-bottom: var(--space-3);
}

.ticket-header h3 {
  font-size: 14px;
  margin-bottom: var(--space-1);
}

.ticket-header p {
  margin: 2px 0;
  font-size: 10px;
}

.ticket-divider {
  text-align: center;
  margin: var(--space-2) 0;
  color: #999;
}

.ticket-items {
  margin: var(--space-2) 0;
}

.ticket-item {
  display: flex;
  justify-content: space-between;
}

.ticket-summary {
  margin-top: var(--space-2);
}

.ticket-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
}

.ticket-row--total {
  font-weight: bold;
  font-size: 14px;
  margin-top: var(--space-2);
}

.ticket-footer {
  text-align: center;
  margin-top: var(--space-3);
  font-size: 10px;
}

@media (max-width: 768px) {
  .negocio-grid {
    grid-template-columns: 1fr;
  }
}
</style>