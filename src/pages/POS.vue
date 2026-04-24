<template>
  <AppLayout>
    <div class="pos-layout">
      <div class="pos-main">
        <div class="pos-search">
          <i class="ti ti-search"></i>
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar producto..."
            class="pos-search__input"
            @input="handleBuscar"
          />
        </div>

        <div class="category-pills">
          <button
            class="category-pill"
            :class="{ 'category-pill--active': !categoriaSeleccionada }"
            @click="categoriaSeleccionada = ''"
          >
            Todos
          </button>
          <button
            v-for="cat in categorias"
            :key="cat"
            class="category-pill"
            :class="{ 'category-pill--active': categoriaSeleccionada === cat }"
            @click="categoriaSeleccionada = cat"
          >
            {{ cat }}
          </button>
        </div>

        <div class="product-grid">
          <div
            v-for="articulo in articulosFiltrados"
            :key="articulo.id"
            class="product-card"
            :class="{ 'product-card--low-stock': articulo.stock <= 5 }"
            @click="agregarCarrito(articulo)"
          >
            <div class="product-card__image">
              <i class="ti ti-package"></i>
              <span v-if="articulo.stock <= 5" class="stock-badge">Stock bajo</span>
            </div>
            <div class="product-card__info">
              <h3 class="product-card__name">{{ articulo.nombre }}</h3>
              <p class="product-card__price">${{ formatPrecio(articulo.precio) }}</p>
            </div>
          </div>

          <div v-if="!articulosFiltrados.length" class="product-grid__empty">
            <i class="ti ti-packages"></i>
            <p>No hay productos</p>
            <small>Agrega productos en Inventario</small>
          </div>
        </div>
      </div>

      <aside class="order-panel">
        <div class="order-panel__header">
          <h2 class="order-panel__title">Pedido</h2>
          <span class="order-panel__count">{{ itemsCount }} items</span>
        </div>

        <div class="order-panel__customer">
          <button class="order-panel__customer-btn" @click="abrirSelectorCliente">
            <i class="ti ti-user"></i>
            <span>{{ clienteNombre }}</span>
            <i class="ti ti-chevron-right"></i>
          </button>
        </div>

        <div class="order-panel__barcode">
          <input
            ref="barcodeInput"
            v-model="codigoBarras"
            type="text"
            placeholder="Código de barras"
            class="order-panel__barcode-input"
            @keyup.enter="buscarPorCodigo"
          />
          <button class="order-panel__barcode-btn" @click="buscarPorCodigo">
            <i class="ti ti-barcode"></i>
          </button>
        </div>

        <div class="order-panel__items">
          <div
            v-for="item in carrito"
            :key="item.id"
            class="order-item"
          >
            <div class="order-item__info">
              <h4 class="order-item__name">{{ item.nombre }}</h4>
              <p class="order-item__price">${{ formatPrecio(item.precio * item.cantidad) }}</p>
            </div>
            <div class="order-item__controls">
              <button class="order-item__btn" @click="actualizarCantidad(item.id, item.cantidad - 1)">
                <i class="ti ti-minus"></i>
              </button>
              <span class="order-item__qty">{{ item.cantidad }}</span>
              <button class="order-item__btn" @click="actualizarCantidad(item.id, item.cantidad + 1)">
                <i class="ti ti-plus"></i>
              </button>
              <button class="order-item__delete" @click="eliminarDelCarrito(item.id)">
                <i class="ti ti-trash"></i>
              </button>
            </div>
          </div>

          <div v-if="!carrito.length" class="order-panel__empty">
            <i class="ti ti-shopping-cart"></i>
            <p>Agrega productos</p>
          </div>
        </div>

        <div class="order-panel__summary">
          <div class="order-summary">
            <div class="order-summary__row">
              <span>Subtotal</span>
              <span>${{ formatPrecio(subtotal) }}</span>
            </div>
            <div v-if="montoDescuento > 0" class="order-summary__row order-summary__row--desc">
              <span>Descuento</span>
              <span>-${{ formatPrecio(montoDescuento) }}</span>
            </div>
            <div class="order-summary__row order-summary__row--total">
              <span>Total</span>
              <span>${{ formatPrecio(total) }}</span>
            </div>
          </div>
        </div>

        <div class="order-panel__extras">
          <div class="extras-toggles">
            <button 
              class="extras-toggle" 
              :class="{ 'extras-toggle--active': showNota }"
              @click="showNota = !showNota"
            >
              <i class="ti ti-note"></i>
              Nota
            </button>
            <button 
              class="extras-toggle" 
              :class="{ 'extras-toggle--active': showDescuento }"
              @click="showDescuento = !showDescuento"
            >
              <i class="ti ti-discount"></i>
              Desc.
            </button>
            <button 
              class="extras-toggle" 
              :class="{ 'extras-toggle--active': showMediosPago }"
              @click="showMediosPago = !showMediosPago"
            >
              <i class="ti ti-credit-card"></i>
              Pago
            </button>
          </div>

          <div v-if="showNota" class="extras-content">
            <div class="extras-group">
              <textarea
                v-model="nota"
                class="extras-textarea"
                placeholder="Notas del pedido..."
                rows="2"
              ></textarea>
            </div>
          </div>

          <div v-if="showDescuento" class="extras-content">
            <div class="extras-group">
              <label>Descuento</label>
              <div class="extras-row">
                <select v-model="descuento.tipo" class="extras-select">
                  <option value="porcentaje">%</option>
                  <option value="fijo">$</option>
                </select>
                <input
                  v-model.number="descuento.valor"
                  type="number"
                  min="0"
                  class="extras-input"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div v-if="showMediosPago" class="extras-content">
            <div class="extras-group">
              <label>Métodos de pago</label>
              <div
                v-for="(mp, index) in mediosPagoSeleccionados"
                :key="index"
                class="extras-row"
              >
                <select v-model="mp.medioNombre" class="extras-select extras-select--medium">
                  <option v-for="m in mediosPagoDisponibles" :key="m.id" :value="m.nombre">
                    {{ m.nombre }}
                  </option>
                </select>
                <input
                  v-model.number="mp.monto"
                  type="number"
                  min="0"
                  class="extras-input"
                  placeholder="Monto"
                />
                <button v-if="mediosPagoSeleccionados.length > 1" class="extras-remove" @click="eliminarMedioPago(index)">
                  <i class="ti ti-x"></i>
                </button>
              </div>
              <button class="extras-add" @click="agregarMedioPago">
                <i class="ti ti-plus"></i>
                Agregar medio
              </button>
            </div>

            <div class="pago-status" :class="statusPago.clase">
              <i :class="statusPago.icono"></i>
              <span>{{ statusPago.texto }}</span>
            </div>
          </div>
        </div>

        <div class="order-panel__actions">
          <BaseButton
            variant="primary"
            block
            :disabled="!carrito.length || !pagoCompleto"
            @click="procesarVenta"
          >
            <i class="ti ti-cash"></i>
            Cobrar ${{ formatPrecio(total) }}
          </BaseButton>
          <BaseButton
            v-if="carrito.length"
            variant="ghost"
            block
            @click="vaciarCarrito"
          >
            <i class="ti ti-trash"></i>
            Vaciar
          </BaseButton>
        </div>
      </aside>
    </div>

    <BaseModal v-model="clienteModalOpen" title="Seleccionar Cliente" size="md">
      <div class="cliente-buscador">
        <div class="cliente-search">
          <i class="ti ti-search"></i>
          <input
            v-model="busquedaCliente"
            type="text"
            placeholder="Buscar cliente..."
            autofocus
          />
          <button v-if="busquedaCliente" class="cliente-search__clear" @click="busquedaCliente = ''">
            <i class="ti ti-x"></i>
          </button>
        </div>
      </div>
      <div class="cliente-list">
        <button
          class="cliente-item"
          :class="{ 'cliente-item--selected': !clienteActual }"
          @click="setCliente(null)"
        >
          <div class="cliente-item__info">
            <h4>Consumidor Final</h4>
            <p>Venta sin cliente</p>
          </div>
          <i class="ti ti-check"></i>
        </button>
        <button
          v-for="cliente in clientesFiltrados"
          :key="cliente.id"
          class="cliente-item"
          :class="{ 'cliente-item--selected': clienteActual?.id === cliente.id }"
          @click="setCliente(cliente)"
        >
          <div class="cliente-item__info">
            <h4>{{ cliente.nombre }}</h4>
            <p>{{ cliente.telefono || cliente.email || 'Sin datos' }}</p>
          </div>
          <i v-if="clienteActual?.id === cliente.id" class="ti ti-check"></i>
        </button>
        <div v-if="clientesFiltrados.length === 0 && busquedaCliente" class="cliente-empty">
          <p>No se encontraron clientes</p>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="clienteModalOpen = false">
          Cerrar
        </BaseButton>
        <BaseButton variant="primary" @click="abrirNuevoCliente">
          <i class="ti ti-plus"></i>
          Nuevo Cliente
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="nuevoClienteModalOpen" title="Nuevo Cliente" size="sm">
      <form class="form">
        <BaseInput
          v-model="nuevoCliente.nombre"
          label="Nombre"
          required
          placeholder="Nombre del cliente"
        />
        <BaseInput
          v-model="nuevoCliente.telefono"
          label="Teléfono"
          placeholder="Teléfono"
        />
        <BaseInput
          v-model="nuevoCliente.email"
          label="Email"
          type="email"
          placeholder="email@ejemplo.com"
        />
        <BaseInput
          v-model="nuevoCliente.direccion"
          label="Dirección"
          placeholder="Dirección"
        />
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="nuevoClienteModalOpen = false">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" @click="crearCliente" :loading="creandoCliente">
          <i class="ti ti-device-floppy"></i>
          Crear
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="ticketModalOpen" title="Ticket de Venta" size="sm">
      <div class="ticket-content">
        <div class="ticket-header">
          <h3>{{ negocioStore.nombre }}</h3>
          <p v-if="negocioStore.datos.direccion">{{ negocioStore.datos.direccion }}</p>
          <p v-if="negocioStore.datos.telefono">Tel: {{ negocioStore.datos.telefono }}</p>
        </div>
        <div class="ticket-info">
          <p><strong>Fecha:</strong> {{ formatFecha(ticketData.fecha) }}</p>
          <p><strong>Cliente:</strong> {{ ticketData.cliente }}</p>
          <p v-if="ticketData.nota"><strong>Nota:</strong> {{ ticketData.nota }}</p>
        </div>
        <div class="ticket-items">
          <div v-for="item in ticketData.articulos" :key="item.id" class="ticket-item">
            <div class="ticket-item__left">
              <span class="ticket-item__name">{{ item.nombre }}</span>
              <span class="ticket-item__qty">x{{ item.cantidad }}</span>
            </div>
            <span class="ticket-item__price">${{ formatPrecio(item.precio * item.cantidad) }}</span>
          </div>
        </div>
        <div class="ticket-summary">
          <div class="ticket-row">
            <span>Subtotal:</span>
            <span>${{ formatPrecio(ticketData.subtotal) }}</span>
          </div>
          <div v-if="ticketData.descuento > 0" class="ticket-row ticket-row--desc">
            <span>Descuento:</span>
            <span>-${{ formatPrecio(ticketData.descuento) }}</span>
          </div>
          <div class="ticket-row ticket-row--total">
            <span>TOTAL:</span>
            <span>${{ formatPrecio(ticketData.total) }}</span>
          </div>
        </div>
        <div class="ticket-footer">
          <p><strong>Pago:</strong> {{ formatMediosPago(ticketData.medioPago) }}</p>
          <p class="ticket-gracias">¡Gracias por su compra!</p>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="cerrarTicket">
          Cerrar
        </BaseButton>
        <BaseButton variant="primary" @click="imprimirTicket">
          <i class="ti ti-printer"></i>
          Imprimir
        </BaseButton>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/layout/AppLayout.vue'
