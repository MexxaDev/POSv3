<template>
  <header class="top-nav">
    <div class="top-nav__brand">
      <span class="top-nav__title">Sistema POS</span>
    </div>
    <nav class="top-nav__links">
      <router-link
        v-for="link in navLinks"
        :key="link.path"
        :to="link.path"
        class="top-nav__link"
        :class="{ 'top-nav__link--active': $route.path === link.path }"
      >
        <i :class="link.icon"></i>
        <span>{{ link.label }}</span>
      </router-link>
    </nav>
    <div class="top-nav__actions">
      <button class="top-nav__action-btn" @click="mostrarMovimientoCaja" title="Movimiento de Caja">
        <i class="ti ti-arrows-exchange"></i>
      </button>
      <router-link to="/configuracion" class="top-nav__action-btn" title="Configuración">
        <i class="ti ti-settings"></i>
      </router-link>
      <div class="top-nav__user">
        <button class="top-nav__user-btn" @click="toggleMenu">
          <i class="ti ti-user"></i>
        </button>
        <Transition name="dropdown">
          <div v-if="menuOpen" class="top-nav__dropdown">
            <div class="top-nav__dropdown-header">
              <small>Sesión activa</small>
            </div>
            <router-link to="/datos-negocio" class="top-nav__dropdown-item" @click="menuOpen = false">
              <i class="ti ti-store"></i>
              <span>Datos del Negocio</span>
            </router-link>
            <router-link to="/categorias" class="top-nav__dropdown-item" @click="menuOpen = false">
              <i class="ti ti-tag"></i>
              <span>Categorías</span>
            </router-link>
            <router-link to="/medios-pago" class="top-nav__dropdown-item" @click="menuOpen = false">
              <i class="ti ti-credit-card"></i>
              <span>Métodos de Pago</span>
            </router-link>
            <div class="top-nav__dropdown-divider"></div>
            <button class="top-nav__dropdown-item top-nav__dropdown-item--danger" @click="logout">
              <i class="ti ti-logout"></i>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useCajaStore } from '../../stores/caja'

const router = useRouter()
const authStore = useAuthStore()
const cajaStore = useCajaStore()

const menuOpen = ref(false)

const navLinks = [
  { path: '/', label: 'Venta', icon: 'ti ti-point-of-sale' },
  { path: '/inventario', label: 'Inventario', icon: 'ti ti-packages' },
  { path: '/clientes', label: 'Clientes', icon: 'ti ti-users' },
  { path: '/caja', label: 'Caja', icon: 'ti ti-cash-register' },
  { path: '/dashboard', label: 'Dashboard', icon: 'ti ti-chart-pie' },
  { path: '/reportes', label: 'Reportes', icon: 'ti ti-file-bar' }
]

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const mostrarMovimientoCaja = () => {
  if (!cajaStore.estaAbierta) {
    router.push('/caja')
    return
  }
  router.push('/caja')
}

const logout = () => {
  menuOpen.value = false
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-6);
  background: var(--bg-card);
  border-bottom: var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.top-nav__brand {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.top-nav__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.top-nav__links {
  display: flex;
  gap: var(--space-1);
}

.top-nav__link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.top-nav__link:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.top-nav__link--active {
  background: var(--accent);
  color: white;
}

.top-nav__link--active:hover {
  background: var(--accent-dark);
  color: white;
}

.top-nav__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.top-nav__action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.top-nav__action-btn:hover {
  background: var(--accent-light);
  color: var(--accent);
}

.top-nav__user {
  position: relative;
  margin-left: var(--space-2);
}

.top-nav__user-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.top-nav__user-btn:hover {
  background: var(--accent);
  color: white;
}

.top-nav__dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  min-width: 200px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-medium);
  border: var(--border-subtle);
  padding: var(--space-2);
}

.top-nav__dropdown-header {
  padding: var(--space-2) var(--space-3);
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}

.top-nav__dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.top-nav__dropdown-item:hover {
  background: var(--bg-primary);
}

.top-nav__dropdown-item--danger {
  color: var(--error);
}

.top-nav__dropdown-item--danger:hover {
  background: rgba(255, 59, 48, 0.1);
}

.top-nav__dropdown-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: var(--space-2) 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 1024px) {
  .top-nav__link span {
    display: none;
  }

  .top-nav__link {
    padding: var(--space-2);
  }
}

@media (max-width: 768px) {
  .top-nav {
    padding: var(--space-2) var(--space-4);
  }

  .top-nav__links {
    overflow-x: auto;
    gap: 0;
  }

  .top-nav__link span {
    display: none;
  }
}
</style>