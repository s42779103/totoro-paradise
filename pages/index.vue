<script setup lang="ts">
import TotoroApiWrapper from '~/src/wrappers/TotoroApiWrapper';

const router = useRouter();
const { data } = await useFetch<{ uuid: string; imgUrl: string }>('/api/scanQr');
const message = ref('');
const session = useSession();
const isPolling = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const checkScanStatus = async () => {
  if (!data.value?.uuid) return;

  try {
    isLoading.value = true;
    errorMessage.value = '';
    const scanRes = await $fetch(`/api/scanQr/${data.value.uuid}`);
    const code = (scanRes as { code: string; message: null } | { code: null; message: string })
      .code as string;

    if (code) {
      isPolling.value = false;
      message.value = '扫码成功，正在登录...';

      const loginResult = (
        await Promise.all([TotoroApiWrapper.getLesseeServer(code), TotoroApiWrapper.getAppAd(code)])
      )[0];

      if (!loginResult.token) {
        errorMessage.value = loginResult.message as string;
        return;
      }

      // 获取额外信息
      const personalInfo = await TotoroApiWrapper.login({ token: loginResult.token });
      session.value = { ...personalInfo, token: loginResult.token, code, data: null };
      const breq = {
        token: loginResult.token,
        campusId: personalInfo.campusId,
        schoolId: personalInfo.schoolId,
        stuNumber: personalInfo.stuNumber,
      };

      await Promise.all([
        TotoroApiWrapper.getAppFrontPage(breq),
        TotoroApiWrapper.getAppSlogan(breq),
        TotoroApiWrapper.updateAppVersion(breq),
        TotoroApiWrapper.getAppNotice(breq)
      ]);

      router.push('/scanned');
    } else if (isPolling.value) {
      setTimeout(checkScanStatus, 1000);
    }
  } catch (e) {
    console.error(e);
    errorMessage.value = '发生错误，请重试';
    if (isPolling.value) {
      setTimeout(checkScanStatus, 1000);
    }
  } finally {
    isLoading.value = false;
  }
};

// 开始轮询检测
watch(data, (newData) => {
  if (newData?.uuid && !isPolling.value) {
    isPolling.value = true;
    checkScanStatus();
  }
});

// 组件卸载时停止轮询
onUnmounted(() => {
  isPolling.value = false;
});

// 保留原有的handleScanned作为备选方案
const handleScanned = async () => {
  if (!isPolling.value) {
    isPolling.value = true;
    checkScanStatus();
  }
};
</script>
<template>
  <VCard class="pa-4">
    <VCardText>
      <div class="text-center mb-6">
        <p class="text-body-1 text-medium-emphasis">
          多少事，从来急；天地转，光阴迫。一万年太久，只争朝夕。
        </p>
        <p class="text-caption text-medium-emphasis mt-2">
          ————毛泽东《满江红·和郭沫若同志》
        </p>
      </div>

      <VDivider class="my-6" />

      <div class="text-center mb-6">
        <p class="text-body-1 mb-4">请用微信扫码，扫码后点击"下一步"按钮</p>
        <VCard :height="200" :width="200" class="mx-auto mb-4" variant="outlined">
          <VCardItem class="h-100 pa-0">
            <template v-if="isLoading">
              <div class="h-100 w-100 d-flex align-center justify-center">
                <VProgressCircular indeterminate color="primary" />
              </div>
            </template>
            <img v-else-if="!message" :src="data!.imgUrl" class="w-100 h-100 object-contain"
              referrerpolicy="no-referrer" />
            <div v-else class="h-100 w-100 d-flex align-center justify-center text-medium-emphasis">
              {{ message }}
            </div>
          </VCardItem>
        </VCard>

        <VAlert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </VAlert>

        <VBtn color="primary" size="large" class="mb-6" @click="handleScanned" :loading="isLoading"
          :disabled="isLoading">
          <template v-slot:prepend>
            <VIcon>mdi-arrow-right</VIcon>
          </template>
          下一步
        </VBtn>


      </div>
    </VCardText>
  </VCard>
</template>
