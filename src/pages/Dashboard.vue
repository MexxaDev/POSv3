<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Resumen de tu negocio</p>
      </div>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>Período</label>
        <select v-model="filtros.periodo" @change="cambiarPeriodo">
          <option value="hoy">Hoy</option>
          <option value="ayer">Ayer</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mes</option>
          <option value="personalizado">Personalizado</option>
        </select>
      </div>
      <div v-if="filtros.periodo === 'personalizado'" class="filter-dates">
        <div class="filter-group">
          <label>Desde</label>
          <input type="date" v-model="filtros.fechaInicio" @change="aplicarFiltros" />
        </div>
        <div class="filter-group">
          <label>Hasta</label>
          <input type="date" v-model="filtros.fechaFin" @change="aplicarFiltros" />
        </div>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">
          <i class="ti ti-cash"></i>
        </div>
        <div class="metric-info">
          <span class="metric-value">${{ formatPrecio(reportesStore.totalVentas) }}</span>
          <span class="metric-label">Ventas Totales</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <i class="ti ti-receipt"></i>
        </div>
        <div class="metric-info">
          <span class="metric-value">{{ reportesStore.cantidadVentas }}</span>
          <span class="metric-label">Transacciones</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <i class="ti ti-ticket"></i>
        </div>
        <div class="metric-info">
          <span class="metric-value">${{ formatPrecio(reportesStore.ticketPromedio) }}</span>
          <span class="metric-label">Ticket Promedio</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <i class="ti ti-shopping-cart"></i>
        </div>
        <div class="metric-info">
          <span class="metric-value">{{ productosVendidos }}</span>
          <span class="metric-label">Items Vendidos</span>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <BaseCard title="Ventas por Día" class="chart-card">
        <div class="chart-container">
          <Bar :data="chartVentasData" :options="chartOptions" />
        </div>
      </BaseCard>

      <BaseCard title="Top Productos" class="chart-card">
        <div class="chart-container">
          <Bar :data="chartTopProductosData" :options="chartTopOptions" />
        </div>
      </BaseCard>

      <BaseCard title="Medios de Pago" class="chart-card">
        <div class="chart-container chart-container--doughnut">
          <Doughnut :data="chartMediosData" :options="chartDoughnutOptions" />
        </div>
      </BaseCard>

      <BaseCard title="Últimos 7 Días" class="chart-card">
        <div class="chart-container">
          <Line :data="chartLineData" :options="chartLineOptions" />
        </div>
      </BaseCard>
    </div>

    <div class="tables-grid">
      <BaseCard title="Top Clientes">
        <BaseTable :headers="clientesHeaders" :data="reportesStore.topClientes">
          <template #cell-nombre="{ row }">
            <strong>{{ row.nombre }}</strong>
          </template>
          <template #cell-ventas="{ value }">
            {{ value }} compras
          </template>
          <template #cell-total="{ value }">
            <strong>${{ formatPrecio(value) }}</strong>
          </template>
        </BaseTable>
        <div v-if="!reportesStore.topClientes.length" class="empty-message">
          Sin datos de clientes
        </div>
      </BaseCard>

      <BaseCard title="Actividad Reciente">
        <BaseTable :headers="actividadHeaders" :data="ventasRecientes">
          <template #cell-fecha="{ row }">
            {{ formatFecha(row.fecha) }}
          </template>
          <template #cell-total="{ value }">
            <strong>${{ formatPrecio(value) }}</strong>
          </template>
          <template #cell-medioPago="{ row }">
            {{ formatMedios(row.medioPago) }}
          </template>
        </BaseTable>
        <div v-if="!ventasRecientes.length" class="empty-message">
          Sin ventas registradas
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import AppLayout from '../components/layout/AppLayout.vue'
import BaseCard from '../components/common/BaseCard.vue'
import BaseTable from '../components/common/BaseTable.vue'
import { useReportesStore } from '../stores/reportes'
import { useCajaStore } from '../stores/caja'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

const reportesStore = useReportesStore()
const cajaStore = useCajaStore()

const filtros = ref({
  periodo: 'hoy',
  fechaInicio: '',
  fechaFin: ''
})