import BaseButton from '../components/common/BaseButton.vue'
import BaseModal from '../components/common/BaseModal.vue'
import BaseInput from '../components/common/BaseInput.vue'
import { useArticulosStore } from '../stores/articulos'
import { useVentasStore } from '../stores/ventas'
import { useClientesStore } from '../stores/clientes'
import { useCajaStore } from '../stores/caja'
import { useMediosPagoStore } from '../stores/mediosPago'
import { useNegocioStore } from '../stores/negocio'
import { useToast } from '../composables/useToast'

const router = useRouter()
const articulosStore = useArticulosStore()
const ventasStore = useVentasStore()
const clientesStore = useClientesStore()
const cajaStore = useCajaStore()
const mediosPagoStore = useMediosPagoStore()
const negocioStore = useNegocioStore()
const toast = useToast()

const busqueda = ref('')
const categoriaSeleccionada = ref('')
const codigoBarras = ref('')
const barcodeInput = ref(null)

const showNota = ref(false)
const showDescuento = ref(false)
const showMediosPago = ref(false)

const clienteModalOpen = ref(false)
const nuevoClienteModalOpen = ref(false)
const ticketModalOpen = ref(false)
const busquedaCliente = ref('')
const creandoCliente = ref(false)

const nuevoCliente = ref({
  nombre: '',
  telefono: '',
  email: '',
  direccion: ''
})

