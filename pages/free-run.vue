<script setup lang="ts">
import TotoroApiWrapper from '~/src/wrappers/TotoroApiWrapper'

const sunrunPaper = useSunRunPaper()
const session = useSession()
const router = useRouter()
const selectValue = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const data = ref(null)

const hasRunToday = computed(() => data.value?.ifHasRun === '1')

const fetchData = async () => {
  if (!session.value.token) {
    router.push('/')
    return
  }
  try {
    isLoading.value = true
    errorMessage.value = ''
    console.log('[FreeRun] 获取阳光跑路线（用于自由跑）...')
    const result = await TotoroApiWrapper.getSunRunPaper({
      token: session.value.token,
      campusId: session.value.campusId,
      schoolId: session.value.schoolId,
      stuNumber: session.value.stuNumber,
    })
    console.log('[FreeRun] 获取成功, routes:', result.runPointList?.length)
    data.value = result
    sunrunPaper.value = result
  } catch (e) {
    console.error('[FreeRun] 获取异常:', e)
    errorMessage.value = '获取路线数据失败，请重试'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => { fetchData() })

const handleUpdate = (target: string) => { selectValue.value = target }

const handleRandomSelect = () => {
  if (!data.value?.runPointList?.length) return
  const randomIndex = Math.floor(Math.random() * data.value.runPointList.length)
  selectValue.value = data.value.runPointList[randomIndex].pointId
}
</script>
<template>
  <VCard class="pa-4">
    <VCardTitle class="text-h6 mb-4">自由跑 · 路线选择</VCardTitle>
    <VCardText>
      <VCard variant="outlined" class="mb-6">
        <VCardTitle class="text-subtitle-2 pa-4 pb-0">
          <VIcon color="primary" class="mr-2">mdi-account</VIcon>
          个人信息
        </VCardTitle>
        <VCardText class="pa-4">
          <div class="d-flex flex-wrap gap-4">
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
          </div>
        </VCardText>
      </VCard>

      <VAlert v-if="errorMessage" type="error" variant="tonal" class="mb-4">{{ errorMessage }}</VAlert>

      <template v-if="isLoading">
        <div class="d-flex justify-center my-8">
          <VProgressCircular indeterminate color="primary" />
        </div>
      </template>
      <template v-else-if="data">
        <VAlert v-if="hasRunToday" color="success" variant="tonal" class="mb-4">
          <template #prepend><VIcon>mdi-check-circle</VIcon></template>
          今日跑步已完成
        </VAlert>

        <template v-if="!hasRunToday">
        <VSelect v-model="selectValue" :items="data.runPointList" item-title="pointName" item-value="pointId" variant="outlined" label="选择路线" class="mb-4" :menu-props="{ maxHeight: '300px' }">
          <template #prepend-inner><VIcon>mdi-map-marker</VIcon></template>
        </VSelect>

        <div class="d-flex gap-4 mb-6">
          <VBtn variant="outlined" color="primary" @click="handleRandomSelect" :disabled="!data.runPointList?.length">
            <template #prepend><VIcon>mdi-dice-3</VIcon></template>
            随机路线
          </VBtn>
          <VSpacer />
          <NuxtLink v-if="selectValue" :to="`/run/${encodeURIComponent(selectValue)}?type=free`">
            <VBtn color="primary"><template #prepend><VIcon>mdi-run</VIcon></template>开始跑步</VBtn>
          </NuxtLink>
          <VBtn v-else color="primary" disabled>
            <template #prepend><VIcon>mdi-run</VIcon></template>开始跑步
          </VBtn>
        </div>
        </template>

        <VCard variant="outlined" class="mb-4">
          <VCardTitle class="text-subtitle-2 pa-4 pb-0">
            <VIcon color="primary" class="mr-2">mdi-map</VIcon>
            路线预览
          </VCardTitle>
          <VCardText class="pa-4">
            <p class="text-caption text-medium-emphasis mb-2">地图中的路线仅为展示路线生成效果，不等于最终路线</p>
            <div class="map-container rounded-lg overflow-hidden">
              <ClientOnly><AMap :target="selectValue" @update:target="handleUpdate" /></ClientOnly>
            </div>
          </VCardText>
        </VCard>
      </template>
    </VCardText>
  </VCard>
</template>

<style scoped>
.map-container { height: 400px; width: 100%; border: 1px solid rgba(0, 0, 0, 0.12); }
.info-item { min-width: 200px; flex: 1; }
@media (max-width: 600px) { .info-item { min-width: 100%; } }
</style>
