import { database } from '../services/database'
import { useNegocioStore } from '../stores/negocio'

export const whatsappService = {
  generarMensajeCierre(resumen) {
    const negocioStore = useNegocioStore()
    const datos = negocioStore.datos

    const hoy = new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    let mensaje = `*CIERRE DE CAJA - ${datos.nombre?.toUpperCase() || 'MI NEGOCIO'}*\n\n`
    mensaje += `📅 Fecha: ${hoy}\n\n`
    mensaje += `💰 *RESUMEN*\n`
    mensaje += `• Saldo Inicial: $${this.formatNumber(resumen.saldoInicial || 0)}\n`
    mensaje += `• Total Ventas: $${this.formatNumber(resumen.totalVentas || 0)}\n`
    mensaje += `• Ingresos: $${this.formatNumber(resumen.ingresos || 0)}\n`
    mensaje += `• Egresos: $${this.formatNumber(resumen.egresos || 0)}\n`
    mensaje += `• Saldo Final: $${this.formatNumber(resumen.saldoFinal || 0)}\n\n`

    if (resumen.ventasPorMedio) {
      mensaje += `💳 *POR MÉTODO DE PAGO*\n`
      for (const [medio, monto] of Object.entries(resumen.ventasPorMedio)) {
        mensaje += `• ${medio}: $${this.formatNumber(monto)}\n`
      }
      mensaje += '\n'
    }

    mensaje += `📊 *ESTADÍSTICAS*\n`
    mensaje += `• Cant. Ventas: ${resumen.cantidadVentas || 0}\n`
    mensaje += `• Ticket Promedio: $${this.formatNumber(resumen.ticketPromedio || 0)}\n`

    return mensaje
  },

  generarMensajeVenta(venta) {
    const negocioStore = useNegocioStore()
    const datos = negocioStore.datos

    let mensaje = `🧾 *NUEVA VENTA*\n\n`
    mensaje += `📅 ${new Date(venta.fecha).toLocaleString('es-AR')}\n`
    mensaje += `👤 Cliente: ${venta.cliente || 'Consumidor Final'}\n\n`
    mensaje += `🛒 *PRODUCTOS*\n`
    
    if (venta.articulos) {
      venta.articulos.forEach(item => {
        mensaje += `• ${item.nombre} x${item.cantidad}: $${this.formatNumber(item.precio * item.cantidad)}\n`
      })
    }

    mensaje += `\n💰 *TOTAL: $${this.formatNumber(venta.total || 0)}*\n`
    mensaje += `💳 Pago: ${venta.medioPago?.map(m => `${m.medioNombre}: $${this.formatNumber(m.monto)}`).join(' + ') || '-'}\n`

    if (venta.nota) {
      mensaje += `\n📝 Nota: ${venta.nota}\n`
    }

    return mensaje
  },

  abrirWhatsApp(mensaje) {
    const negocioStore = useNegocioStore()
    const numero = negocioStore.datos.whatsapp?.replace(/\D/g, '') || ''

    if (!numero) {
      return { success: false, message: 'No hay número de WhatsApp configurado' }
    }

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')

    return { success: true, message: 'WhatsApp abierto' }
  },

  formatNumber(num) {
    return new Intl.NumberFormat('es-AR').format(num || 0)
  }
}