<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <h1 class="page-title">Configuración</h1>
        <p class="page-subtitle">Copia de seguridad y administración</p>
      </div>
    </div>

    <div class="config-grid">
      <BaseCard title="Copia de Seguridad">
        <div class="backup-section">
          <p class="backup-description">
            Exporta todos tus datos (artículos, clientes, ventas, categorías) para tener una copia de seguridad.
            También puedes importar una copia anterior.
          </p>
          
          <div class="backup-actions">
            <BaseButton variant="primary" @click="exportarBackup" :loading="exporting">
              <i class="ti ti-download"></i>
              Exportar Backup
            </BaseButton>
            <BaseButton variant="secondary" @click="importarBackup" :loading="importing">
              <i class="ti ti-upload"></i>
              Importar Backup
            </BaseButton>
          </div>

          <div v-if="ultimoBackup" class="backup-info">
            <i class="ti ti-check"></i>
            <span>Último backup: {{ ultimoBackup }}</span>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Estadísticas">
        <div class="stats-section">
          <div class="stat-item">
            <span class="stat-value">{{ stats.articulos }}</span>
            <span class="stat-label">Artículos</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.clientes }}</span>
            <span class="stat-label">Clientes</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.ventas }}</span>
            <span class="stat-label">Ventas</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.categorias }}</span>
            <span class="stat-label">Categorías</span>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Limpiar Datos">
        <div class="danger-section">
          <p class="danger-description">
            Elimina todos los datos del sistema. Esta acción no se puede deshacer.
          </p>
          <BaseButton variant="danger" @click="confirmarLimpiar">
            <i class="ti ti-trash"></i>
            Limpiar Todo
          </BaseButton>
        </div>
      </BaseCard>

      <BaseCard title="Acerca de">
        <div class="about-section">
          <h3>Sistema POS</h3>
          <p>Versión 2.0</p>
          <p class="about-tech">Vue 3 + Pinia + Dexie.js</p>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import BaseButton from '../components/common/BaseButton.vue'
import BaseCard from '../components/common/BaseCard.vue'
import { database } from '../services/database'
import { backupService } from '../services/backupService'
import { useToast } from '../composables/useToast'

const toast = useToast()

const exporting = ref(false)
const importing = ref(false)
const ultimoBackup = ref('')
const stats = ref({
  articulos: 0,
  clientes: 0,
  ventas: 0,
  categorias: 0
})

onMounted(async () => {
  await cargarStats()
  const stored = localStorage.getItem('pos_last_backup')
  if (stored) {
    ultimoBackup.value = new Date(stored).toLocaleString('es-AR')
  }
})

const cargarStats = async () => {
  stats.value = {
    articulos: await database.count('articulos'),
    clientes: await database.count('clientes'),
    ventas: await database.count('ventas'),
    categorias: await database.count('categorias')
  }
}

const exportarBackup = async () => {
  exporting.value = true
  try {
    const result = await backupService.exportData()
    if (result.success) {
      localStorage.setItem('pos_last_backup', new Date().toISOString())
      ultimoBackup.value = new Date().toLocaleString('es-AR')
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  } catch (e) {
    toast.error('Error al exportar')
    console.error(e)
  } finally {
    exporting.value = false
  }
}

const importarBackup = async () => {
  if (!confirm('¿Importar backup? Los datos actuales se reemplazarán.')) return

  importing.value = true
  try {
    const result = await backupService.showImportDialog()
    if (result.success) {
      toast.success(result.message)
      setTimeout(() => window.location.reload(), 1000)
    } else if (result.message !== 'No se seleccionó archivo') {
      toast.error(result.message)
    }
  } catch (e) {
    toast.error('Error al importar')
    console.error(e)
  } finally {
    importing.value = false
  }
}

const confirmarLimpiar = async () => {
  if (!confirm('¿Estás seguro de eliminar TODOS los datos? Esta acción es IRREVERSIBLE.')) return
  if (!confirm('ÚLTIMA ADVERTENCIA: Se eliminarán todos los artículos, clientes, ventas y categorías. ¿Continuar?')) return

  try {
    const tables = ['articulos', 'categorias', 'clientes', 'ventas', 'caja', 'mediosPago']
    for (const table of tables) {
      await database.clear(table)
    }
    toast.success('Datos eliminados')
    await cargarStats()
  } catch (e) {
    toast.error('Error al limpiar datos')
    console.error(e)
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5);
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.page-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

.backup-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.backup-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.backup-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.backup-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: rgba(52, 199, 89, 0.1);
  border-radius: var(--radius-md);
  color: var(--success);
  font-size: var(--font-size-sm);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.stat-item {
  text-align: center;
  padding: var(--space-3);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
}

.stat-value {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.danger-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.danger-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.about-section {
  text-align: center;
}

.about-section h3 {
  margin-bottom: var(--space-2);
}

.about-section p {
  color: var(--text-secondary);
  margin: var(--space-1) 0;
}

.about-tech {
  margin-top: var(--space-3) !important;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>