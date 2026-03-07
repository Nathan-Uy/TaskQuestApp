<template>
  <div class="app-shell">
    <AppSidebar />
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './components/AppSideBar.vue'
</script>

<style>
@import './assets/styles/main.css';
.app-shell { display: flex; min-height: 100vh; }
.app-main  { margin-left: 224px; flex: 1; padding: 40px 48px; min-height: 100vh; max-width: 960px; }
@media (max-width: 768px) { .app-main { margin-left: 0; padding: 24px 20px; } }
</style>