const ticketData = ref({
  fecha: '',
  cliente: '',
  articulos: [],
  subtotal: 0,
  descuento: 0,
  total: 0,
  medioPago: [],
  nota: ''
})

const articulos = computed(() => articulosStore.articulosFiltrados)
const categorias = computed(() => articulosStore.categoriasUnicas)

const carrito = computed(() => ventasStore.carrito)
const itemsCount = computed(() => ventasStore.itemsCount)
const subtotal = computed(() => ventasStore.subtotal)
const descuento = computed({
  get: () => ventasStore.descuento,
  set: (val) => ventasStore.setDescuento(val.tipo, val.valor)
})
const montoDescuento = computed(() => ventasStore.montoDescuento)
const total = computed(() => ventasStore.total)
const nota = computed({
  get: () => ventasStore.nota,
  set: (val) => { ventasStore.nota = val }
})

const clienteActual = computed(() => ventasStore.clienteActual)
const clientes = computed(() => clientesStore.clientes)
const clienteNombre = computed(() => clienteActual.value?.nombre || 'Consumidor Final')

const clientesFiltrados = computed(() => {
  if (!busquedaCliente.value) return clientes.value.slice(0, 10)
  const search = busquedaCliente.value.toLowerCase()
  return clientes.value.filter(c =>
    c.nombre?.toLowerCase().includes(search) ||
    c.telefono?.includes(search) ||
    c.email?.toLowerCase().includes(search)
  ).slice(0, 10)
})

