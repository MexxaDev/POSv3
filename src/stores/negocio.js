import { defineStore } from 'pinia'
import { database } from '../services/database'

export const useNegocioStore = defineStore('negocio', {
  state: () => ({
    datos: {
      nombre: 'Mi Negocio',
      direccion: '',
      telefono: '',
      whatsapp: '',
      email: '',
      logo: ''
    },
    loading: false
  }),

  getters: {
    nombre: (state) => state.datos.nombre || 'Mi Negocio',
    whatsappLink: (state) => {
      if (!state.datos.whatsapp) return ''
      const numero = state.datos.whatsapp.replace(/\D/g, '')
      return `https://wa.me/${numero}`
    }
  },

  actions: {
    async cargarDatos() {
      this.loading = true
      try {
        const configs = await database.getAll('config')
        const negocioConfig = configs.find(c => c.clave === 'datosNegocio')
        if (negocioConfig?.valor) {
          this.datos = { ...this.datos, ...negocioConfig.valor }
        }
      } finally {
        this.loading = false
      }
    },

    async guardarDatos(datos) {
      const data = {
        clave: 'datosNegocio',
        valor: {
          nombre: datos.nombre?.trim() || 'Mi Negocio',
          direccion: datos.direccion?.trim() || '',
          telefono: datos.telefono?.trim() || '',
          whatsapp: datos.whatsapp?.trim() || '',
          email: datos.email?.trim() || '',
          logo: datos.logo || ''
        }
      }
      
      const configs = await database.getAll('config')
      const existing = configs.find(c => c.clave === 'datosNegocio')
      
      if (existing) {
        data.id = existing.id
        await database.put('config', data)
      } else {
        await database.add('config', data)
      }
      
      this.datos = data.valor
    }
  }
})