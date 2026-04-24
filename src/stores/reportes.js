import { defineStore } from 'pinia'
import { database } from '../services/database'

export const useReportesStore = defineStore('reportes', {
  state: () => ({
    ventas: [],
    filtros: {
      fechaInicio: '',
      fechaFin: '',
      cliente: '',
      medioPago: '',
      montoMin: null,
      montoMax: null
    },
    loading: false
  }),

  getters: {
    ventasFiltradas: (state) => {
      let result = state.ventas
      
      if (state.filtros.fechaInicio) {
        const fechaInicio = new Date(state.filtros.fechaInicio)
        result = result.filter(v => new Date(v.fecha) >= fechaInicio)
      }
      
      if (state.filtros.fechaFin) {
        const fechaFin = new Date(state.filtros.fechaFin + 'T23:59:59')
        result = result.filter(v => new Date(v.fecha) <= fechaFin)
      }
      
      if (state.filtros.cliente) {
        const cliente = state.filtros.cliente.toLowerCase()
        result = result.filter(v => 
          v.cliente?.toLowerCase().includes(cliente)
        )
      }
      
      if (state.filtros.medioPago) {
        result = result.filter(v => 
          v.medioPago?.some(m => m.medioNombre === state.filtros.medioPago)
        )
      }
      
      if (state.filtros.montoMin != null) {
        result = result.filter(v => v.total >= state.filtros.montoMin)
      }
      
      if (state.filtros.montoMax != null) {
        result = result.filter(v => v.total <= state.filtros.montoMax)
      }
      
      return result.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    },

    totalVentas: (state) => {
      return state.ventas.reduce((sum, v) => sum + (v.total || 0), 0)
    },

    cantidadVentas: (state) => {
      return state.ventas.length
    },

    ticketPromedio: (state) => {
      if (!state.ventas.length) return 0
      return state.totalVentas / state.ventas.length
    },

    ventasPorDia: (state) => {
      const agrupado = {}
      state.ventas.forEach(v => {
        const fecha = new Date(v.fecha).toLocaleDateString('es-AR')
        if (!agrupado[fecha]) {
          agrupado[fecha] = { fecha, cantidad: 0, total: 0 }
        }
        agrupado[fecha].cantidad++
        agrupado[fecha].total += v.total || 0
      })
      return Object.values(agrupado).slice(-7)
    },

    ventasPorMedio: (state) => {
      const agrupado = {}
      state.ventas.forEach(v => {
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
    },

    topProductos: (state) => {
      const productos = {}
      state.ventas.forEach(v => {
        if (v.articulos) {
          v.articulos.forEach(a => {
            if (!productos[a.nombre]) {
              productos[a.nombre] = { nombre: a.nombre, cantidad: 0, total: 0 }
            }
            productos[a.nombre].cantidad += a.cantidad || 0
            productos[a.nombre].total += (a.precio * a.cantidad) || 0
          })
        }
      })
      return Object.values(productos)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10)
    },

    topClientes: (state) => {
      const clientes = {}
      state.ventas.forEach(v => {
        if (v.cliente && v.cliente !== 'Consumidor Final') {
          if (!clientes[v.cliente]) {
            clientes[v.cliente] = { nombre: v.cliente, ventas: 0, total: 0 }
          }
          clientes[v.cliente].ventas++
          clientes[v.cliente].total += v.total || 0
        }
      })
      return Object.values(clientes)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
    }
  },

  actions: {
    async cargarVentas() {
      this.loading = true
      try {
        this.ventas = await database.getAll('ventas')
      } finally {
        this.loading = false
      }
    },

    setFiltros(filtros) {
      this.filtros = { ...this.filtros, ...filtros }
    },

    limpiarFiltros() {
      this.filtros = {
        fechaInicio: '',
        fechaFin: '',
        cliente: '',
        medioPago: '',
        montoMin: null,
        montoMax: null
      }
    },

    async exportarCSV() {
      const headers = ['Fecha', 'Cliente', 'Total', 'Medio de Pago', 'Items']
      const rows = this.ventasFiltradas.map(v => [
        new Date(v.fecha).toLocaleString('es-AR'),
        v.cliente || 'Consumidor Final',
        v.total || 0,
        v.medioPago?.map(m => `${m.medioNombre}: $${m.monto}`).join(' + ') || '-',
        v.articulos?.reduce((s, a) => s + a.cantidad, 0) || 0
      ])
      
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ventas_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
    }
  }
})