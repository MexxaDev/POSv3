<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <h1 class="page-title">Categorías</h1>
        <p class="page-subtitle">{{ categoriasStore.categorias.length }} categorías</p>
      </div>
      <BaseButton variant="primary" @click="openModal(null)">
        <i class="ti ti-plus"></i>
        Nueva
      </BaseButton>
    </div>

    <BaseCard>
      <BaseTable :headers="tableHeaders" :data="categoriasStore.categoriasOrdenadas" @row-click="openModal">
        <template #cell-nombre="{ row }">
          <div class="cell-nombre">
            <strong>{{ row.nombre }}</strong>
            <small v-if="row.descripcion">{{ row.descripcion }}</small>
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

      <div v-if="!categoriasStore.categorias.length" class="empty-state">
        <i class="ti ti-tag"></i>
        <h3>Sin categorías</h3>
        <p>Agrega categorías para organizar tus productos</p>
      </div>
    </BaseCard>

    <BaseModal v-model="modalOpen" :title="editando ? 'Editar Categoría' : 'Nueva Categoría'" size="sm">
      <form class="form">
        <BaseInput
          v-model="form.nombre"
          label="Nombre"
          required
          placeholder="Nombre de la categoría"
        />
        <BaseInput
          v-model="form.descripcion"
          label="Descripción"
          placeholder="Descripción opcional"
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
import { useCategoriasStore } from '../stores/categorias'
import { useToast } from '../composables/useToast'

const categoriasStore = useCategoriasStore()
const toast = useToast()

const modalOpen = ref(false)
const editando = ref(false)
const saving = ref(false)

const form = ref({
  id: null,
  nombre: '',
  descripcion: ''
})

const tableHeaders = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'acciones', label: '', width: '100px' }
]

onMounted(async () => {
  await categoriasStore.cargarCategorias()
})

const openModal = (categoria) => {
  if (categoria) {
    editando.value = true
    form.value = { ...categoria }
  } else {
    editando.value = false
    form.value = { id: null, nombre: '', descripcion: '' }
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
      await categoriasStore.actualizarCategoria(form.value)
      toast.success('Categoría actualizada')
    } else {
      await categoriasStore.agregarCategoria(form.value)
      toast.success('Categoría creada')
    }
    modalOpen.value = false
  } catch (e) {
    toast.error('Error al guardar')
    console.error(e)
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (categoria) => {
  if (!confirm(`¿Eliminar categoría "${categoria.nombre}"?`)) return

  try {
    await categoriasStore.eliminarCategoria(categoria.id)
    toast.success('Categoría eliminada')
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
  flex-direction: column;
}

.cell-nombre small {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
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