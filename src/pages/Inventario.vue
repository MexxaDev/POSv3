<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <h1 class="page-title">Inventario</h1>
        <p class="page-subtitle">{{ articulos.length }} productos</p>
      </div>
      <div class="page-actions">
        <BaseButton variant="secondary" @click="exportarArticulos" :disabled="!articulos.length">
          <i class="ti ti-download"></i>
          Exportar
        </BaseButton>
        <BaseButton variant="secondary" @click="importarArticulos">
          <i class="ti ti-upload"></i>
          Importar
        </BaseButton>
        <BaseButton variant="primary" @click="openModal">
          <i class="ti ti-plus"></i>
          Agregar
        </BaseButton>
      </div>
    </div>

    <BaseCard>
      <template #header>
        <div class="filters">
          <div class="filter-search">
            <i class="ti ti-search"></i>
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar por nombre, código o barra..."
              @input="handleFiltrar"
            />
            <button v-if="busqueda" class="filter-clear" @click="busqueda = ''; handleFiltrar()">
              <i class="ti ti-x"></i>
            </button>
          </div>
          <select v-model="categoriaFiltro" class="filter-select" @change="handleFiltrar">
            <option value="">Todas las categorías</option>
            <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <select v-model="stockFiltro" class="filter-select filter-select--small" @change="handleFiltrar">
            <option value="">Todo stock</option>
            <option value="bajo">Stock bajo</option>
            <option value="sin">Sin stock</option>
            <option value="disponible">Con stock</option>
          </select>
        </div>
      </template>

      <BaseTable :headers="tableHeaders" :data="articulosFiltrados" @row-click="editarArticulo">
        <template #cell-nombre="{ row }">
          <div class="cell-nombre">
            <strong>{{ row.nombre }}</strong>
            <small v-if="row.codigo">Código: {{ row.codigo }}</small>
          </div>
        </template>
        <template #cell-codigo_barras="{ row }">
          <span v-if="row.codigo_barras" class="barcode">{{ row.codigo_barras }}</span>
          <span v-else class="text-muted">-</span>
        </template>
        <template #cell-precio="{ value }">
          <strong class="precio">${{ formatPrecio(value) }}</strong>
        </template>
        <template #cell-stock="{ row }">
          <span :class="['stock-badge', getStockClass(row.stock)]">
            <i :class="getStockIcon(row.stock)"></i>
            {{ row.stock }}
          </span>
        </template>
        <template #cell-acciones="{ row }">
          <div class="row-actions">
            <button class="action-btn" @click.stop="editarArticulo(row)" title="Editar">
              <i class="ti ti-pencil"></i>
            </button>
            <button class="action-btn action-btn--danger" @click.stop="confirmDelete(row)" title="Eliminar">
              <i class="ti ti-trash"></i>
            </button>
          </div>
        </template>
      </BaseTable>

      <div v-if="!articulosFiltrados.length" class="empty-state">
        <i class="ti ti-packages"></i>
        <h3>No hay productos</h3>
        <p>{{ busqueda || categoriaFiltro ? 'No se encontraron coincidencias' : 'Agrega productos para comenzar' }}</p>
      </div>
    </BaseCard>

    <BaseModal v-model="modalOpen" :title="editando ? 'Editar Producto' : 'Nuevo Producto'" size="md">
      <form class="form" @submit.prevent="guardar">
        <div class="form-row">
          <BaseInput
            v-model="form.nombre"
            label="Nombre *"
            required
            placeholder="Nombre del producto"
          />
          <BaseInput
            v-model="form.codigo"
            label="Código interno"
            placeholder="Código de producto"
          />
        </div>

        <div class="form-row">
          <BaseInput
            v-model="form.codigo_barras"
            label="Código de barras"
            placeholder="EAN/UPC"
          />
          <BaseInput
            v-model="form.categoria"
            label="Categoría *"
            required
            placeholder="Ej: Bebidas, Comidas"
            list="categorias-list"
          />
          <datalist id="categorias-list">
            <option v-for="cat in categorias" :key="cat" :value="cat" />
          </datalist>
        </div>

        <div class="form-row form-row--prices">
          <BaseInput
            v-model.number="form.precio"
            type="number"
            label="Precio de venta *"
            required
            placeholder="0"
          />
          <BaseInput
            v-model.number="form.stock"
            type="number"
            label="Stock actual"
            placeholder="0"
          />
          <BaseInput
            v-model.number="form.stockMinimo"
            type="number"
            label="Stock mínimo"
            placeholder="5"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Proveedor (opcional)</label>
          <input
            v-model="form.proveedor"
            type="text"
            class="form-input"
            placeholder="Nombre del proveedor"
          />
        </div>
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="modalOpen = false">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" @click="guardar" :loading="saving">
          <i class="ti ti-device-floppy"></i>
          {{ editando ? 'Actualizar' : 'Guardar' }}
        </BaseButton>
      </template>
    </BaseModal>

    <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleImport" />
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
import { useArticulosStore } from '../stores/articulos'
import { useToast } from '../composables/useToast'
import { database } from '../services/database'

