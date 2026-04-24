<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <h1 class="page-title">Medios de Pago</h1>
        <p class="page-subtitle">{{ mediosPagoStore.mediosPago.length }} métodos configurados</p>
      </div>
      <BaseButton variant="primary" @click="openModal(null)">
        <i class="ti ti-plus"></i>
        Nuevo
      </BaseButton>
    </div>

    <BaseCard>
      <BaseTable :headers="tableHeaders" :data="mediosPagoStore.mediosOrdenados" @row-click="openModal">
        <template #cell-nombre="{ row }">
          <div class="cell-nombre">
            <strong>
              <i :class="getIcon(row.nombre)" class="medio-icon"></i>
              {{ row.nombre }}
            </strong>
          </div>
        </template>
        <template #cell-acciones="{ row }">
          <div class="row-actions">
            <button class="action-btn" @click.stop="openModal(row)">
              <i class="ti ti-pencil"></i>
            </button>
            <button class="action-btn action-btn--danger" @click.stop="confirmDelete(row)">
              <i class="ti ti-trash"></i>
            </button>
          </div>
        </template>
      </BaseTable>

      <div v-if="!mediosPagoStore.mediosPago.length" class="empty-state">
        <i class="ti ti-credit-card"></i>
        <h3>Sin métodos de pago</h3>
        <p>Agrega los métodos de pago que aceptas</p>
      </div>
    </BaseCard>

    <BaseModal v-model="modalOpen" :title="editando ? 'Editar Medio de Pago' : 'Nuevo Medio de Pago'" size="sm">
      <form class="form">
        <BaseInput
          v-model="form.nombre"
          label="Nombre"
          required
          placeholder="Nombre del método"
        />
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="modalOpen = false">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" @click="guardar" :loading="saving">
          <i class="ti ti-device-floppy"></i>
          Guardar
        </BaseButton>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import BaseButton from '../components/common/BaseButton.vue'
import BaseInput from '../components/common/BaseInput.vue'
import BaseCard from '../components/common/BaseCard.vue'
import BaseTable from '../components/common/BaseTable.vue'
import BaseModal from '../components/common/BaseModal.vue'
import { useMediosPagoStore } from '../stores/mediosPago'
import { useToast } from '../composables/useToast'

const mediosPagoStore = useMediosPagoStore()
const toast = useToast()

const modalOpen = ref(false)
const editando = ref(false)
const saving = ref(false)

const form = ref({
  id: null,
  nombre: ''
})

const tableHeaders = [
  { key: 'nombre', label: 'Método de Pago' },
  { key: 'acciones', label: '', width: '100px' }
]

const iconos = {
  'efectivo': 'ti ti-cash',
  'transferencia': 'ti ti-bank',
  'débito': 'ti ti-credit-card',
  'crédito': 'ti ti-credit-card',
  'mercadopago': 'ti ti-brand-paypal',
  'pix': 'ti ti-qrcode'
}

const getIcon = (nombre) => {
  const lower = nombre?.toLowerCase() || ''
  for (const [key, icon] of Object.entries(iconos)) {
    if (lower.includes(key)) return icon
  }
  return 'ti ti-wallet'
}

onMounted(async () => {
  await mediosPagoStore.cargarMediosPago()
})

const openModal = (medio) => {
  if (medio) {
    editando.value = true
    form.value = { ...medio }
  } else {
    editando.value = false
    form.value = { id: null, nombre: '' }
  }
  modalOpen.value = true
}

const guardar = async () => {
  if (!form.value.nombre?.trim()) {
    toast.error('El nombre es requerido')
    return
  }

  saving.value = true

  try {
    if (editando.value) {
      await mediosPagoStore.actualizarMedioPago(form.value)
      toast.success('Medio de pago actualizado')
    } else {
      await mediosPagoStore.agregarMedioPago(form.value)
      toast.success('Medio de pago creado')
    }
    modalOpen.value = false
  } catch (e) {
    toast.error('Error al guardar')
    console.error(e)
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (medio) => {
  if (!confirm(`¿Eliminar "${medio.nombre}"?`)) return

  try {
    await mediosPagoStore.eliminarMedioPago(medio.id)
    toast.success('Medio de pago eliminado')
  } catch (e) {
    toast.error('Error al eliminar')
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

.cell-nombre {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.medio-icon {
  font-size: 20px;
  color: var(--accent);
}

.row-actions {
  display: flex;
  gap: var(--space-1);
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.action-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.action-btn--danger:hover {
  background: rgba(255, 59, 48, 0.1);
  color: var(--error);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.empty-state {
  text-align: center;
  padding: var(--space-10);
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: var(--space-4);
  color: var(--text-muted);
}

.empty-state h3 {
  margin-bottom: var(--space-2);
}
</style>