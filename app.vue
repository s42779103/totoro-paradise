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
    <VAppBar color="primary" class="px-4" elevation="1">
      <VAppBarTitle class="text-h6 font-weight-bold">龙猫乐园喵~</VAppBarTitle>
      <VSpacer />
      <template #append>
        <VBtn icon variant="text" class="mr-2" href="https://akarin.online"
          rel="noreferrer noopener" target="_blank">
          <VIcon>mdi-github</VIcon>
        </VBtn>
      </template>
    </VAppBar>
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
