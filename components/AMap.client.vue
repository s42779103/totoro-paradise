<script setup lang="ts">
import AMapLoader from '@amap/amap-jsapi-loader';
import generateRoute from '~/src/utils/generateRoute';
import { useAppConfig } from '#app';

const props = defineProps<{
  target: string
  running?: boolean
  currentPosition?: { longitude: number; latitude: number } | null
  runPointList?: { pointId: string; pointName: string; longitude: string; latitude: string; pointList: { longitude: string; latitude: string }[] }[]
  mileage?: string
}>();
const emit = defineEmits<{ (e: 'update:target', target: string): void }>();
const containerRef = ref<HTMLDivElement | null>(null);
const sunrunPaper = useSunRunPaper();
const AMap = shallowRef();
const map = shallowRef();
const routes = computed(() => props.runPointList || sunrunPaper.value?.runPointList || []);
const routeMileage = computed(() => props.mileage || sunrunPaper.value?.mileage || '0');
const currentPolyline = ref<any>(null);
const currentMarker = ref<any>(null);

const genPolylineAry = () => {
  const target = routes.value.find((route) => route.pointId === props.target);
  if (!target) return [];
  return [
    new AMap.value.Polyline({
      path: [
        generateRoute(routeMileage.value, target).mockRoute.map(
      ({ longitude, latitude }) => new AMap.value.LngLat(Number(longitude), Number(latitude)),
        ),
      ],
      strokeColor: '#FF0000',
      lineJoin: 'round',
      strokeWeight: 2,
      strokeOpacity: 0.3,
      showDir: true,
      lineStyle: 'dashed',
    }),
    new AMap.value.Polyline({
      path: [
        target.pointList.map(
          ({ longitude, latitude }) => new AMap.value.LngLat(Number(longitude), Number(latitude)),
        ),
      ],
      strokeColor: '#00FF00',
      lineJoin: 'round',
      strokeWeight: 4,
      strokeOpacity: 0.5,
      showDir: true,
    }),
  ];
};

const updateCurrentPosition = () => {
  if (!props.running || !props.currentPosition || !map.value) return;

  const position: [number, number] = [Number(props.currentPosition.longitude), Number(props.currentPosition.latitude)];
  map.value.setCenter(position);

  // 更新当前位置标记
  if (currentPolyline.value) {
    map.value.remove(currentPolyline.value);
  }
  if (currentMarker.value) {
    map.value.remove(currentMarker.value);
  }

  const target = routes.value.find((route) => route.pointId === props.target);
  if (!target) return;

  const runRoute = generateRoute(routeMileage.value, target);
  const currentIndex = runRoute.mockRoute.findIndex(
    point => point.longitude === props.currentPosition?.longitude && point.latitude === props.currentPosition?.latitude
  );

  if (currentIndex === -1) return;

  // 添加当前位置标记
  currentMarker.value = new AMap.value.Marker({
    position: position,
    icon: new AMap.value.Icon({
      size: new AMap.value.Size(25, 34),
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
      imageSize: new AMap.value.Size(25, 34),
      imageOffset: new AMap.value.Pixel(-13, -30),
    }),
    offset: new AMap.value.Pixel(-13, -30),
    zIndex: 100,
  });
  map.value.add(currentMarker.value);

  // 添加已跑路线
  currentPolyline.value = new AMap.value.Polyline({
    path: [
      runRoute.mockRoute.slice(0, currentIndex + 1).map(
        ({ longitude, latitude }) => new AMap.value.LngLat(Number(longitude), Number(latitude)),
      ),
    ],
    strokeColor: '#1976D2',
    lineJoin: 'round',
    strokeWeight: 4,
    strokeOpacity: 0.8,
    showDir: true,
    lineStyle: 'solid',
  });
  map.value.add(currentPolyline.value);
};

const updateLine = () => {
  if (!map.value && !routes.value) return;
  map.value.clearMap();
  map.value.add(genPolylineAry());
  routes.value.forEach((route) => {
    const { pointName, pointId } = route;
    const marker = new AMap.value.Text({
      text: pointName,
      value: pointId,
      anchor: 'center',
      cursor: 'pointer',
      angle: 0,
      position: [route.longitude, route.latitude],
      style: {
        'font-family': '"Roboto", "Helvetica", "Arial", "sans-serif"',
        'background-color': '#fff',
        'padding': '4px 8px',
        'border-radius': '4px',
        'box-shadow': '0 2px 4px rgba(0,0,0,0.1)',
      },
    });
    marker.on('click', (event: { target: { _originOpts: { value: string } } }) => {
      emit('update:target', event.target._originOpts.value);
    });
    map.value.add(marker);
  });
  const target = routes.value.find((route) => route.pointId === props.target);
  if (!target) return [];
  const lonlat = [target.longitude, target.latitude];
  map.value.setCenter(lonlat);
  map.value.setZoom(17);
};

watch(
  () => props.target,
  () => {
    if (!routes.value.length) return;
    if (!map.value) return;
    updateLine();
  },
);

watch([routes, map], () => {
  if (!routes.value.length) return;
  const lonlat = getCenter(routes.value);
  if (!map.value) return;
  map.value.setCenter([lonlat.lon, lonlat.lat]);
  map.value.setZoom(14);
  updateLine();
});

const appConfig = useAppConfig();

watch(
  () => containerRef.value,
  async () => {
    if (!containerRef.value) return;
    const AMapLoaded = await AMapLoader.load({
      key: appConfig.amapApiKey, // 从配置文件中读取key
      version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    });
    AMap.value = AMapLoaded;
    map.value = new AMap.value.Map(containerRef.value);
  },
);
</script>
<template><div id="mapContainer" ref="containerRef" class="h-full w-full" /></template>
