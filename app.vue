<script setup lang="ts">
// import '@unocss/reset/tailwind.css';

const appConfig = useAppConfig();

useHead({
  title: '龙猫乐园喵~'
})
</script>
<script lang="ts">
window.global = window;
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
  </VApp>
</template>

<style>
/* 使用 Vuetify 提供的主题变量作为页面背景，支持深/浅色切换 */
html, body, #__nuxt, #app, .v-application {
  background-color: var(--v-theme-background, #ffffff) !important;
  color-scheme: var(--v-theme-color-scheme, light);
}
</style>
