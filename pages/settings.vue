<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const session = useSession()
const router = useRouter()
const showToken = ref(false)
const copySuccess = ref(false)
const { copy } = useClipboard()

const handleCopyToken = async () => {
  if (!session.value.token) return
  await copy(session.value.token)
  copySuccess.value = true
  setTimeout(() => {
    copySuccess.value = false
  }, 2000)
}

const handleClearSession = () => {
  localStorage.removeItem('totoroSession')
  localStorage.removeItem('sunRunPaper')
  session.value.token = ''
  router.push('/')
}
</script>
<template>
  <VCard class="pa-4">
    <VCardTitle class="text-h6 mb-4">设置</VCardTitle>
    <VCardText>
      <VAlert v-if="!session.token" type="info" variant="tonal" class="mb-4">
        尚未登录，请先登录后再查看设置
        <template #append>
          <VBtn size="small" variant="text" to="/">去登录</VBtn>
        </template>
      </VAlert>

      <template v-else>
        <!-- Session Info -->
        <VCard variant="outlined" class="mb-6">
          <VCardTitle class="text-subtitle-2 pa-4 pb-0">
            <VIcon color="primary" class="mr-2">mdi-account</VIcon>
            个人信息
          </VCardTitle>
          <VCardText class="pa-4">
            <div class="d-flex flex-wrap gap-4 mb-4">
              <div class="info-item">
                <div class="text-caption text-medium-emphasis mb-1">学校</div>
                <div class="text-body-1">{{ session.campusName }}</div>
              </div>
              <div class="info-item">
                <div class="text-caption text-medium-emphasis mb-1">学号</div>
                <div class="text-body-1">{{ session.stuNumber }}</div>
              </div>
              <div class="info-item">
                <div class="text-caption text-medium-emphasis mb-1">姓名</div>
                <div class="text-body-1">{{ session.stuName }}</div>
              </div>
              <div class="info-item">
                <div class="text-caption text-medium-emphasis mb-1">手机号</div>
                <div class="text-body-1">{{ session.phoneNumber }}</div>
              </div>
            </div>

            <VTextField
              :model-value="session.token"
              :type="showToken ? 'text' : 'password'"
              label="登录令牌 (Token)"
              variant="outlined"
              readonly
              density="compact"
            >
              <template #append-inner>
                <VBtn
                  size="small"
                  variant="text"
                  :icon="showToken ? 'mdi-eye-off' : 'mdi-eye'"
                  @click="showToken = !showToken"
                />
              </template>
            </VTextField>
          </VCardText>
        </VCard>

        <!-- Copy Token -->
        <VCard variant="outlined" class="mb-6">
          <VCardTitle class="text-subtitle-2 pa-4 pb-0">
            <VIcon color="primary" class="mr-2">mdi-content-copy</VIcon>
            复制凭据
          </VCardTitle>
          <VCardText class="pa-4">
            <VBtn color="primary" variant="outlined" class="mb-2" @click="handleCopyToken">
              <template #prepend>
                <VIcon>mdi-clipboard</VIcon>
              </template>
              复制 Token
            </VBtn>
            <VSnackbar v-model="copySuccess" color="success" timeout="2000">
              已复制到剪贴板
            </VSnackbar>
          </VCardText>
        </VCard>

        <!-- How to set up Vercel Cron -->
        <VCard variant="outlined" class="mb-6">
          <VCardTitle class="text-subtitle-2 pa-4 pb-0">
            <VIcon color="primary" class="mr-2">mdi-clock-outline</VIcon>
            自动打卡配置
          </VCardTitle>
          <VCardText class="pa-4">
            <p class="text-body-2 mb-3">
              要启用 Vercel Cron 自动早操打卡，请在 Vercel Dashboard 设置以下环境变量：
            </p>
            <VTable density="compact">
              <thead>
                <tr>
                  <th>变量名</th>
                  <th>值</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-caption font-mono">TOTORO_TOKEN</td>
                  <td class="text-caption">{{ session.token.substring(0, 20) }}...</td>
                </tr>
                <tr>
                  <td class="text-caption font-mono">TOTORO_STU_NUMBER</td>
                  <td class="text-caption">{{ session.stuNumber }}</td>
                </tr>
                <tr>
                  <td class="text-caption font-mono">TOTORO_SCHOOL_ID</td>
                  <td class="text-caption">{{ session.schoolId }}</td>
                </tr>
                <tr>
                  <td class="text-caption font-mono">TOTORO_CAMPUS_ID</td>
                  <td class="text-caption">{{ session.campusId }}</td>
                </tr>
                <tr>
                  <td class="text-caption font-mono">TOTORO_PHONE_NUMBER</td>
                  <td class="text-caption">{{ session.phoneNumber }}</td>
                </tr>
              </tbody>
            </VTable>
            <p class="text-caption text-medium-emphasis mt-3">
              Token 过期后需重新复制并更新环境变量
            </p>
          </VCardText>
        </VCard>

        <!-- Clear Session -->
        <VCard variant="outlined">
          <VCardText class="pa-4">
            <VBtn color="error" variant="outlined" @click="handleClearSession">
              <template #prepend>
                <VIcon>mdi-delete</VIcon>
              </template>
              清除登录状态
            </VBtn>
          </VCardText>
        </VCard>
      </template>
    </VCardText>
  </VCard>
</template>

<style scoped>
.info-item {
  min-width: 140px;
  flex: 1;
}
.font-mono {
  font-family: monospace;
}
@media (max-width: 600px) {
  .info-item {
    min-width: 100%;
  }
}
</style>