const mediosPagoDisponibles = computed(() => mediosPagoStore.mediosPago)

const mediosPagoSeleccionados = computed({
  get: () => ventasStore.medioPagoSeleccionados,
  set: (val) => { ventasStore.medioPagoSeleccionados = val }
})

const faltaPagar = computed(() => ventasStore.faltaPagar)
const cambio = computed(() => ventasStore.cambio)
const pagoCompleto = computed(() => faltaPagar.value <= 0)

const statusPago = computed(() => {
  if (!mediosPagoSeleccionados.value.length) {
    return { clase: '', icono: '', texto: 'Sin métodos de pago' }
  }
  if (pagoCompleto.value) {
    return { clase: 'pago-status--complete', icono: 'ti ti-check', texto: `Cambio: $${formatPrecio(cambio.value)}` }
  }
  return { clase: 'pago-status--incomplete', icono: 'ti ti-alert', texto: `Falta: $${formatPrecio(faltaPagar.value)}` }
})

const articulosFiltrados = computed(() => {
  let result = articulos.value

  if (categoriaSeleccionada.value) {
    result = result.filter(a => a.categoria === categoriaSeleccionada.value)
  }

  return result
})

watch(() => descuento.value, (val) => {
  ventasStore.setDescuento(val.tipo, val.valor)
}, { deep: true })

