import { defineStore } from 'pinia'
import { database } from '../services/database'

export const useClientesStore = defineStore('clientes', {
  state: () => ({
    clientes: [],
    loading: false,
    filtro: {
      buscar: ''
    }
  }),

  getters: {
    clientesFiltrados: (state) => {
      if (!state.clientes) return []
      if (!state.filtro.buscar) return state.clientes
      
      const search = state.filtro.buscar.toLowerCase()
      return state.clientes.filter(c =>
        c.nombre?.toLowerCase().includes(search) ||
        c.telefono?.includes(search) ||
        c.email?.toLowerCase().includes(search)
      )
    },

    getClienteById: (state) => (id) => {
      return state.clientes.find(c => c.id === id)
    },

    consumidorFinal: (state) => {
      return state.clientes.find(c => c.nombre === 'Consumidor Final')
    },

    totalClientes: (state) => {
      return state.clientes.filter(c => c.nombre !== 'Consumidor Final').length
    }
  },

  actions: {
    async cargarClientes() {
      this.loading = true
      try {
        this.clientes = await database.getAll('clientes')
        
        if (!this.clientes.find(c => c.nombre === 'Consumidor Final')) {
          const cf = {
            nombre: 'Consumidor Final',
            telefono: '',
            email: '',
            direccion: '',
            documento: '',
            notas: ''
          }
          const id = await database.add('clientes', cf)
          this.clientes.push({ ...cf, id })
        }
      } finally {
        this.loading = false
      }
    },

    async agregarCliente(cliente) {
      const data = {
        nombre: cliente.nombre?.trim() || '',
        telefono: cliente.telefono?.trim() || '',
        email: cliente.email?.trim() || '',
        direccion: cliente.direccion?.trim() || '',
        documento: cliente.documento?.trim() || '',
        notas: cliente.notas?.trim() || ''
      }
      const id = await database.add('clientes', data)
      this.clientes.push({ ...data, id })
      return id
    },

    async actualizarCliente(cliente) {
      const data = {
        id: cliente.id,
        nombre: cliente.nombre?.trim() || '',
        telefono: cliente.telefono?.trim() || '',
        email: cliente.email?.trim() || '',
        direccion: cliente.direccion?.trim() || '',
        documento: cliente.documento?.trim() || '',
        notas: cliente.notas?.trim() || ''
      }
      await database.put('clientes', data)
      const index = this.clientes.findIndex(c => c.id === cliente.id)
      if (index > -1) {
        this.clientes[index] = data
      }
    },

    async eliminarCliente(id) {
      await database.delete('clientes', id)
      this.clientes = this.clientes.filter(c => c.id !== id)
    },

    setFiltro(filtro) {
      this.filtro = { ...this.filtro, ...filtro }
    }
  }
})