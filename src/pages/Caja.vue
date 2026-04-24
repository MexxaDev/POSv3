<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <h1 class="page-title">Caja</h1>
        <p class="page-subtitle">
          <span :class="['status-badge', cajaStore.estaAbierta ? 'status-badge--open' : 'status-badge--closed']">
            {{ cajaStore.estaAbierta ? 'Abierta' : 'Cerrada' }}
          </span>
        </p>
      </div>
      <div class="page-actions">
        <BaseButton v-if="!cajaStore.estaAbierta" variant="primary" @click="openAperturaModal">
          <i class="ti ti-cash"></i>
          Abrir Caja
        </BaseButton>
        <BaseButton v-else variant="secondary" @click="openCierreModal">
          <i class="ti ti-cash-register"></i>
          Ver Cierre
        </BaseButton>
      </div>
    </div>

    <div v-if="cajaStore.estaAbierta" class="caja-grid">
      <BaseCard title="Resumen">
        <div class="caja-resumen">
          <div class="caja-resumen__row">
            <span>Saldo Inicial</span>
            <span>${{ formatPrecio(cajaStore.saldoActual) }}</span>
          </div>
          <div class="caja-resumen__row">
            <span>Ventas del día</span>
            <span class="monto-positivo">+${{ formatPrecio(totalVentasDia) }}</span>
          </div>
          <div class="caja-resumen__row">
            <span>Entradas</span>
            <span class="monto-positivo">+${{ formatPrecio(cajaStore.totalEntradas) }}</span>
          </div>
          <div class="caja-resumen__row">
            <span>Salidas</span>
            <span class="monto-negativo">-${{ formatPrecio(cajaStore.totalSalidas) }}</span>
          </div>
          <div class="caja-resumen__row caja-resumen__row--highlight">
            <span>Saldo Teórico</span>
            <span>${{ formatPrecio(cajaStore.cierreEsperado) }}</span>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Acciones Rápidas">
        <div class="caja-acciones">
          <BaseButton variant="secondary" block @click="openMovimiento('entrada')">
            <i class="ti ti-arrow-down"></i>
            Entrada de Dinero
          </BaseButton>
          <BaseButton variant="secondary" block @click="openMovimiento('salida')">
            <i class="ti ti-arrow-up"></i>
            Gasto / Egreso
          </BaseButton>
          <BaseButton variant="secondary" block @click="openVentasDelDia">
            <i class="ti ti-receipt"></i>
            Ventas del Día
          </BaseButton>
        </div>
      </BaseCard>

      <BaseCard title="Ventas por Método de Pago">
        <div class="ventas-metodo">
          <div v-for="(monto, medio) in ventasPorMedio" :key="medio" class="ventas-metodo__row">
            <span>{{ medio }}</span>
            <span class="monto-positivo">${{ formatPrecio(monto) }}</span>
          </div>
          <div v-if="Object.keys(ventasPorMedio).length === 0" class="empty-message">
            Sin ventas hoy
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Estadísticas">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ cantidadVentas }}</span>
            <span class="stat-label">Ventas</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${{ formatPrecio(ticketPromedio) }}</span>
            <span class="stat-label">Ticket Prom.</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ itemsVendidos }}</span>
            <span class="stat-label">Items</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <BaseCard v-if="cajaStore.movimientos.length && cajaStore.estaAbierta" title="Movimientos de Hoy">
      <BaseTable :headers="movimientosHeaders" :data="movimientosHoy">
        <template #cell-fecha="{ row }">
          {{ formatFecha(row.fecha) }}
        </template>
        <template #cell-tipo="{ row }">
          <span :class="['tipo-badge', row.tipo === 'entrada' ? 'tipo-badge--entrada' : 'tipo-badge--salida']">
            {{ row.tipo === 'entrada' ? 'Entrada' : 'Salida' }}
          </span>
        </template>
        <template #cell-monto="{ row }">
          <span :class="row.tipo === 'entrada' ? 'monto-positivo' : 'monto-negativo'">
            {{ row.tipo === 'entrada' ? '+' : '-' }}${{ formatPrecio(row.monto) }}
          </span>
        </template>
      </BaseTable>
    </BaseCard>

    <div v-if="!cajaStore.estaAbierta" class="caja-cerrada">
      <div class="caja-cerrada__icon">
        <i class="ti ti-cash-register"></i>
      </div>
      <h2>Caja Cerrada</h2>
      <p>Para registrar ventas, primero debes abrir la caja.</p>
      <BaseButton variant="primary" @click="openAperturaModal">
        <i class="ti ti-cash"></i>
        Abrir Caja
      </BaseButton>
    </div>

    <BaseModal v-model="aperturaModalOpen" title="Abrir Caja" size="sm">
      <div class="apertura-form">
        <BaseInput
          v-model.number="montoApertura"
          type="number"
          label="Monto inicial"
          placeholder="0"
        />
        <p class="form-hint">Ingresa el dinero con el que starts en la caja</p>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="aperturaModalOpen = false">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" @click="aperturarCaja" :loading="saving">
          <i class="ti ti-cash"></i>
          Abrir
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="movimientoModalOpen" :title="tipoMovimiento === 'entrada' ? 'Entrada de Dinero' : 'Gasto'" size="sm">
      <div class="movimiento-form">
        <BaseInput
          v-model.number="montoMovimiento"
          type="number"
          label="Monto"
          placeholder="0"
        />
        <BaseInput
          v-model="notaMovimiento"
          label="Concepto"
          placeholder="Descripción del movimiento"
        />
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="movimientoModalOpen = false">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" @click="guardarMovimiento" :loading="saving">
          <i class="ti ti-check"></i>
          Confirmar
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="cierreModalOpen" title="Cierre de Caja" size="lg">
      <div v-if="cajaStore.estaAbierta" class="cierre-content">
        <div class="cierre-section">
          <h4>Resumen General</h4>
          <div class="cierre-resumen">
            <div class="cierre-row">
              <span>Saldo Inicial</span>
              <span>${{ formatPrecio(cajaStore.saldoActual) }}</span>
            </div>
            <div class="cierre-row">
              <span>Total Ventas</span>
              <span>${{ formatPrecio(totalVentasDia) }}</span>
            </div>
            <div class="cierre-row">
              <span>Entradas</span>
              <span class="monto-positivo">+${{ formatPrecio(cajaStore.totalEntradas) }}</span>
            </div>
            <div class="cierre-row">
              <span>Salidas</span>
              <span class="monto-negativo">-${{ formatPrecio(cajaStore.totalSalidas) }}</span>
            </div>
          </div>
        </div>

        <div class="cierre-section">
          <h4>Ventas por Método de Pago</h4>
          <div class="cierre-resumen">
            <div v-for="(monto, medio) in ventasPorMedio" :key="medio" class="cierre-row">
              <span>{{ medio }}</span>
              <span>${{ formatPrecio(monto) }}</span>
            </div>
            <div v-if="Object.keys(ventasPorMedio).length === 0" class="empty-message">
              Sin ventas
            </div>
          </div>
        </div>

        <div class="cierre-section">
          <h4>Estadísticas</h4>
          <div class="cierre-resumen">
            <div class="cierre-row">
              <span>Cantidad de Ventas</span>
              <span>{{ cantidadVentas }}</span>
            </div>
            <div class="cierre-row">
              <span>Ticket Promedio</span>
              <span>${{ formatPrecio(ticketPromedio) }}</span>
            </div>
            <div class="cierre-row">
              <span>Items Vendidos</span>
              <span>{{ itemsVendidos }}</span>
            </div>
          </div>
        </div>

        <div class="cierre-section cierre-section--highlight">
          <h4>Saldo Teórico (Efectivo)</h4>
          <div class="cierre-total">
            <span>${{ formatPrecio(cajaStore.cierreEsperado) }}</span>
          </div>
        </div>

        <div class="cierre-input">
          <BaseInput
            v-model.number="montoRealCierre"
            type="number"
            label="Monto Real (efectivo en caja)"
            placeholder="Ingresá el monto contado"
          />
          <div v-if="montoRealCierre" class="cierre-diferencia" :class="diferenciaClase">
            <i :class="diferenciaIcono"></i>
            <span>{{ diferenciaTexto }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="cierreModalOpen = false">
          Cancelar
        </BaseButton>
        <BaseButton variant="secondary" @click="enviarWhatsApp" :disabled="!negocioStore.datos.whatsapp">
          <i class="ti ti-brand-whatsapp"></i>
          Enviar WhatsApp
        </BaseButton>
        <BaseButton variant="primary" @click="confirmarCierre" :loading="saving">
          <i class="ti ti-check"></i>
          Confirmar Cierre
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="ventasModalOpen" title="Ventas del Día" size="lg">
      <BaseTable :headers="ventasHeaders" :data="ventasDelDia">
        <template #cell-fecha="{ row }">
          {{ formatFecha(row.fecha) }}
        </template>
        <template #cell-total="{ row }">
          <strong>${{ formatPrecio(row.total) }}</strong>
        </template>
        <template #cell-medioPago="{ row }">
          {{ formatMedios(row.medioPago) }}
        </template>
      </BaseTable>
      <div v-if="!ventasDelDia.length" class="empty-message">
        No hay ventas hoy
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="ventasModalOpen = false">
          Cerrar
        </BaseButton>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import BaseButton from '../components/common/BaseButton.vue'
import BaseInput from '../components/common/BaseInput.vue'
import BaseCard from '../components/common/BaseCard.vue'
import BaseTable from '../components/common/BaseTable.vue'
import BaseModal from '../components/common/BaseModal.vue'
import { useCajaStore } from '../stores/caja'
import { useReportesStore } from '../stores/reportes'
import { useNegocioStore } from '../stores/negocio'
import { useToast } from '../composables/useToast'
import { whatsappService } from '../services/whatsappService'
import { database } from '../services/database'

const cajaStore = useCajaStore()
const reportesStore = useReportesStore()
const negocioStore = useNegocioStore()
const toast = useToast()

const aperturaModalOpen = ref(false)
const movimientoModalOpen = ref(false)
const cierreModalOpen = ref(false)
const ventasModalOpen = ref(false)

const montoApertura = ref(0)
const montoMovimiento = ref(0)
const notaMovimiento = ref('')
const tipoMovimiento = ref('entrada')
const montoRealCierre = ref(0)
const saving = ref(false)

const ventasDelDia = ref([])

const movimientosHeaders = [
  { key: 'fecha', label: 'Hora' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'monto', label: 'Monto' },
  { key: 'nota', label: 'Concepto' }
]

const ventasHeaders = [
  { key: 'fecha', label: 'Hora' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'total', label: 'Total' },
  { key: 'medioPago', label: 'Pago' }
]

const movimientosHoy = computed(() => {
  const hoy = new Date().toISOString().split('T')[0]
  return cajaStore.movimientos.filter(m => m.fecha.startsWith(hoy))
})

const totalVentasDia = computed(() => {
  return ventasDelDia.value.reduce((sum, v) => sum + (v.total || 0), 0)
})

const cantidadVentas = computed(() => {
  return ventasDelDia.value.length
})

const ticketPromedio = computed(() => {
  if (!cantidadVentas.value) return 0
  return totalVentasDia.value / cantidadVentas.value
})

const itemsVendidos = computed(() => {
  return ventasDelDia.value.reduce((sum, v) => {
    return sum + (v.articulos?.reduce((s, a) => s + a.cantidad, 0) || 0)
  }, 0)
})

const ventasPorMedio = computed(() => {
  const agrupado = {}
  ventasDelDia.value.forEach(v => {
    if (v.medioPago) {
      v.medioPago.forEach(m => {
        if (!agrupado[m.medioNombre]) {
          agrupado[m.medioNombre] = 0
        }
        agrupado[m.medioNombre] += m.monto || 0
      })
    }
  })
  return agrupado
})

const diferencia = computed(() => {
  if (!montoRealCierre.value) return 0
  return montoRealCierre.value - cajaStore.cierreEsperado
})

const diferenciaClase = computed(() => {
  if (diferencia.value === 0) return 'cierre-diferencia--exact'
  if (diferencia.value > 0) return 'cierre-diferencia--plus'
  return 'cierre-diferencia--minus'
})

const diferenciaTexto = computed(() => {
  if (diferencia.value === 0) return 'Cuadre exacto'
  if (diferencia.value > 0) return `Sobra: $${formatPrecio(diferencia.value)}`
  return `Falta: $${formatPrecio(Math.abs(diferencia.value))}`
})

const diferenciaIcono = computed(() => {
  if (diferencia.value === 0) return 'ti ti-check'
  if (diferencia.value > 0) return 'ti ti-trending-up'
  return 'ti ti-trending-down'
})

onMounted(async () => {
  await Promise.all([
    cajaStore.cargarCaja(),
    reportesStore.cargarVentas(),
    negocioStore.cargarDatos()
  ])
  await cargarVentasDelDia()
})

const cargarVentasDelDia = async () => {
  const hoy = new Date().toISOString().split('T')[0]
  const todas = await database.getAll('ventas')
  ventasDelDia.value = todas.filter(v => {
    const fechaVenta = new Date(v.fecha).toISOString().split('T')[0]
    return fechaVenta === hoy
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

const formatPrecio = (val) => {
  return new Intl.NumberFormat('es-AR').format(val || 0)
}

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMedios = (medios) => {
  if (!medios?.length) return '-'
  return medios.map(m => m.medioNombre).join(', ')
}

const openAperturaModal = () => {
  montoApertura.value = 0
  aperturaModalOpen.value = true
}

const aperturarCaja = async () => {
  if (montoApertura.value < 0) {
    toast.error('Ingresa un monto válido')
    return
  }

  saving.value = true
  try {
    await cajaStore.abrirCaja(montoApertura.value)
    toast.success('Caja abierta correctamente')
    aperturaModalOpen.value = false
    await cargarVentasDelDia()
  } catch (e) {
    toast.error('Error al abrir caja')
  } finally {
    saving.value = false
  }
}

const openMovimiento = (tipo) => {
  tipoMovimiento.value = tipo
  montoMovimiento.value = 0
  notaMovimiento.value = ''
  movimientoModalOpen.value = true
}

const guardarMovimiento = async () => {
  if (montoMovimiento.value <= 0) {
    toast.error('Ingresa un monto válido')
    return
  }

  saving.value = true
  try {
    await cajaStore.agregarMovimiento(
      tipoMovimiento.value,
      montoMovimiento.value,
      notaMovimiento.value || `Movimiento ${tipoMovimiento.value === 'entrada' ? 'entrada' : 'egreso'}`
    )
    toast.success(`${tipoMovimiento.value === 'entrada' ? 'Entrada' : 'Gasto'} registrado`)
    movimientoModalOpen.value = false
  } catch (e) {
    toast.error('Error al registrar')
  } finally {
    saving.value = false
  }
}

const openCierreModal = () => {
  montoRealCierre.value = 0
  cierreModalOpen.value = true
}

const openVentasDelDia = () => {
  ventasModalOpen.value = true
}

const confirmarCierre = async () => {
  saving.value = true
  try {
    await cajaStore.cerrarCaja(montoRealCierre.value)
    toast.success(`Caja cerrada. Diferencia: ${diferenciaTexto.value}`)
    cierreModalOpen.value = false
  } catch (e) {
    toast.error('Error al cerrar caja')
  } finally {
    saving.value = false
  }
}

const enviarWhatsApp = () => {
  const resumen = {
    saldoInicial: cajaStore.saldoActual,
    totalVentas: totalVentasDia.value,
    ingresos: cajaStore.totalEntradas,
    egresos: cajaStore.totalSalidas,
    saldoFinal: cajaStore.cierreEsperado,
    ventasPorMedio: ventasPorMedio.value,
    cantidadVentas: cantidadVentas.value,
    ticketPromedio: ticketPromedio.value
  }

  const mensaje = whatsappService.generarMensajeCierre(resumen)
  whatsappService.abrirWhatsApp(mensaje)
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

.status-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.status-badge--open {
  background: rgba(52, 199, 89, 0.1);
  color: var(--success);
}

.status-badge--closed {
  background: rgba(255, 59, 48, 0.1);
  color: var(--error);
}

.page-actions {
  display: flex;
  gap: var(--space-2);
}

.caja-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.caja-resumen {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.caja-resumen__row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) 0;
  font-size: var(--font-size-sm);
}

.caja-resumen__row--highlight {
  background: var(--bg-primary);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-weight: 600;
  color: var(--accent);
}

.caja-acciones {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ventas-metodo {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ventas-metodo__row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2);
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.stat-item {
  text-align: center;
  padding: var(--space-3);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
}

.stat-value {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.monto-positivo {
  color: var(--success);
  font-weight: 600;
}

.monto-negativo {
  color: var(--error);
  font-weight: 600;
}

.tipo-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.tipo-badge--entrada {
  background: rgba(52, 199, 89, 0.1);
  color: var(--success);
}

.tipo-badge--salida {
  background: rgba(255, 59, 48, 0.1);
  color: var(--error);
}

.caja-cerrada {
  text-align: center;
  padding: var(--space-12);
}

.caja-cerrada__icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-primary);
  font-size: 36px;
  color: var(--text-muted);
}

.caja-cerrada h2 {
  margin-bottom: var(--space-2);
}

.caja-cerrada p {
  color: var(--text-secondary);
  margin-bottom: var(--space-5);
}

.apertura-form,
.movimiento-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-hint {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.cierre-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.cierre-section {
  padding: var(--space-4);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
}

.cierre-section h4 {
  margin-bottom: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.cierre-section--highlight {
  background: var(--accent-light);
}

.cierre-resumen {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.cierre-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
}

.cierre-total {
  text-align: center;
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.cierre-input {
  padding: var(--space-4);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
}

.cierre-diferencia {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-weight: 600;
}

.cierre-diferencia--exact {
  background: rgba(52, 199, 89, 0.1);
  color: var(--success);
}

.cierre-diferencia--plus {
  background: rgba(52, 199, 89, 0.1);
  color: var(--success);
}

.cierre-diferencia--minus {
  background: rgba(255, 59, 48, 0.1);
  color: var(--error);
}

.empty-message {
  text-align: center;
  padding: var(--space-4);
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .caja-grid {
    grid-template-columns: 1fr;
  }
}
</style>