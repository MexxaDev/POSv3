import { defineStore } from 'pinia'
import { database } from '../services/database'

export const useCajaStore = defineStore('caja', {
  state: () => ({
    cajaActual: null,
    movimientos: [],
    loading: false
  }),

  getters: {
    estaAbierta: (state) => !!state.cajaActual?.abierta,
    saldoActual: (state) => state.cajaActual?.montoInicial || 0,
    totalMovimientos: (state) => {
      if (!state.movimientos) return 0
      return state.movimientos.reduce((sum, m) => {
        return m.tipo === 'entrada' ? sum + m.monto : sum - m.monto
      }, 0)
    },
    saldoFinal: (state) => {
      const inicial = state.cajaActual?.montoInicial || 0
      const movimientos = state.movimientos?.reduce((sum, m) => {
        return m.tipo === 'entrada' ? sum + m.monto : sum - m.monto
      }, 0) || 0
      return inicial + movimientos
    },
    totalEntradas: (state) => {
      if (!state.movimientos) return 0
      return state.movimientos
        .filter(m => m.tipo === 'entrada')
        .reduce((sum, m) => sum + m.monto, 0)
    },
    totalSalidas: (state) => {
      if (!state.movimientos) return 0
      return state.movimientos
        .filter(m => m.tipo === 'salida')
        .reduce((sum, m) => sum + m.monto, 0)
    },
    cierreEsperado: (state) => {
      const inicial = state.cajaActual?.montoInicial || 0
      const entradas = state.movimientos?.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.monto, 0) || 0
      const salidas = state.movimientos?.filter(m => m.tipo === 'salida').reduce((sum, m) => sum + m.monto, 0) || 0
      return inicial + entradas - salidas
    },
    movimientosOrdenados: (state) => {
      if (!state.movimientos) return []
      return [...state.movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    }
  },

  actions: {
    async cargarCaja() {
      this.loading = true
      try {
        const cajas = await database.getAll('caja')
        const abierta = cajas.find(c => c.abierta === true)
        this.cajaActual = abierta || null
        
        if (this.cajaActual) {
          this.movimientos = cajas.filter(m => m.cajaId === this.cajaActual.id)
        }
      } catch (e) {
        console.error('Error cargando caja:', e)
        this.cajaActual = null
        this.movimientos = []
      } finally {
        this.loading = false
      }
    },

    async abrirCaja(montoInicial) {
      const caja = {
        id: crypto.randomUUID(),
        abierta: true,
        montoInicial: Number(montoInicial),
        apertura: new Date().toISOString(),
        cierre: null,
        usuario: 'Usuario'
      }

      await database.add('caja', caja)
      this.cajaActual = caja
      this.movimientos = []

      return caja
    },

    async cerrarCaja(montoCierre) {
      if (!this.cajaActual) return

      const cierre = {
        ...this.cajaActual,
        abierta: false,
        montoCierre: Number(montoCierre),
        cierre: new Date().toISOString(),
        diferencia: Number(montoCierre) - this.saldoFinal
      }

      await database.put('caja', cierre)
      this.cajaActual = null
      this.movimientos = []
    },

    async agregarMovimiento(tipo, monto, nota = '') {
      if (!this.cajaActual) return

      const movimiento = {
        id: crypto.randomUUID(),
        cajaId: this.cajaActual.id,
        tipo,
        monto: Number(monto),
        nota,
        fecha: new Date().toISOString()
      }

      await database.add('caja', movimiento)
      this.movimientos.push(movimiento)

      return movimiento
    },

    async agregarVenta(monto) {
      return this.agregarMovimiento('entrada', monto, 'Venta')
    },

    async agregarGasto(monto, nota) {
      return this.agregarMovimiento('salida', monto, nota)
    }
  }
})