<template>
  <div class="grid grid-cols-[224px_1fr] h-screen bg-stone-50 overflow-hidden">
    <AppSideBar />
      <main class="mt-5 mr-5 overflow-auto">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
  </div>
</template>

<script setup lang="ts">
import AppSideBar from "@/components/AppSideBar.vue";
</script>
