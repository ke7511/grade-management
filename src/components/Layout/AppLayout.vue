<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import Sidebar from './Sidebar.vue'
import HeaderBar from './Header.vue'

const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
</script>

<template>
  <div class="app-layout" v-if="isLoggedIn">
    <Sidebar />
    <div class="main-container">
      <HeaderBar />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: var(--bg-color);
}
</style>