onMounted(async () => {
  await Promise.all([
    cajaStore.cargarCaja(),
    articulosStore.cargarArticulos(),
    clientesStore.cargarClientes(),
    mediosPagoStore.cargarMediosPago(),
    negocioStore.cargarDatos()
  ])

  if (!cajaStore.estaAbierta) {
    toast.warning('Caja cerrada. Abre la caja para vender.')
  }

  const cf = clientesStore.consumidorFinal
  if (cf) {
    ventasStore.setCliente(cf)
  }

  if (mediosPagoStore.mediosPago.length > 0) {
    await ventasStore.agregarMedioPago(mediosPagoStore.mediosPago[0])
    sincronizarPago()
  }

  articulosStore.setFiltro({ categoria: '', buscar: '' })
})

const sincronizarPago = () => {
  if (mediosPagoSeleccionados.value.length === 1) {
    mediosPagoSeleccionados.value[0].monto = total.value
  }
}

watch(total, sincronizarPago)

const handleBuscar = () => {
  articulosStore.setFiltro({ buscar: busqueda.value })
}

const formatPrecio = (val) => {
  return new Intl.NumberFormat('es-AR').format(val || 0)
}

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-AR')
}

const formatMediosPago = (medios) => {
  if (!medios?.length) return '-'
  return medios.map(m => `${m.medioNombre}: $${formatPrecio(m.monto)}`).join(' + ')
}

const agregarCarrito = (articulo) => {
  if (articulo.stock <= 0) {
    toast.error('Producto sin stock')
    return
  }
  ventasStore.agregarCarrito(articulo)
}

const actualizarCantidad = (id, cantidad) => {
  ventasStore.actualizarCantidad(id, cantidad)
}

const eliminarDelCarrito = (id) => {
  ventasStore.eliminarDelCarrito(id)
}

const vaciarCarrito = () => {
  ventasStore.vaciarCarrito()
  showNota.value = false
  showDescuento.value = false
  showMediosPago.value = false
  toast.info('Carrito vaciado')
}

const buscarPorCodigo = () => {
  if (!codigoBarras.value) return

  const encontrado = ventasStore.agregarPorCodigo(codigoBarras.value, articulos.value)
  if (encontrado) {
    codigoBarras.value = ''
    toast.success('Producto agregado')
  } else {
    toast.error('Producto no encontrado')
  }
}

const abrirSelectorCliente = () => {
  busquedaCliente.value = ''
  clienteModalOpen.value = true
}

const setCliente = (cliente) => {
  ventasStore.setCliente(cliente)
  clienteModalOpen.value = false
  if (cliente) {
    toast.success(`Cliente: ${cliente.nombre}`)
  }
}

const abrirNuevoCliente = () => {
  clienteModalOpen.value = false
  nuevoCliente.value = { nombre: '', telefono: '', email: '', direccion: '' }
  nuevoClienteModalOpen.value = true
}

const crearCliente = async () => {
  if (!nuevoCliente.value.nombre?.trim()) {
    toast.error('El nombre es requerido')
    return
  }

  creandoCliente.value = true
  try {
    await clientesStore.agregarCliente(nuevoCliente.value)
    toast.success('Cliente creado')
    nuevoClienteModalOpen.value = false
  } catch (e) {
    toast.error('Error al crear cliente')
  } finally {
    creandoCliente.value = false
  }
}

const agregarMedioPago = () => {
  const disponibles = mediosPagoStore.mediosPago.filter(
    m => !mediosPagoSeleccionados.value.some(mp => mp.medioNombre === m.nombre)
  )
  if (disponibles.length > 0) {
    mediosPagoSeleccionados.value.push({ medioNombre: disponibles[0].nombre, monto: 0 })
  }
}

const eliminarMedioPago = (index) => {
  mediosPagoSeleccionados.value.splice(index, 1)
}

