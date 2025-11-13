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

    <VMain class="bg-grey-lighten-4">
      <VContainer class="py-6">
        <NuxtPage />
        <VFooter class="mt-8 text-center text-caption text-medium-emphasis">
          Powered by totoro-paradise v{{ appConfig.version }}
        </VFooter>
      </VContainer>
    </VMain>
  </VApp>
</template>