const articulosStore = useArticulosStore()
const toast = useToast()

const busqueda = ref('')
const categoriaFiltro = ref('')
const stockFiltro = ref('')
const modalOpen = ref(false)
const editando = ref(false)
const saving = ref(false)
const fileInput = ref(null)

const form = ref({
  id: null,
  nombre: '',
  codigo: '',
  codigo_barras: '',
  categoria: '',
  precio: 0,
  stock: 0,
  stockMinimo: 5,
  proveedor: ''
})

const tableHeaders = [
  { key: 'nombre', label: 'Producto' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'codigo_barras', label: 'Barras' },
  { key: 'precio', label: 'Precio' },
  { key: 'stock', label: 'Stock' },
  { key: 'acciones', label: '', width: '100px' }
]

const articulos = computed(() => articulosStore.articulos)
const categorias = computed(() => articulosStore.categoriasUnicas)

const articulosFiltrados = computed(() => {
  let result = articulos.value

  if (busqueda.value) {
    const search = busqueda.value.toLowerCase()
    result = result.filter(a =>
      a.nombre?.toLowerCase().includes(search) ||
      a.codigo?.toLowerCase().includes(search) ||
      a.codigo_barras?.includes(search)
    )
  }

  if (categoriaFiltro.value) {
    result = result.filter(a => a.categoria === categoriaFiltro.value)
  }

  if (stockFiltro.value) {
    switch (stockFiltro.value) {
      case 'bajo':
        result = result.filter(a => a.stock > 0 && a.stock <= (a.stockMinimo || 5))
        break
      case 'sin':
        result = result.filter(a => a.stock <= 0)
        break
      case 'disponible':
        result = result.filter(a => a.stock > 0)
        break
    }
  }

  return result
})

onMounted(async () => {
  await articulosStore.cargarArticulos()
})

const handleFiltrar = () => {
  articulosStore.setFiltro({
    buscar: busqueda.value,
    categoria: categoriaFiltro.value
  })
}

const formatPrecio = (val) => {
  return new Intl.NumberFormat('es-AR').format(val || 0)
}

const getStockClass = (stock) => {
  if (stock <= 0) return 'stock-badge--empty'
  if (stock <= 5) return 'stock-badge--low'
  return 'stock-badge--ok'
}

const getStockIcon = (stock) => {
  if (stock <= 0) return 'ti ti-x'
  if (stock <= 5) return 'ti ti-alert'
  return 'ti ti-check'
}

const openModal = () => {
  editando.value = false
  form.value = {
    id: null,
    nombre: '',
    codigo: '',
    codigo_barras: '',
    categoria: '',
    precio: 0,
    stock: 0,
    stockMinimo: 5,
    proveedor: ''
  }
  modalOpen.value = true
}

const editarArticulo = (articulo) => {
  editando.value = true
  form.value = {
    id: articulo.id,
    nombre: articulo.nombre || '',
    codigo: articulo.codigo || '',
    codigo_barras: articulo.codigo_barras || '',
    categoria: articulo.categoria || '',
    precio: articulo.precio || 0,
    stock: articulo.stock || 0,
    stockMinimo: articulo.stockMinimo || 5,
    proveedor: articulo.proveedor || ''
  }
  modalOpen.value = true
}

