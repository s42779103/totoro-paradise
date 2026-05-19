import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type SunRunExercisesRequest from '../types/requestTypes/SunRunExercisesRequest';
import generateMac from '../utils/generateMac';
import normalRandom from '../utils/normalRandom';

/**
 * @param minTime 最短用时，以分钟计
 * @param maxTime 最长用时，以分钟计
 * @param runType 跑步类型: "0"=全部, "1"=阳光跑, "2"=自由跑
 * @param targetStartTime 可选，指定跑步开始时间，不传则用当前时间
 */
const generateRunReq = async ({
  distance,
  routeId,
  taskId,
  token,
  schoolId,
  stuNumber,
  phoneNumber,
  headImage,
  minTime,
  maxTime,
  runType,
  targetStartTime,
}: {
  distance: string
  routeId: string
  taskId: string
  token: string
  schoolId: string
  stuNumber: string
  phoneNumber: string
  headImage: string
  minTime: string
  maxTime: string
  runType?: string
  targetStartTime?: Date
}) => {
  const minSecond = Number(minTime) * 60;
  const maxSecond = Number(maxTime) * 60;
  const avgSecond = minSecond + maxSecond / 2;
  const waitSecond = Math.floor(
    normalRandom(minSecond + maxSecond / 2, (maxSecond - avgSecond) / 3),
  );
  const startTime = targetStartTime || new Date();
  const endTime = new Date(Number(startTime) + waitSecond * 1000);
  const distanceNum = Number(distance);
  // 配速 = 总用时(秒) / 60 / 里程(公里)
  const avgSpeed = (waitSecond / 60 / distanceNum).toFixed(2);
  const mac = await generateMac(stuNumber);
  console.log('[RunReq] 生成参数: waitSecond:', waitSecond, 'startTime:', startTime, 'endTime:', endTime);
  console.log('[RunReq] distance:', distance, 'avgSpeed:', avgSpeed, 'runType:', runType || '0');
  const req: SunRunExercisesRequest = {
    LocalSubmitReason: '',
    avgSpeed,
    baseStation: '',
    consume: String(Math.floor(distanceNum * 67.34)),
    endTime: format(endTime, 'HH:mm:ss'),
    evaluateDate: format(endTime, 'yyyy-MM-dd HH:mm:ss'),
    fitDegree: '1',
    flag: '1',
    headImage,
    ifLocalSubmit: '0',
    km: distance,
    mac,
    phoneInfo: '$CN11/iPhone15,4/17.4.1',
    phoneNumber,
    pointList: '',
    routeId,
    runType: runType || '0',
    sensorString: '',
    startTime: format(startTime, 'HH:mm:ss'),
    steps: `${1000 + Math.floor(Math.random() * 1000)}`,
    submitDate: format(startTime, 'yyyy-MM-dd'),
    stuNumber,
    taskId,
    token,
    usedTime: String(waitSecond),
    uuid: uuidv4(),
    version: '1.2.14',
    warnFlag: '0',
    warnType: '',
    faceData: '',
  };
  return { req, endTime };
};

export default generateRunReq;
