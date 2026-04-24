import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: null,
    pin: '1234',
    requiereAuth: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.usuario,
    getUsuario: (state) => state.usuario
  },

  actions: {
    async login(pinIngresado) {
      if (pinIngresado === this.pin) {
        this.usuario = { nombre: 'Usuario', pin: this.pin }
        localStorage.setItem('pos_auth', JSON.stringify(this.usuario))
        return true
      }
      return false
    },

    logout() {
      this.usuario = null
      localStorage.removeItem('pos_auth')
    },

    async verificarSesion() {
      const stored = localStorage.getItem('pos_auth')
      if (stored) {
        try {
          this.usuario = JSON.parse(stored)
          return true
        } catch {
          this.logout()
        }
      }
      return false
    },

    cambiarPin(nuevoPin) {
      this.pin = nuevoPin
      if (this.usuario) {
        this.usuario.pin = nuevoPin
        localStorage.setItem('pos_auth', JSON.stringify(this.usuario))
      }
    }
  }
})