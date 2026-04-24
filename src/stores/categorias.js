import { defineStore } from 'pinia'
import { database } from '../services/database'

export const useCategoriasStore = defineStore('categorias', {
  state: () => ({
    categorias: [],
    loading: false
  }),

  getters: {
    categoriasOrdenadas: (state) => {
      return [...state.categorias].sort((a, b) => 
        a.nombre?.localeCompare(b.nombre)
      )
    }
  },

  actions: {
    async cargarCategorias() {
      this.loading = true
      try {
        this.categorias = await database.getAll('categorias')
      } finally {
        this.loading = false
      }
    },

    async agregarCategoria(data) {
      const categoria = {
        nombre: data.nombre?.trim() || '',
        descripcion: data.descripcion?.trim() || ''
      }
      const id = await database.add('categorias', categoria)
      this.categorias.push({ ...categoria, id })
      return id
    },

    async actualizarCategoria(categoria) {
      const data = {
        id: categoria.id,
        nombre: categoria.nombre?.trim() || '',
        descripcion: categoria.descripcion?.trim() || ''
      }
      await database.put('categorias', data)
      const index = this.categorias.findIndex(c => c.id === categoria.id)
      if (index > -1) {
        this.categorias[index] = data
      }
    },

    async eliminarCategoria(id) {
      await database.delete('categorias', id)
      this.categorias = this.categorias.filter(c => c.id !== id)
    }
  }
})