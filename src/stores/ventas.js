import { defineStore } from 'pinia'
import { database } from '../services/database'

export const useVentasStore = defineStore('ventas', {
  state: () => ({
    carrito: [],
    clienteActual: null,
    mediosPago: [],
    medioPagoSeleccionados: [],
    descuento: {
      tipo: 'porcentaje',
      valor: 0
    },
    nota: '',
    loading: false,
    historial: []
  }),

  getters: {
    itemsCount: (state) => {
      return state.carrito.reduce((sum, item) => sum + item.cantidad, 0)
    },

    subtotal: (state) => {
      return state.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    },

    montoDescuento: (state) => {
      const sub = state.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
      if (state.descuento.tipo === 'porcentaje') {
        return Math.round(sub * (state.descuento.valor / 100))
      }
      return state.descuento.valor
    },

    total: (state) => {
      const sub = state.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
      let descuento = 0
      if (state.descuento.tipo === 'porcentaje') {
        descuento = Math.round(sub * (state.descuento.valor / 100))
      } else {
        descuento = state.descuento.valor
      }
      return Math.max(0, sub - descuento)
    },

    totalPagado: (state) => {
      return state.medioPagoSeleccionados.reduce((sum, mp) => sum + (Number(mp.monto) || 0), 0)
    },

    faltaPagar: (state) => {
      const sub = state.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
      let descuento = 0
      if (state.descuento.tipo === 'porcentaje') {
        descuento = Math.round(sub * (state.descuento.valor / 100))
      } else {
        descuento = state.descuento.valor
      }
      const total = Math.max(0, sub - descuento)
      const pagado = state.medioPagoSeleccionados.reduce((sum, mp) => sum + (Number(mp.monto) || 0), 0)
      return Math.max(0, total - pagado)
    },

    cambio: (state) => {
      const sub = state.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
      let descuento = 0
      if (state.descuento.tipo === 'porcentaje') {
        descuento = Math.round(sub * (state.descuento.valor / 100))
      } else {
        descuento = state.descuento.valor
      }
      const total = Math.max(0, sub - descuento)
      const pagado = state.medioPagoSeleccionados.reduce((sum, mp) => sum + (Number(mp.monto) || 0), 0)
      return Math.max(0, pagado - total)
    },

    pagoCompleto: (state) => {
      const sub = state.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
      let descuento = 0
      if (state.descuento.tipo === 'porcentaje') {
        descuento = Math.round(sub * (state.descuento.valor / 100))
      } else {
        descuento = state.descuento.valor
      }
      const total = Math.max(0, sub - descuento)
      const pagado = state.medioPagoSeleccionados.reduce((sum, mp) => sum + (Number(mp.monto) || 0), 0)
      return pagado >= total
    }
  },

  actions: {
    agregarCarrito(articulo) {
      const existing = this.carrito.find(item => item.id === articulo.id)
      if (existing) {
        if (existing.cantidad < articulo.stock) {
          existing.cantidad++
        }
      } else {
        this.carrito.push({
          id: articulo.id,
          nombre: articulo.nombre,
          precio: articulo.precio,
          cantidad: 1,
          stock: articulo.stock
        })
      }
    },

    agregarPorCodigo(codigo, articulos) {
      const articulo = articulos.find(a =>
        a.codigo === codigo || a.codigo_barras === codigo
      )
      if (articulo) {
        if (articulo.stock <= 0) {
          return false
        }
        this.agregarCarrito(articulo)
        return true
      }
      return false
    },

    actualizarCantidad(id, cantidad) {
      const item = this.carrito.find(i => i.id === id)
      if (item) {
        if (cantidad <= 0) {
          this.eliminarDelCarrito(id)
        } else if (cantidad > item.stock) {
          item.cantidad = item.stock
        } else {
          item.cantidad = cantidad
        }
      }
    },

    eliminarDelCarrito(id) {
      this.carrito = this.carrito.filter(i => i.id !== id)
    },

    vaciarCarrito() {
      this.carrito = []
      this.descuento = { tipo: 'porcentaje', valor: 0 }
      this.nota = ''
      this.medioPagoSeleccionados = []
    },

    setCliente(cliente) {
      this.clienteActual = cliente
    },

    setDescuento(tipo, valor) {
      this.descuento = { 
        tipo: tipo || this.descuento.tipo,
        valor: Number(valor) || 0
      }
    },

    async agregarMedioPago(medio) {
      if (!this.medioPagoSeleccionados.some(mp => mp.medioNombre === (medio?.nombre || medio))) {
        this.medioPagoSeleccionados.push({
          medioId: medio?.id || null,
          medioNombre: medio?.nombre || medio,
          monto: 0
        })
      }
    },

    actualizarMedioPago(index, monto) {
      if (this.medioPagoSeleccionados[index]) {
        this.medioPagoSeleccionados[index].monto = Number(monto) || 0
      }
    },

    eliminarMedioPago(index) {
      this.medioPagoSeleccionados.splice(index, 1)
    },

    async cargarHistorial(filtros = {}) {
      this.loading = true
      try {
        let ventas = await database.getAll('ventas')
        
        if (filtros.fechaInicio) {
          ventas = ventas.filter(v => new Date(v.fecha) >= new Date(filtros.fechaInicio))
        }
        if (filtros.fechaFin) {
          ventas = ventas.filter(v => new Date(v.fecha) <= new Date(filtros.fechaFin))
        }
        if (filtros.clienteId) {
          ventas = ventas.filter(v => v.clienteId === filtros.clienteId)
        }

        this.historial = ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      } finally {
        this.loading = false
      }
    },

    async guardarVenta(clienteId, clienteNombre) {
      const venta = {
        id: crypto.randomUUID(),
        fecha: new Date().toISOString(),
        clienteId,
        cliente: clienteNombre,
        articulos: this.carrito.map(item => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad
        })),
        subtotal: this.subtotal,
        descuento: { tipo: this.descuento.tipo, valor: this.descuento.valor },
        montoDescuento: this.montoDescuento,
        total: this.total,
        medioPago: this.medioPagoSeleccionados.map(mp => ({
          medioId: mp.medioId,
          medioNombre: mp.medioNombre,
          monto: Number(mp.monto) || 0
        })),
        nota: this.nota
      }

      await database.add('ventas', venta)
      this.historial.unshift(venta)

      try {
        const { useCajaStore } = await import('./caja')
        const cajaStore = useCajaStore()
        
        if (cajaStore.estaAbierta) {
          for (const mp of this.medioPagoSeleccionados) {
            if (mp.monto > 0) {
              await cajaStore.agregarMovimiento('entrada', mp.monto, `Venta`)
            }
          }
        }
      } catch (e) {
        console.warn('Error registrando en caja:', e)
      }

      return venta
    },

    async cargarMediosPago() {
      let medios = await database.getAll('mediosPago')
      if (!medios.length) {
        const defaults = [
          { nombre: 'Efectivo' },
          { nombre: 'Transferencia' },
          { nombre: 'Débito' },
          { nombre: 'Crédito' }
        ]
        for (const medio of defaults) {
          await database.add('mediosPago', medio)
        }
        medios = await database.getAll('mediosPago')
      }
      this.mediosPago = medios
    }
  }
})