const clientesHeaders = [
  { key: 'nombre', label: 'Cliente' },
  { key: 'ventas', label: 'Compras' },
  { key: 'total', label: 'Total' }
]

const actividadHeaders = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'total', label: 'Monto' },
  { key: 'medioPago', label: 'Pago' }
]

onMounted(async () => {
  await reportesStore.cargarVentas()
  await cajaStore.cargarCaja()
  cambiarPeriodo()
})

const cambiarPeriodo = () => {
  const hoy = new Date()
  const fecha = hoy.toISOString().split('T')[0]

  switch (filtros.value.periodo) {
    case 'hoy':
      filtros.value.fechaInicio = fecha
      filtros.value.fechaFin = fecha
      break
    case 'ayer':
      const ayer = new Date(hoy)
      ayer.setDate(ayer.getDate() - 1)
      filtros.value.fechaInicio = ayer.toISOString().split('T')[0]
      filtros.value.fechaFin = filtros.value.fechaInicio
      break
    case 'semana':
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
      filtros.value.fechaInicio = inicioSemana.toISOString().split('T')[0]
      filtros.value.fechaFin = fecha
      break
    case 'mes':
      filtros.value.fechaInicio = fecha.substring(0, 7) + '-01'
      filtros.value.fechaFin = fecha
      break
  }
  aplicarFiltros()
}

const aplicarFiltros = () => {
  reportesStore.setFiltros({
    fechaInicio: filtros.value.fechaInicio,
    fechaFin: filtros.value.fechaFin
  })
}

const productosVendidos = computed(() => {
  return reportesStore.ventasFiltradas.reduce((sum, v) => {
    return sum + (v.articulos?.reduce((s, a) => s + a.cantidad, 0) || 0)
  }, 0)
})

const ventasRecientes = computed(() => {
  return reportesStore.ventasFiltradas.slice(0, 10)
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

const formatMedios = (medios) => {
  if (!medios?.length) return '-'
  return medios.map(m => m.medioNombre).join(', ')
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: true }
  }
}

const chartTopOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: { beginAtZero: true }
  }
}

const chartDoughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 12, padding: 8, font: { size: 11 } }
    }
  }
}

const chartLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: true }
  },
  elements: {
    line: { tension: 0.4 }
  }
}

const chartVentasData = computed(() => {
  const dias = reportesStore.ventasPorDia
  return {
    labels: dias.map(d => {
      const date = new Date(d.fecha)
      return date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })
    }),
    datasets: [{
      label: 'Ventas',
      data: dias.map(d => d.total),
      backgroundColor: '#6366f1',
      borderRadius: 4
    }]
  }
})

const chartTopProductosData = computed(() => {
  const productos = reportesStore.topProductos.slice(0, 5)
  return {
    labels: productos.map(p => p.nombre.substring(0, 15)),
    datasets: [{
      label: 'Cantidad',
      data: productos.map(p => p.cantidad),
      backgroundColor: '#10b981',
      borderRadius: 4
    }]
  }
})

const chartMediosData = computed(() => {
  const medios = reportesStore.ventasPorMedio
  const labels = Object.keys(medios)
  const data = Object.values(medios)
  const colors = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6']

  return {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: colors.slice(0, labels.length)
    }]
  }
})

const chartLineData = computed(() => {
  const dias = reportesStore.ventasPorDia
  return {
    labels: dias.map(d => {
      const date = new Date(d.fecha)
      return date.toLocaleDateString('es-AR', { weekday: 'short' })
    }),
    datasets: [{
      label: 'Ventas',
      data: dias.map(d => d.total),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }
})
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

.filter-group select,
.filter-group input {
  padding: var(--space-2) var(--space-3);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: var(--font-size-sm);
}

.filter-dates {
  display: flex;
  gap: var(--space-3);
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
  padding: var(--space-5);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
}

.metric-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: 20px;
  color: var(--accent);
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
  margin-bottom: var(--space-5);
}

.chart-card {
  min-height: 300px;
}

.chart-container {
  height: 220px;
  position: relative;
}

.chart-container--doughnut {
  height: 200px;
}

.tables-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

.empty-message {
  text-align: center;
  padding: var(--space-6);
  color: var(--text-muted);
}

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .tables-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
  }

  .filter-dates {
    flex-direction: column;
  }
}
</style>