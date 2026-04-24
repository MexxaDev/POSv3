import { defineStore } from 'pinia'
import { database } from '../services/database'

export const useMediosPagoStore = defineStore('mediosPago', {
  state: () => ({
    mediosPago: [],
    loading: false
  }),

  getters: {
    mediosOrdenados: (state) => {
      return [...state.mediosPago].sort((a, b) => 
        a.nombre?.localeCompare(b.nombre)
      )
    }
  },

  actions: {
    async cargarMediosPago() {
      this.loading = true
      try {
        this.mediosPago = await database.getAll('mediosPago')
        if (this.mediosPago.length === 0) {
          await this.inicializarMediosPago()
        }
      } finally {
        this.loading = false
      }
    },

    async inicializarMediosPago() {
      const defaults = [
        { nombre: 'Efectivo' },
        { nombre: 'Transferencia' },
        { nombre: 'Débito' },
        { nombre: 'Crédito' }
      ]
      for (const medio of defaults) {
        await database.add('mediosPago', medio)
        this.mediosPago.push(medio)
      }
    },

    async agregarMedioPago(data) {
      const medio = {
        nombre: data.nombre?.trim() || ''
      }
      const id = await database.add('mediosPago', medio)
      this.mediosPago.push({ ...medio, id })
      return id
    },

    async actualizarMedioPago(medio) {
      const data = {
        id: medio.id,
        nombre: medio.nombre?.trim() || ''
      }
      await database.put('mediosPago', data)
      const index = this.mediosPago.findIndex(m => m.id === medio.id)
      if (index > -1) {
        this.mediosPago[index] = data
      }
    },

    async eliminarMedioPago(id) {
      await database.delete('mediosPago', id)
      this.mediosPago = this.mediosPago.filter(m => m.id !== id)
    }
  }
})