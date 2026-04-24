<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <h1 class="page-title">Reportes</h1>
        <p class="page-subtitle">{{ ventasFiltradas.length }} ventas encontradas</p>
      </div>
      <div class="page-actions">
        <BaseButton variant="secondary" @click="exportarCSV">
          <i class="ti ti-file-spreadsheet"></i>
          Exportar CSV
        </BaseButton>
      </div>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>Desde</label>
        <input v-model="filtros.fechaInicio" type="date" @change="aplicarFiltros" />
      </div>
      <div class="filter-group">
        <label>Hasta</label>
        <input v-model="filtros.fechaFin" type="date" @change="aplicarFiltros" />
      </div>
      <div class="filter-group">
        <label>Cliente</label>
        <input v-model="filtros.cliente" type="text" placeholder="Buscar..." @input="aplicarFiltros" />
      </div>
      <div class="filter-group">
        <label>Método de Pago</label>
        <select v-model="filtros.medioPago" @change="aplicarFiltros">
          <option value="">Todos</option>
          <option v-for="m in mediosPago" :key="m.id" :value="m.nombre">{{ m.nombre }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Monto Mín</label>
        <input v-model.number="filtros.montoMin" type="number" placeholder="0" @change="aplicarFiltros" />
      </div>
      <div class="filter-group">
        <label>Monto Máx</label>
        <input v-model.number="filtros.montoMax" type="number" placeholder="999999" @change="aplicarFiltros" />
      </div>
      <div class="filter-actions">
        <BaseButton variant="secondary" @click="limpiarFiltros">
          <i class="ti ti-x"></i>
          Limpiar
        </BaseButton>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">
          <i class="ti ti-cash"></i>
        </div>
        <div class="metric-info">
          <span class="metric-value">${{ formatPrecio(totalVentas) }}</span>
          <span class="metric-label">Ventas Totales</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <i class="ti ti-receipt"></i>
        </div>
        <div class="metric-info">
          <span class="metric-value">{{ cantidadVentas }}</span>
          <span class="metric-label">Transacciones</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <i class="ti ti-ticket"></i>
        </div>
        <div class="metric-info">
          <span class="metric-value">${{ formatPrecio(ticketPromedio) }}</span>
          <span class="metric-label">Ticket Promedio</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <i class="ti ti-shopping-cart"></i>
        </div>
        <div class="metric-info">
          <span class="metric-value">{{ cantidadItems }}</span>
          <span class="metric-label">Items Vendidos</span>
        </div>
      </div>
    </div>

    <BaseCard title="Historial de Ventas">
      <BaseTable :headers="headers" :data="ventasFiltradas">
        <template #cell-fecha="{ row }">
          {{ formatFecha(row.fecha) }}
        </template>
        <template #cell-cliente="{ row }">
          {{ row.cliente || 'Consumidor Final' }}
        </template>
        <template #cell-items="{ row }">
          {{ getItemsCount(row.articulos) }}
        </template>
        <template #cell-total="{ row }">
          <strong>${{ formatPrecio(row.total) }}</strong>
        </template>
        <template #cell-medioPago="{ row }">
          {{ formatMediosPago(row.medioPago) }}
        </template>
        <template #cell-acciones="{ row }">
          <div class="row-actions">
            <button class="action-btn" @click.stop="verDetalle(row)" title="Ver detalle">
              <i class="ti ti-eye"></i>
            </button>
            <button class="action-btn" @click.stop="imprimirVenta(row)" title="Imprimir">
              <i class="ti ti-printer"></i>
            </button>
          </div>
        </template>
      </BaseTable>

      <div v-if="!ventasFiltradas.length" class="empty-state">
        <i class="ti ti-chart-bar"></i>
        <h3>Sin datos</h3>
        <p>No hay ventas en el período seleccionado</p>
      </div>
    </BaseCard>

    <BaseModal v-model="detalleModalOpen" title="Detalle de Venta" size="md">
      <div v-if="ventaSeleccionada" class="venta-detalle">
        <div class="detalle-header">
          <div>
            <p><strong>Fecha:</strong> {{ formatFecha(ventaSeleccionada.fecha) }}</p>
            <p><strong>Cliente:</strong> {{ ventaSeleccionada.cliente || 'Consumidor Final' }}</p>
            <p v-if="ventaSeleccionada.nota"><strong>Nota:</strong> {{ ventaSeleccionada.nota }}</p>
          </div>
        </div>

        <div class="detalle-items">
          <div class="detalle-table-header">
            <span>Producto</span>
            <span>Cant.</span>
            <span>Precio</span>
            <span>Subtotal</span>
          </div>
          <div
            v-for="item in ventaSeleccionada.articulos"
            :key="item.id"
            class="detalle-item"
          >
            <span>{{ item.nombre }}</span>
            <span>x{{ item.cantidad }}</span>
            <span>${{ formatPrecio(item.precio) }}</span>
            <span>${{ formatPrecio(item.precio * item.cantidad) }}</span>
          </div>
        </div>

        <div class="detalle-summary">
          <div class="detalle-row">
            <span>Subtotal:</span>
            <span>${{ formatPrecio(ventaSeleccionada.subtotal) }}</span>
          </div>
          <div v-if="ventaSeleccionada.montoDescuento > 0" class="detalle-row detalle-row--desc">
            <span>Descuento:</span>
            <span>-${{ formatPrecio(ventaSeleccionada.montoDescuento) }}</span>
          </div>
          <div class="detalle-row detalle-row--total">
            <span>TOTAL:</span>
            <span>${{ formatPrecio(ventaSeleccionada.total) }}</span>
          </div>
          <div class="detalle-row detalle-row--pago">
            <span>Pago:</span>
            <span>{{ formatMediosPago(ventaSeleccionada.medioPago) }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="detalleModalOpen = false">
          Cerrar
        </BaseButton>
        <BaseButton variant="primary" @click="imprimirVenta(ventaSeleccionada)">
          <i class="ti ti-printer"></i>
          Imprimir
        </BaseButton>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import BaseButton from '../components/common/BaseButton.vue'
import BaseCard from '../components/common/BaseCard.vue'
import BaseTable from '../components/common/BaseTable.vue'
import BaseModal from '../components/common/BaseModal.vue'
import { useReportesStore } from '../stores/reportes'
import { useMediosPagoStore } from '../stores/mediosPago'
import { useNegocioStore } from '../stores/negocio'
import { useToast } from '../composables/useToast'

const reportesStore = useReportesStore()
const mediosPagoStore = useMediosPagoStore()
const negocioStore = useNegocioStore()
const toast = useToast()

const detalleModalOpen = ref(false)
const ventaSeleccionada = ref(null)

const filtros = ref({
  fechaInicio: '',
  fechaFin: '',
  cliente: '',
  medioPago: '',
  montoMin: null,
  montoMax: null
})

const mediosPago = computed(() => mediosPagoStore.mediosPago)

const headers = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'items', label: 'Items' },
  { key: 'total', label: 'Total' },
  { key: 'medioPago', label: 'Pago' },
  { key: 'acciones', label: '', width: '100px' }
]

