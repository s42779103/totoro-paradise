<script setup lang="ts">
import { useNow } from '@vueuse/core'
import TotoroApiWrapper from '~/src/wrappers/TotoroApiWrapper'
import generateRunReq from '~~/src/controllers/generateSunRunExercisesReq'
import generateRoute from '~~/src/utils/generateRoute'

const now = useNow({ interval: 1000 })
const startTime = ref(new Date())
const endTime = ref(new Date())
const timePassed = computed(() => Number(now.value) - Number(startTime.value))
const needTime = ref(0)
const running = ref(false)
const runned = computed(() => !running.value && !!needTime.value)
const currentPosition = ref<{ longitude: number; latitude: number } | null>(null)

const sunRunPaper = useSunRunPaper()
const session = useSession()
const routeObj = useRoute()
const { params, query } = routeObj as { params: { route: string }; query: { type?: string } }
const { route } = params
const isFreeRun = computed(() => query.type === 'free')
const runType = computed(() => (isFreeRun.value ? '1' : '0'))

const routeList = computed(() => sunRunPaper.value?.runPointList || [])
const target = computed(() => routeList.value.find((r) => r.pointId === route)!)

const useCustomTime = ref(false)
const customDate = ref(new Date().toISOString().substring(0, 10))
const customTime = ref('08:00')
const targetStartTime = computed<Date | undefined>(() => {
  if (!useCustomTime.value) return undefined
  const d = new Date(`${customDate.value}T${customTime.value}:00`)
  return isNaN(d.getTime()) ? undefined : d
})

const handleRun = async () => {
  const paper = sunRunPaper.value!
  const runMode = isFreeRun.value ? '自由跑' : '阳光跑'
  console.log(`[Run] 开始${runMode}, pointName:`, target.value.pointName, 'runType:', runType.value,
    targetStartTime.value ? `指定时间: ${targetStartTime.value}` : '使用当前时间')

  console.log('[Run] 步骤1: 生成跑步请求...')
  const { req, endTime: targetTime } = await generateRunReq({
    distance: paper.mileage,
    routeId: target.value.pointId,
    taskId: target.value.taskId,
    token: session.value.token,
    schoolId: session.value.schoolId,
    stuNumber: session.value.stuNumber,
    phoneNumber: session.value.phoneNumber,
    minTime: paper.minTime,
    maxTime: paper.maxTime,
    runType: runType.value,
    targetStartTime: targetStartTime.value,
  })
  console.log('[Run] 步骤1: 请求生成完毕, km:', req.km, 'avgSpeed:', req.avgSpeed,
    'startTime:', req.startTime, 'endTime:', req.endTime)
  startTime.value = now.value
  needTime.value = Number(targetTime) - Number(now.value)
  endTime.value = targetTime
  running.value = true

  console.log('[Run] 步骤2: 通知服务器开始跑步...')
  await TotoroApiWrapper.getRunBegin({
    campusId: session.value.campusId,
    schoolId: session.value.schoolId,
    stuNumber: session.value.stuNumber,
    token: session.value.token,
  })

  console.log('[Run] 步骤3: 生成模拟轨迹...')
  const runRoute = generateRoute(paper.mileage, target.value)
  console.log('[Run] 步骤3: 轨迹生成完毕, 点数:', runRoute.mockRoute.length, '距离:', runRoute.distance)

  console.log('[Run] 步骤4: 提交跑步记录...')
  const res = await TotoroApiWrapper.sunRunExercises(req)

  console.log('[Run] 步骤5: 提交轨迹详情...')
  await TotoroApiWrapper.sunRunExercisesDetail({
    pointList: runRoute.mockRoute,
    scantronId: res.scantronId,
    breq: {
      campusId: session.value.campusId,
      schoolId: session.value.schoolId,
      stuNumber: session.value.stuNumber,
      token: session.value.token,
    },
  })

  console.log('[Run] 跑步完成! scantronId:', (res as any).scantronId)
  const lastPoint = runRoute.mockRoute[runRoute.mockRoute.length - 1]
  currentPosition.value = lastPoint
  startTime.value = new Date(Number(now.value) - Number(needTime.value))
  running.value = false
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (running.value && !runned.value) {
    e.preventDefault()
  }
}
</script>
<template>
  <VCard class="pa-4">
    <VCardTitle class="text-h6 mb-4">
      {{ isFreeRun ? '自由跑' : '阳光跑' }} · 跑步确认
    </VCardTitle>
    <VCardText>
      <VCard variant="outlined" class="mb-6">
        <VCardTitle class="text-subtitle-2 pa-4 pb-0">
          <VIcon color="primary" class="mr-2">mdi-map-marker</VIcon>
          路线信息
        </VCardTitle>
        <VCardText class="pa-4">
          <div class="d-flex align-center mb-2">
            <span class="text-body-1">已选择路径：</span>
            <span class="text-body-1 font-weight-medium ml-1">{{ target.pointName }}</span>
          </div>
          <p class="text-body-2 text-medium-emphasis">
            请再次确认是否开跑。
          </p>
        </VCardText>
      </VCard>

      <VCard variant="outlined" class="mb-6">
        <VCardTitle class="text-subtitle-2 pa-4 pb-0">
          <VIcon color="primary" class="mr-2">mdi-timer</VIcon>
          跑步状态
        </VCardTitle>
        <VCardText class="pa-4">
          <template v-if="!runned && !running">
            <VBtn color="primary" size="large" block class="mb-4" @click="handleRun">
              <VIcon class="mr-2">mdi-run</VIcon>
              确认开跑
            </VBtn>
          </template>
          <template v-if="running">
            <div class="d-flex justify-space-between align-center mb-4">
              <div>
                <div class="text-caption text-medium-emphasis mb-1">已用时间</div>
                <div class="text-h6">{{ timePassed }}/{{ needTime }}</div>
              </div>
            </div>
            <div v-if="timePassed && needTime" class="d-flex align-center mb-4">
              <VProgressCircular :model-value="(timePassed / needTime) * 100" size="48" width="6" color="primary" class="mr-4" />
              <div>
                <div class="text-caption text-medium-emphasis mb-1">完成进度</div>
                <div class="text-h6">{{ Math.ceil((timePassed / needTime) * 100) }}%</div>
              </div>
            </div>
            <div class="text-caption text-medium-emphasis">
              <VIcon size="small" class="mr-1">mdi-information</VIcon>
              请保持页面打开，直到跑步完成
            </div>
          </template>
          <VAlert v-if="runned" color="success" variant="tonal" class="mt-4">
            <template #prepend><VIcon>mdi-check-circle</VIcon></template>
            <div class="text-body-1 font-weight-medium">跑步完成</div>
            <div class="text-body-2">请前往 App 查看记录</div>
          </VAlert>
        </VCardText>
      </VCard>

      <VCard variant="outlined" class="mb-6">
        <VCardTitle class="text-subtitle-2 pa-4 pb-0">
          <VIcon color="primary" class="mr-2">mdi-map</VIcon>
          实时路线
        </VCardTitle>
        <VCardText class="pa-4">
          <div class="map-container rounded-lg overflow-hidden">
            <ClientOnly>
              <AMap :target="route" :running="running" :current-position="currentPosition" :run-point-list="routeList" :mileage="sunRunPaper?.mileage" @update:target="(t: string) => {}" />
            </ClientOnly>
          </div>
        </VCardText>
      </VCard>
    </VCardText>
  </VCard>
</template>

<style scoped>
.map-container {
  height: 400px;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
