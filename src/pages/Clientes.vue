<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <h1 class="page-title">Clientes</h1>
        <p class="page-subtitle">{{ clientes.length }} clientes registrados</p>
      </div>
      <BaseButton variant="primary" @click="openModal(null)">
        <i class="ti ti-plus"></i>
        Nuevo Cliente
      </BaseButton>
    </div>

    <BaseCard>
      <template #header>
        <div class="filters">
          <div class="filter-search">
            <i class="ti ti-search"></i>
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar por nombre, teléfono o email..."
              @input="handleBuscar"
            />
            <button v-if="busqueda" class="filter-clear" @click="busqueda = ''; handleBuscar()">
              <i class="ti ti-x"></i>
            </button>
          </div>
        </div>
      </template>

      <BaseTable :headers="tableHeaders" :data="clientesFiltrados" @row-click="openModal">
        <template #cell-nombre="{ row }">
          <div class="cell-nombre">
            <strong>{{ row.nombre }}</strong>
            <small v-if="row.telefono">
              <i class="ti ti-phone"></i> {{ row.telefono }}
            </small>
          </div>
        </template>
        <template #cell-info="{ row }">
          <div class="cell-info">
            <span v-if="row.email" class="info-item">
              <i class="ti ti-mail"></i> {{ row.email }}
            </span>
            <span v-if="row.direccion" class="info-item">
              <i class="ti ti-map-pin"></i> {{ row.direccion }}
            </span>
          </div>
        </template>
        <template #cell-compras="{ row }">
          <span v-if="row.compras" class="compras-badge">
            {{ row.compras }} compras
          </span>
          <span v-else class="text-muted">-</span>
        </template>
        <template #cell-acciones="{ row }">
          <div class="row-actions">
            <button class="action-btn" @click.stop="openModal(row)" title="Editar">
              <i class="ti ti-pencil"></i>
            </button>
            <button 
              v-if="row.nombre !== 'Consumidor Final'" 
              class="action-btn action-btn--danger" 
              @click.stop="confirmDelete(row)" 
              title="Eliminar"
            >
              <i class="ti ti-trash"></i>
            </button>
          </div>
        </template>
      </BaseTable>

      <div v-if="!clientesFiltrados.length" class="empty-state">
        <i class="ti ti-users"></i>
        <h3>Sin clientes</h3>
        <p>{{ busqueda ? 'No se encontraron coincidencias' : 'Agrega clientes para comenzar' }}</p>
      </div>
    </BaseCard>

    <BaseModal v-model="modalOpen" :title="editando ? 'Editar Cliente' : 'Nuevo Cliente'" size="md">
      <form class="form">
        <BaseInput
          v-model="form.nombre"
          label="Nombre *"
          required
          placeholder="Nombre completo"
        />
        <div class="form-row">
          <BaseInput
            v-model="form.telefono"
            label="Teléfono"
            placeholder="+54 XXX XXXXXXX"
          />
          <BaseInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="email@ejemplo.com"
          />
        </div>
        <BaseInput
          v-model="form.direccion"
          label="Dirección"
          placeholder="Dirección completa"
        />
        <div class="form-row">
          <BaseInput
            v-model="form.documento"
            label="Documento"
            placeholder="DNI/CUIT/CUIL"
          />
          <BaseInput
            v-model="form.notas"
            label="Notas"
            placeholder="Notas adicionales"
          />
        </div>
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="modalOpen = false">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" @click="guardar" :loading="saving">
          <i class="ti ti-device-floppy"></i>
          {{ editando ? 'Actualizar' : 'Crear' }}
        </BaseButton>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import BaseButton from '../components/common/BaseButton.vue'
import BaseInput from '../components/common/BaseInput.vue'
import BaseCard from '../components/common/BaseCard.vue'
import BaseTable from '../components/common/BaseTable.vue'
import BaseModal from '../components/common/BaseModal.vue'
import { useClientesStore } from '../stores/clientes'
import { useToast } from '../composables/useToast'

const clientesStore = useClientesStore()
const toast = useToast()

const busqueda = ref('')
const modalOpen = ref(false)
const editando = ref(false)
const saving = ref(false)

const form = ref({
  id: null,
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  documento: '',
  notas: ''
})

const tableHeaders = [
  { key: 'nombre', label: 'Cliente' },
  { key: 'info', label: 'Contacto' },
  { key: 'compras', label: 'Historial' },
  { key: 'acciones', label: '', width: '100px' }
]

const clientes = computed(() => clientesStore.clientes || [])

const clientesFiltrados = computed(() => {
  if (!busqueda.value) return clientes.value
  
  const search = busqueda.value.toLowerCase()
  return clientes.value.filter(c =>
    c.nombre?.toLowerCase().includes(search) ||
    c.telefono?.includes(search) ||
    c.email?.toLowerCase().includes(search)
  )
})

onMounted(async () => {
  await clientesStore.cargarClientes()
})

const handleBuscar = () => {
  clientesStore.setFiltro(busqueda.value)
}

const openModal = (cliente) => {
  if (cliente) {
    editando.value = true
    form.value = { ...cliente }
  } else {
    editando.value = false
    form.value = {
      id: null,
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
      documento: '',
      notas: ''
    }
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
    const data = {
      nombre: form.value.nombre.trim(),
      telefono: form.value.telefono?.trim() || '',
      email: form.value.email?.trim() || '',
      direccion: form.value.direccion?.trim() || '',
      documento: form.value.documento?.trim() || '',
      notas: form.value.notas?.trim() || ''
    }

    if (editando.value) {
      data.id = form.value.id
      await clientesStore.actualizarCliente(data)
      toast.success('Cliente actualizado')
    } else {
      await clientesStore.agregarCliente(data)
      toast.success('Cliente creado')
    }
    modalOpen.value = false
  } catch (e) {
    toast.error('Error al guardar')
    console.error(e)
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (cliente) => {
  if (cliente.nombre === 'Consumidor Final') {
    toast.error('No se puede eliminar Consumidor Final')
    return
  }
  if (!confirm(`¿Eliminar a "${cliente.nombre}"?`)) return

  try {
    await clientesStore.eliminarCliente(cliente.id)
    toast.success('Cliente eliminado')
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

.filters {
  display: flex;
  gap: var(--space-3);
}

.filter-search {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.filter-search i {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.filter-search input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) 36px;
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: var(--font-size-sm);
}

.filter-clear {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  padding: var(--space-1);
  color: var(--text-muted);
}

.cell-nombre {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.cell-nombre small {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.cell-nombre small i {
  font-size: 10px;
}

.cell-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-item {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.info-item i {
  font-size: 12px;
}

.compras-badge {
  background: var(--accent-light);
  color: var(--accent);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
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

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .filter-search {
    max-width: none;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>