const guardar = async () => {
  if (!form.value.nombre?.trim()) {
    toast.error('El nombre es requerido')
    return
  }

  if (!form.value.categoria?.trim()) {
    toast.error('La categoría es requerida')
    return
  }

  saving.value = true

  try {
    const data = {
      nombre: form.value.nombre.trim(),
      codigo: form.value.codigo?.trim() || '',
      codigo_barras: form.value.codigo_barras?.trim() || '',
      categoria: form.value.categoria.trim(),
      precio: Number(form.value.precio) || 0,
      stock: Number(form.value.stock) || 0,
      stockMinimo: Number(form.value.stockMinimo) || 5,
      proveedor: form.value.proveedor?.trim() || ''
    }

    if (editando.value) {
      data.id = form.value.id
      await articulosStore.actualizarArticulo(data)
      toast.success('Producto actualizado')
    } else {
      await articulosStore.agregarArticulo(data)
      toast.success('Producto agregado')
    }
    modalOpen.value = false
  } catch (e) {
    toast.error('Error al guardar')
    console.error(e)
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (articulo) => {
  if (!confirm(`¿Eliminar "${articulo.nombre}"?`)) return

  try {
    await articulosStore.eliminarArticulo(articulo.id)
    toast.success('Producto eliminado')
  } catch (e) {
    toast.error('Error al eliminar')
  }
}

const exportarArticulos = () => {
  const data = {
    version: 1,
    fechaExport: new Date().toISOString(),
    articulos: articulos.value.map(a => ({
      nombre: a.nombre,
      codigo: a.codigo,
      codigo_barras: a.codigo_barras,
      categoria: a.categoria,
      precio: a.precio,
      stock: a.stock,
      stockMinimo: a.stockMinimo || 5,
      proveedor: a.proveedor || ''
    }))
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `articulos_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
  toast.success('Artículos exportados')
}

const importarArticulos = () => {
  fileInput.value?.click()
}

const handleImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (!data.articulos || !Array.isArray(data.articulos)) {
      toast.error('Archivo inválido. Debe contener un array "articulos"')
      return
    }

    let importados = 0
    for (const item of data.articulos) {
      if (item.nombre && item.categoria) {
        await database.add('articulos', {
          nombre: item.nombre,
          codigo: item.codigo || '',
          codigo_barras: item.codigo_barras || '',
          categoria: item.categoria,
          precio: Number(item.precio) || 0,
          stock: Number(item.stock) || 0,
          stockMinimo: Number(item.stockMinimo) || 5,
          proveedor: item.proveedor || ''
        })
        importados++
      }
    }

    await articulosStore.cargarArticulos()
    toast.success(`${importados} productos importados`)
  } catch (e) {
    toast.error('Error al importar: ' + e.message)
  }

  event.target.value = ''
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

.page-actions {
  display: flex;
  gap: var(--space-2);
}

.filters {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  flex-wrap: wrap;
}

.filter-search {
  position: relative;
  flex: 1;
  min-width: 200px;
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

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  font-size: var(--font-size-sm);
  min-width: 140px;
}

.filter-select--small {
  min-width: 100px;
}

.cell-nombre {
  display: flex;
  flex-direction: column;
}

.cell-nombre small {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}

.barcode {
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.precio {
  color: var(--accent);
}

.stock-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.stock-badge--ok {
  background: rgba(52, 199, 89, 0.1);
  color: var(--success);
}

.stock-badge--low {
  background: rgba(255, 193, 7, 0.1);
  color: var(--warning);
}

.stock-badge--empty {
  background: rgba(255, 59, 48, 0.1);
  color: var(--error);
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
  gap: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.form-row--prices {
  grid-template-columns: repeat(3, 1fr);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.form-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
}

.form-input {
  padding: var(--space-2) var(--space-3);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  font-size: var(--font-size-sm);
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
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .page-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-search {
    min-width: auto;
  }

  .form-row,
  .form-row--prices {
    grid-template-columns: 1fr;
  }
}
</style>