const ventasFiltradas = computed(() => {
  let result = reportesStore.ventas

  if (filtros.value.fechaInicio) {
    const fechaInicio = new Date(filtros.value.fechaInicio)
    result = result.filter(v => new Date(v.fecha) >= fechaInicio)
  }

  if (filtros.value.fechaFin) {
    const fechaFin = new Date(filtros.value.fechaFin + 'T23:59:59')
    result = result.filter(v => new Date(v.fecha) <= fechaFin)
  }

  if (filtros.value.cliente) {
    const cliente = filtros.value.cliente.toLowerCase()
    result = result.filter(v =>
      v.cliente?.toLowerCase().includes(cliente)
    )
  }

  if (filtros.value.medioPago) {
    result = result.filter(v =>
      v.medioPago?.some(m => m.medioNombre === filtros.value.medioPago)
    )
  }

  if (filtros.value.montoMin != null) {
    result = result.filter(v => v.total >= filtros.value.montoMin)
  }

  if (filtros.value.montoMax != null) {
    result = result.filter(v => v.total <= filtros.value.montoMax)
  }

  return result.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const totalVentas = computed(() => {
  return ventasFiltradas.value.reduce((sum, v) => sum + (v.total || 0), 0)
})

const cantidadVentas = computed(() => {
  return ventasFiltradas.value.length
})

const ticketPromedio = computed(() => {
  if (!cantidadVentas.value) return 0
  return totalVentas.value / cantidadVentas.value
})

const cantidadItems = computed(() => {
  return ventasFiltradas.value.reduce((sum, v) => {
    return sum + (v.articulos?.reduce((s, item) => s + item.cantidad, 0) || 0)
  }, 0)
})

onMounted(async () => {
  await Promise.all([
    reportesStore.cargarVentas(),
    mediosPagoStore.cargarMediosPago(),
    negocioStore.cargarDatos()
  ])

  const hoy = new Date().toISOString().split('T')[0]
  filtros.value.fechaFin = hoy
  filtros.value.fechaInicio = hoy
})

const formatPrecio = (val) => {
  return new Intl.NumberFormat('es-AR').format(val || 0)
}

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMediosPago = (medios) => {
  if (!medios?.length) return '-'
  return medios.map(m => `${m.medioNombre}: $${formatPrecio(m.monto)}`).join(' + ')
}

const getItemsCount = (articulos) => {
  if (!articulos) return 0
  return articulos.reduce((sum, a) => sum + a.cantidad, 0)
}

const aplicarFiltros = () => {
  reportesStore.setFiltros(filtros.value)
}

const limpiarFiltros = () => {
  filtros.value = {
    fechaInicio: '',
    fechaFin: '',
    cliente: '',
    medioPago: '',
    montoMin: null,
    montoMax: null
  }
  reportesStore.limpiarFiltros()
}

const verDetalle = (venta) => {
  ventaSeleccionada.value = venta
  detalleModalOpen.value = true
}

const imprimirVenta = (venta) => {
  if (!venta) return

  const printContent = `
    <div style="font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 16px;">
        <h3 style="margin: 0;">${negocioStore.nombre}</h3>
        <p style="margin: 4px 0; font-size: 11px;">${negocioStore.datos.direccion || ''}</p>
        <p style="margin: 4px 0; font-size: 11px;">${negocioStore.datos.telefono || ''}</p>
      </div>
      <div style="font-size: 11px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #000;">
        <p style="margin: 4px 0;"><strong>Fecha:</strong> ${formatFecha(venta.fecha)}</p>
        <p style="margin: 4px 0;"><strong>Cliente:</strong> ${venta.cliente || 'Consumidor Final'}</p>
        ${venta.nota ? `<p style="margin: 4px 0;"><strong>Nota:</strong> ${venta.nota}</p>` : ''}
      </div>
      <div style="margin-bottom: 12px;">
        ${(venta.articulos || []).map(item => `
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin: 4px 0;">
            <span>${item.nombre} x${item.cantidad}</span>
            <span>$${formatPrecio(item.precio * item.cantidad)}</span>
          </div>
        `).join('')}
      </div>
      <div style="border-top: 1px dashed #000; padding-top: 12px; font-size: 11px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal:</span>
          <span>$${formatPrecio(venta.subtotal)}</span>
        </div>
        ${venta.montoDescuento > 0 ? `
          <div style="display: flex; justify-content: space-between; color: red;">
            <span>Descuento:</span>
            <span>-$${formatPrecio(venta.montoDescuento)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 8px; font-size: 14px;">
          <span>TOTAL:</span>
          <span>$${formatPrecio(venta.total)}</span>
        </div>
      </div>
      <div style="margin-top: 12px; font-size: 11px;">
        <p style="margin: 4px 0;"><strong>Pago:</strong> ${formatMediosPago(venta.medioPago)}</p>
      </div>
      <div style="text-align: center; margin-top: 16px; font-size: 10px;">
        ¡Gracias por su compra!
      </div>
    </div>
  `

  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head><title>Ticket - ${venta.id}</title></head>
      <body>${printContent}</body>
    </html>
  `)
  printWindow.document.close()
  setTimeout(() => printWindow.print(), 250)
}

const exportarCSV = () => {
  const headers = ['Fecha', 'Cliente', 'Items', 'Total', 'Medio de Pago']
  const rows = ventasFiltradas.value.map(v => [
    formatFecha(v.fecha),
    v.cliente || 'Consumidor Final',
    getItemsCount(v.articulos),
    v.total || 0,
    formatMediosPago(v.medioPago)
  ])

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ventas_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success('CSV exportado')
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
  gap: var(--space-4);
  align-items: flex-end;
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.filter-group label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
}

.filter-group input,
.filter-group select {
  padding: var(--space-2) var(--space-3);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: var(--font-size-sm);
  min-width: 120px;
}

.filter-actions {
  margin-left: auto;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
}

.metric-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: 18px;
  color: var(--accent);
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
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
  color: var(--accent);
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

.venta-detalle {
  font-size: var(--font-size-sm);
}

.detalle-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: var(--border-subtle);
}

.detalle-header p {
  margin: var(--space-1) 0;
}

.detalle-items {
  margin-bottom: var(--space-4);
}

.detalle-table-header {
  display: grid;
  grid-template-columns: 2fr 0.5fr 1fr 1fr;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.detalle-item {
  display: grid;
  grid-template-columns: 2fr 0.5fr 1fr 1fr;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  border-bottom: var(--border-subtle);
}

.detalle-summary {
  padding-top: var(--space-3);
  border-top: var(--border-subtle);
}

.detalle-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-1) 0;
}

.detalle-row--desc {
  color: var(--error);
}

.detalle-row--total {
  font-weight: 700;
  font-size: var(--font-size-md);
  padding-top: var(--space-2);
  margin-top: var(--space-2);
  border-top: var(--border-subtle);
}

.detalle-row--pago {
  margin-top: var(--space-2);
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group input,
  .filter-group select {
    width: 100%;
    min-width: auto;
  }

  .filter-actions {
    margin-left: 0;
    margin-top: var(--space-2);
  }
}
</style>