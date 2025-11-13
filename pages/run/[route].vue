<script setup lang="ts">
import { useNow } from '@vueuse/core';
import { onMounted, onUnmounted } from 'vue';
import TotoroApiWrapper from '~/src/wrappers/TotoroApiWrapper';
import generateRunReq from '~~/src/controllers/generateSunRunExercisesReq';
import generateRoute from '~~/src/utils/generateRoute';

const now = useNow({ interval: 1000 });
const startTime = ref(new Date());
const endTime = ref(new Date());
const timePassed = computed(() => Number(now.value) - Number(startTime.value));
const needTime = ref(0);
const running = ref(false);
const sunRunPaper = useSunRunPaper();
const { params } = useRoute();
const session = useSession();
const { route } = params as { route: string };
const runned = computed(() => !running.value && !!needTime.value);
const target = computed(() => sunRunPaper.value.runPointList.find((r) => r.pointId === route)!);
const currentPosition = ref<{ longitude: number; latitude: number } | null>(null);

const handleRun = async () => {
  const { req, endTime: targetTime } = await generateRunReq({
    distance: sunRunPaper.value.mileage,
    routeId: target.value.pointId,
    taskId: target.value.taskId,
    token: session.value.token,
    schoolId: session.value.schoolId,
    stuNumber: session.value.stuNumber,
    phoneNumber: session.value.phoneNumber,
    minTime: sunRunPaper.value.minTime,
    maxTime: sunRunPaper.value.maxTime,
  });
  startTime.value = now.value;
  needTime.value = Number(targetTime) - Number(now.value);
  endTime.value = targetTime;
  running.value = true;

  await TotoroApiWrapper.getRunBegin({
    campusId: session.value.campusId,
    schoolId: session.value.schoolId,
    stuNumber: session.value.stuNumber,
    token: session.value.token,
  });

  const runRoute = generateRoute(sunRunPaper.value.mileage, target.value);
  const res = await TotoroApiWrapper.sunRunExercises(req);

  // 发送路线详情
  await TotoroApiWrapper.sunRunExercisesDetail({
    pointList: runRoute.mockRoute,
    scantronId: res.scantronId,
    breq: {
      campusId: session.value.campusId,
      schoolId: session.value.schoolId,
      stuNumber: session.value.stuNumber,
      token: session.value.token,
    },
  });

  // 立即完成：将当前位置设为路线最后一点并标记为完成
  const lastPoint = runRoute.mockRoute[runRoute.mockRoute.length - 1];
  currentPosition.value = lastPoint;
  // 把 startTime 调整为已用完 needTime，使 timePassed === needTime，UI 显示为完成
  startTime.value = new Date(Number(now.value) - Number(needTime.value));
  running.value = false;
  // 不再创建 interval / timeout
};
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (running.value && !runned.value) {
    e.preventDefault();
  }
}
</script>
<template>
  <VCard class="pa-4">
    <VCardTitle class="text-h6 mb-4">跑步确认</VCardTitle>
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
            请再次确认是否开跑。开跑时会向龙猫服务器发送请求，所以请尽量不要在开跑后取消。
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
              <VProgressCircular
                :model-value="(timePassed / needTime) * 100"
                size="48"
                width="6"
                color="primary"
                class="mr-4"
              />
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
            <template #prepend>
              <VIcon>mdi-check-circle</VIcon>
            </template>
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
              <AMap
                :target="route"
                :running="running"
                :current-position="currentPosition"
                @update:target="handleUpdate"
              />
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
