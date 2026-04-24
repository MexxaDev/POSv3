import Dexie from 'dexie'

const db = new Dexie('POSSystem')

db.version(2).stores({
  articulos: '++id, codigo, nombre, categoria',
  categorias: '++id, nombre',
  clientes: '++id, nombre, telefono',
  ventas: '++id, fecha, clienteId',
  caja: '++id, fecha, abierta, cajaId',
  mediosPago: '++id, nombre',
  config: '++id, clave'
})

export const database = {
  db,

  async getAll(store) {
    return await db[store].toArray()
  },

  async get(store, id) {
    return await db[store].get(id)
  },

  async add(store, data) {
    return await db[store].add(data)
  },

  async put(store, data) {
    return await db[store].put(data)
  },

  async delete(store, id) {
    return await db[store].delete(id)
  },

  async clear(store) {
    return await db[store].clear()
  },

  async count(store) {
    return await db[store].count()
  },

  async query(store, index, value) {
    return await db[store].where(index).equals(value).toArray()
  },

  async range(store, index, lower, upper) {
    return await db[store].where(index).between(lower, upper).toArray()
  },

  async exportAll() {
    const data = {}
    const tables = db.tables.map(t => t.name)
    for (const table of tables) {
      data[table] = await db[table].toArray()
    }
    return data
  },

  async importAll(data) {
    await db.transaction('rw', db.tables, async () => {
      for (const [tableName, records] of Object.entries(data)) {
        if (db[tableName]) {
          await db[tableName].clear()
          await db[tableName].bulkAdd(records)
        }
      }
    })
  }
}

export default database