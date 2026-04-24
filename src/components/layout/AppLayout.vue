<template>
  <div class="app-layout">
    <TopNav />
    <main class="app-layout__main">
      <slot />
    </main>
    <Toast />
  </div>
</template>

<script setup>
import TopNav from './TopNav.vue'
import Toast from '../common/Toast.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.app-layout__main {
  flex: 1;
  padding: var(--space-6);
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .app-layout__main {
    padding: var(--space-4);
  }
}
</style>