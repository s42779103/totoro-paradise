<script setup lang="ts">
import TotoroApiWrapper from '~/src/wrappers/TotoroApiWrapper'
import generateMorningExercisesReq from '~/src/controllers/generateMorningExercisesReq'

const session = useSession()
const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')
const data = ref<Awaited<ReturnType<typeof TotoroApiWrapper.getMornSignPaper>> | null>(null)
const selectedPointId = ref('')
const submitting = ref(false)
const submitResult = ref<{ success: boolean; message: string } | null>(null)

const allSigned = computed(() => {
  if (!data.value) return false
  return Number(data.value.dayCompSignCount) >= Number(data.value.dayNeedSignCount)
})

const selectedPoint = computed(() => {
  if (!data.value || !selectedPointId.value) return null
  return data.value.signPointList.find((p) => p.pointId === selectedPointId.value) || null
})

const fetchData = async () => {
  if (!session.value.token) {
    router.push('/')
    return
  }
  try {
    isLoading.value = true
    errorMessage.value = ''
    console.log('[MorningSign] 获取早操签到任务...')
    const result = await $fetch('/api/mornsign/getPaper', {
      method: 'POST',
      body: {
        stuNumber: session.value.stuNumber,
        phoneNumber: session.value.phoneNumber,
        schoolId: session.value.schoolId,
        campusId: session.value.campusId,
        token: session.value.token,
      },
    })
    if (result.paper) {
      console.log('[MorningSign] 获取成功, signType:', result.paper.signType, 'points:', result.paper.signPointList?.length)
      data.value = result.paper
    } else {
      console.warn('[MorningSign] 获取失败:', result.message)
      errorMessage.value = result.message || '获取失败'
    }
  } catch (e) {
    console.error('[MorningSign] 获取异常:', e)
    errorMessage.value = '获取签到任务失败，请重试'
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!selectedPoint.value || !data.value) return
  try {
    submitting.value = true
    submitResult.value = null
    console.log('[MorningSign] 提交签到, pointId:', selectedPoint.value.pointId, 'pointName:', selectedPoint.value.pointName)
    const req = await generateMorningExercisesReq({
      stuNumber: session.value.stuNumber,
      phoneNumber: session.value.phoneNumber,
      signPoint: selectedPoint.value,
      signType: data.value.signType,
      offsetRange: data.value.offsetRange,
      token: session.value.token,
    })
    const res = await $fetch('/api/mornsign/submit', { method: 'POST', body: req })
    if (res.code === '0') {
      console.log('[MorningSign] 签到成功')
      submitResult.value = { success: true, message: '签到成功' }
    } else {
      console.warn('[MorningSign] 签到失败:', res.message || res)
      submitResult.value = { success: false, message: (res as { message?: string }).message || '签到失败' }
    }
  } catch (e) {
    console.error('[MorningSign] 提交异常:', e)
    submitResult.value = { success: false, message: '提交出错' }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
<template>
  <VCard class="pa-4">
    <VCardTitle class="text-h6 mb-4">早操签到</VCardTitle>
    <VCardText>
      <VAlert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable>
        {{ errorMessage }}
        <template #append>
          <VBtn size="small" variant="text" @click="fetchData">重试</VBtn>
        </template>
      </VAlert>

      <div v-if="isLoading" class="d-flex justify-center my-8">
        <VProgressCircular indeterminate color="primary" />
      </div>

      <VAlert v-else-if="!session.token" type="info" variant="tonal" class="mb-4">
        请先登录
        <template #append>
          <VBtn size="small" variant="text" to="/">去登录</VBtn>
        </template>
      </VAlert>

      <template v-else-if="data">
        <VCard variant="outlined" class="mb-6">
          <VCardTitle class="text-subtitle-2 pa-4 pb-0">
            <VIcon color="primary" class="mr-2">mdi-information</VIcon>
            签到任务信息
          </VCardTitle>
          <VCardText class="pa-4">
            <div class="d-flex flex-wrap gap-4">
              <div class="info-item">
                <div class="text-caption text-medium-emphasis mb-1">签到日期</div>
                <div class="text-body-1">{{ data.startDate }} ~ {{ data.endDate }}</div>
              </div>
              <div class="info-item">
                <div class="text-caption text-medium-emphasis mb-1">签到时间</div>
                <div class="text-body-1">{{ data.startTime }} ~ {{ data.endTime }}</div>
              </div>
              <div class="info-item">
                <div class="text-caption text-medium-emphasis mb-1">签到进度</div>
                <div class="text-body-1">{{ data.dayCompSignCount }} / {{ data.dayNeedSignCount }}</div>
              </div>
              <div class="info-item">
                <div class="text-caption text-medium-emphasis mb-1">签到类型</div>
                <div class="text-body-1">
                  {{ data.signType === '1' ? '位置签到' : data.signType === '2' ? '扫码签到' : data.signType }}
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>

        <VAlert v-if="allSigned" color="success" variant="tonal" class="mb-4">
          <template #prepend><VIcon>mdi-check-circle</VIcon></template>
          今日签到已完成
        </VAlert>

        <template v-else>
          <VSelect v-model="selectedPointId" :items="data.signPointList" item-title="pointName" item-value="pointId" variant="outlined" label="选择签到点" class="mb-4" :menu-props="{ maxHeight: '300px' }">
            <template #prepend-inner><VIcon>mdi-map-marker</VIcon></template>
            <template #item="{ item, props: itemProps }">
              <VListItem v-bind="itemProps" class="mb-1">
                <template #subtitle>
                  <span class="text-caption text-medium-emphasis">{{ (item.raw as any).latitude }}, {{ (item.raw as any).longitude }}</span>
                </template>
              </VListItem>
            </template>
          </VSelect>

          <VBtn color="primary" size="large" block :loading="submitting" :disabled="!selectedPointId || submitting" @click="handleSubmit">
            <template #prepend><VIcon>mdi-hand-peace</VIcon></template>
            执行签到
          </VBtn>

          <VAlert v-if="submitResult" :color="submitResult.success ? 'success' : 'error'" variant="tonal" class="mt-4" closable>
            <template #prepend><VIcon>{{ submitResult.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}</VIcon></template>
            {{ submitResult.message }}
          </VAlert>
        </template>
      </template>
    </VCardText>
  </VCard>
</template>

<style scoped>
.info-item { min-width: 180px; flex: 1; }
@media (max-width: 600px) { .info-item { min-width: 100%; } }
</style>
