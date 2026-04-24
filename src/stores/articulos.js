import { defineStore } from 'pinia'
import { database } from '../services/database'

export const useArticulosStore = defineStore('articulos', {
  state: () => ({
    articulos: [],
    categorias: [],
    loading: false,
    _initialized: false,
    filtro: {
      categoria: '',
      buscar: ''
    }
  }),

  getters: {
    articulosFiltrados: (state) => {
      if (!state.articulos) return []

      let result = state.articulos

      if (state.filtro.categoria) {
        result = result.filter(a => a.categoria === state.filtro.categoria)
      }

      if (state.filtro.buscar) {
        const search = state.filtro.buscar.toLowerCase()
        result = result.filter(a =>
          a.nombre?.toLowerCase().includes(search) ||
          a.codigo?.toLowerCase().includes(search) ||
          a.codigo_barras?.includes(search)
        )
      }

      return result
    },

    categoriasUnicas: (state) => {
      if (!state.articulos) return []
      const cats = new Set(state.articulos.map(a => a.categoria))
      return [...cats].sort()
    },

    getArticuloById: (state) => (id) => {
      if (!state.articulos) return null
      return state.articulos.find(a => a.id === id)
    },

    getArticuloByCodigo: (state) => (codigo) => {
      if (!state.articulos) return null
      return state.articulos.find(a =>
        a.codigo === codigo || a.codigo_barras === codigo
      )
    }
  },

  actions: {
    async cargarArticulos() {
      this.loading = true
      try {
        this.articulos = await database.getAll('articulos')
        this.categorias = await database.getAll('categorias')
      } finally {
        this.loading = false
      }
    },

    async agregarArticulo(articulo) {
      const data = {
        nombre: articulo.nombre,
        codigo: articulo.codigo || '',
        codigo_barras: articulo.codigo_barras || '',
        categoria: articulo.categoria || '',
        precio: Number(articulo.precio) || 0,
        stock: Number(articulo.stock) || 0
      }
      const id = await database.add('articulos', data)
      this.articulos.push({ ...data, id })
      return id
    },

    async actualizarArticulo(articulo) {
      const data = {
        id: articulo.id,
        nombre: articulo.nombre,
        codigo: articulo.codigo || '',
        codigo_barras: articulo.codigo_barras || '',
        categoria: articulo.categoria || '',
        precio: Number(articulo.precio) || 0,
        stock: Number(articulo.stock) || 0
      }
      await database.put('articulos', data)
      const index = this.articulos.findIndex(a => a.id === articulo.id)
      if (index > -1) {
        this.articulos[index] = data
      }
    },

    async eliminarArticulo(id) {
      await database.delete('articulos', id)
      this.articulos = this.articulos.filter(a => a.id !== id)
    },

    async actualizarStock(id, cantidad) {
      const articulo = this.articulos.find(a => a.id === id)
      if (articulo) {
        articulo.stock = (articulo.stock || 0) + cantidad
        await this.actualizarArticulo(articulo)
      }
    },

    setFiltro(filtro) {
      this.filtro = { ...this.filtro, ...filtro }
    },

    async agregarCategoria(categoria) {
      const id = await database.add('categorias', categoria)
      this.categorias.push({ ...categoria, id })
      return id
    }
  }
})