const procesarVenta = async () => {
  if (!cajaStore.estaAbierta) {
    toast.error('Abre la caja primero')
    router.push('/caja')
    return
  }

  if (!pagoCompleto.value) {
    toast.error('Falta completar el pago')
    return
  }

  if (!carrito.value.length) {
    toast.error('El carrito está vacío')
    return
  }

  sincronizarPago()

  try {
    const clienteId = clienteActual.value?.id || 'consumidor-final'
    const clienteNombre = clienteActual.value?.nombre || 'Consumidor Final'

    await ventasStore.guardarVenta(clienteId, clienteNombre)

    for (const item of carrito.value) {
      await articulosStore.actualizarStock(item.id, -item.cantidad)
    }

    await cajaStore.agregarVenta(total.value)

    ticketData.value = {
      fecha: new Date().toISOString(),
      cliente: clienteNombre,
      articulos: [...carrito.value],
      subtotal: subtotal.value,
      descuento: montoDescuento.value,
      total: total.value,
      medioPago: [...mediosPagoSeleccionados.value],
      nota: nota.value
    }

    ticketModalOpen.value = true
    ventasStore.vaciarCarrito()

  } catch (e) {
    toast.error('Error al procesar venta')
    console.error(e)
  }
}

const cerrarTicket = () => {
  ticketModalOpen.value = false
  showNota.value = false
  showDescuento.value = false
  showMediosPago.value = false
}

const imprimirTicket = () => {
  window.print()
}
</script>

<style scoped>
.pos-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--space-5);
  min-height: calc(100vh - 120px);
}

.pos-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.pos-search {
  position: relative;
}

.pos-search i {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.pos-search__input {
  width: 100%;
  padding: var(--space-3) var(--space-4) var(--space-3) 40px;
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  font-size: var(--font-size-base);
  outline: none;
}

.pos-search__input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.category-pills {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding: var(--space-1);
}

.category-pills::-webkit-scrollbar {
  display: none;
}

.category-pill {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: var(--border-subtle);
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.category-pill:hover {
  background: var(--bg-primary);
}

.category-pill--active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-3);
}

.product-grid__empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
  color: var(--text-muted);
}

.product-grid__empty i {
  font-size: 48px;
  margin-bottom: var(--space-3);
}

.product-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  box-shadow: var(--shadow-soft);
  border: var(--border-subtle);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.product-card--low-stock {
  border-color: var(--warning);
}

.product-card__image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-2);
  position: relative;
}

.product-card__image i {
  font-size: 32px;
  color: var(--text-muted);
}

.stock-badge {
  position: absolute;
  top: var(--space-1);
  right: var(--space-1);
  background: var(--warning);
  color: white;
  font-size: 8px;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
}

.product-card__name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-card__price {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--accent);
  margin-top: var(--space-1);
}

.order-panel {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-medium);
  border: var(--border-subtle);
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-height: calc(100vh - 120px);
  position: sticky;
  top: 80px;
}

.order-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: var(--border-subtle);
}

.order-panel__title {
  font-size: var(--font-size-md);
  font-weight: 700;
}

.order-panel__count {
  font-size: var(--font-size-xs);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.order-panel__customer {
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--border-subtle);
}

.order-panel__customer-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  font-size: var(--font-size-sm);
}

.order-panel__customer-btn i:last-child {
  margin-left: auto;
  font-size: var(--font-size-xs);
}

.order-panel__barcode {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--border-subtle);
}

.order-panel__barcode-input {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border: var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  font-size: var(--font-size-sm);
}

.order-panel__barcode-btn {
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: white;
}

.order-panel__items {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3) var(--space-4);
  min-height: 150px;
  max-height: 200px;
}

.order-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  padding: var(--space-6);
}

.order-panel__empty i {
  font-size: 32px;
  margin-bottom: var(--space-2);
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2);
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
}

.order-item__info {
  flex: 1;
  min-width: 0;
}

.order-item__name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-item__price {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.order-item__controls {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.order-item__btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-card);
  font-size: var(--font-size-xs);
}

.order-item__btn:hover {
  background: var(--accent);
  color: white;
}

.order-item__qty {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
}

