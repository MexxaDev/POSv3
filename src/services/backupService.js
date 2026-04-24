import { database } from '../services/database'

export const backupService = {
  async exportData() {
    try {
      const data = {
        version: 1,
        fechaExport: new Date().toISOString(),
        nombre: 'POS System Backup',
        tables: {}
      }

      const tables = ['articulos', 'categorias', 'clientes', 'ventas', 'caja', 'mediosPago', 'config']
      
      for (const table of tables) {
        data.tables[table] = await database.getAll(table)
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pos_backup_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      return { success: true, message: 'Backup exportado correctamente' }
    } catch (e) {
      console.error('Backup export error:', e)
      return { success: false, message: 'Error al exportar: ' + e.message }
    }
  },

  async importData(jsonString) {
    try {
      const data = JSON.parse(jsonString)

      if (!data.version || !data.tables) {
        throw new Error('Archivo de backup inválido')
      }

      await database.transaction('rw', database.db.tables, async () => {
        for (const [tableName, records] of Object.entries(data.tables)) {
          if (database.db[tableName]) {
            await database.db[tableName].clear()
            if (Array.isArray(records)) {
              await database.db[tableName].bulkAdd(records)
            }
          }
        }
      })

      return { success: true, message: 'Backup importado correctamente' }
    } catch (e) {
      console.error('Backup import error:', e)
      return { success: false, message: 'Error al importar: ' + e.message }
    }
  },

  showImportDialog() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) {
          resolve({ success: false, message: 'No se seleccionó archivo' })
          return
        }

        const reader = new FileReader()
        reader.onload = async (event) => {
          const result = await this.importData(event.target.result)
          resolve(result)
        }
        reader.onerror = () => {
          resolve({ success: false, message: 'Error al leer el archivo' })
        }
        reader.readAsText(file)
      }
      input.click()
    })
  }
}