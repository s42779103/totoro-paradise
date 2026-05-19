<script setup lang="ts">
const appConfig = useAppConfig()
const route = useRoute()

useHead({
  title: '龙猫乐园喵~',
})

const navItems = [
  { title: '阳光跑', icon: 'mdi-run', to: '/scanned' },
  { title: '早操', icon: 'mdi-hand-peace', to: '/morning-checkin' },
  { title: '自由跑', icon: 'mdi-run-fast', to: '/free-run' },
]

const showNav = computed(() => route.path !== '/')
const activeNav = ref('')
</script>
<script lang="ts">
window.global = window
</script>
<template>
  <VApp>
    <VMain>
      <VContainer class="py-6">
        <NuxtPage />
        <VFooter class="mt-8 text-center text-caption text-medium-emphasis">
          Powered by totoro-paradise v{{ appConfig.version }}
        </VFooter>
      </VContainer>
    </VMain>
    <VBottomNavigation v-if="showNav" v-model="activeNav" color="primary" grow>
      <VBtn v-for="item in navItems" :key="item.to" :to="item.to">
        <VIcon>{{ item.icon }}</VIcon>
        <span class="text-caption">{{ item.title }}</span>
      </VBtn>
    </VBottomNavigation>
  </VApp>
</template>

<style>
/* 使用 Vuetify 提供的主题变量作为页面背景，支持深/浅色切换 */
html, body, #__nuxt, #app, .v-application {
  background-color: var(--v-theme-background, #ffffff) !important;
  color-scheme: var(--v-theme-color-scheme, light);
}
</style>