.order-item__delete {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.order-item__delete:hover {
  color: var(--error);
}

.order-panel__summary {
  padding: var(--space-3) var(--space-4);
  background: var(--bg-primary);
  border-top: var(--border-subtle);
}

.order-summary__row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  padding: var(--space-1) 0;
}

.order-summary__row--desc {
  color: var(--error);
}

.order-summary__row--total {
  font-size: var(--font-size-md);
  font-weight: 700;
  padding-top: var(--space-2);
  margin-top: var(--space-2);
  border-top: var(--border-subtle);
}

.order-panel__extras {
  border-top: var(--border-subtle);
}

.extras-toggles {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
}

.extras-toggle {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.extras-toggle:hover {
  background: var(--accent-light);
  color: var(--accent);
}

.extras-toggle--active {
  background: var(--accent);
  color: white;
}

.extras-toggle--active:hover {
  background: var(--accent-dark);
  color: white;
}

.extras-content {
  padding: 0 var(--space-4) var(--space-4);
}

.extras-group {
  margin-bottom: var(--space-3);
}

.extras-group label {
  display: block;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.extras-row {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.extras-select {
  width: 60px;
  padding: var(--space-2);
  border: var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  font-size: var(--font-size-sm);
}

.extras-select--medium {
  flex: 1;
  width: auto;
}

.extras-input {
  width: 80px;
  padding: var(--space-2);
  border: var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  font-size: var(--font-size-sm);
}

.extras-remove {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text-muted);
}

.extras-remove:hover {
  background: var(--error);
  color: white;
}

.extras-textarea {
  width: 100%;
  padding: var(--space-2);
  border: var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  font-size: var(--font-size-sm);
  resize: none;
}

.extras-add {
  width: 100%;
  padding: var(--space-2);
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.extras-add:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.pago-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.pago-status--incomplete {
  background: rgba(255, 59, 48, 0.1);
  color: var(--error);
}

.pago-status--complete {
  background: rgba(52, 199, 89, 0.1);
  color: var(--success);
}

.order-panel__actions {
  padding: var(--space-4);
  border-top: var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.cliente-buscador {
  margin-bottom: var(--space-4);
}

.cliente-search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
}

.cliente-search i {
  color: var(--text-muted);
}

.cliente-search input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--font-size-base);
  outline: none;
}

.cliente-search__clear {
  padding: var(--space-1);
  color: var(--text-muted);
}

.cliente-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 300px;
  overflow-y: auto;
}

.cliente-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  text-align: left;
  transition: all var(--transition-fast);
}

.cliente-item:hover {
  background: var(--bg-primary);
}

.cliente-item--selected {
  background: var(--accent-light);
}

.cliente-item__info h4 {
  font-size: var(--font-size-base);
  font-weight: 500;
}

.cliente-item__info p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.cliente-empty {
  text-align: center;
  padding: var(--space-6);
  color: var(--text-muted);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.ticket-content {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: var(--space-2);
}

.ticket-header {
  text-align: center;
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px dashed var(--border-subtle);
}

.ticket-header h3 {
  font-size: 14px;
  margin-bottom: var(--space-1);
}

.ticket-header p {
  margin: 2px 0;
}

.ticket-info {
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px dashed var(--border-subtle);
}

.ticket-info p {
  margin: 4px 0;
}

.ticket-items {
  margin-bottom: var(--space-3);
}

.ticket-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.ticket-item__left {
  display: flex;
  gap: var(--space-2);
}

.ticket-item__qty {
  color: var(--text-muted);
}

.ticket-summary {
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px dashed var(--border-subtle);
}

.ticket-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
}

.ticket-row--desc {
  color: var(--error);
}

.ticket-row--total {
  font-weight: bold;
  font-size: 14px;
  margin-top: var(--space-2);
}

.ticket-footer {
  text-align: center;
}

.ticket-footer p {
  margin: 4px 0;
}

.ticket-gracias {
  margin-top: var(--space-3);
  font-style: italic;
}

@media (max-width: 1024px) {
  .pos-layout {
    grid-template-columns: 1fr;
  }

  .order-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 50vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
}
</style>