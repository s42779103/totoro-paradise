import type MorningExercisesRequest from '../types/requestTypes/MorningExercisesRequest'
import type { SignPoint } from '../types/responseTypes/MornSignPaperResponse'
import generateMac from '../utils/generateMac'
import normalRandom from '../utils/normalRandom'

/**
 * 生成早操签到请求体
 * @param offsetRange 允许的偏移范围（米），用于模拟 GPS 抖动
 */
const generateMorningExercisesReq = async ({
  stuNumber,
  phoneNumber,
  signPoint,
  signType,
  offsetRange,
  token,
}: {
  stuNumber: string
  phoneNumber: string
  signPoint: SignPoint
  signType: string
  offsetRange: string
  token: string
}): Promise<MorningExercisesRequest> => {
  // 坐标偏移：1 度 ≈ 111km，offsetRange 单位是米
  const offsetDeg = Number(offsetRange) / 111000
  const longitude = (
    Number(signPoint.longitude) + normalRandom(0, offsetDeg / 3)
  ).toFixed(6)
  const latitude = (
    Number(signPoint.latitude) + normalRandom(0, offsetDeg / 3)
  ).toFixed(6)

  const mac = await generateMac(stuNumber)

  console.log('[MorningReq] 签到点:', signPoint.pointName, '原始坐标:', signPoint.longitude, signPoint.latitude)
  console.log('[MorningReq] 偏移后坐标:', longitude, latitude, 'signType:', signType)

  return {
    stuNumber,
    phoneNumber,
    qrCode: signPoint.qrCode,
    headImage: '',
    baseStation: '',
    longitude,
    latitude,
    phoneInfo: '$CN11/iPhone15,4/17.4.1',
    mac,
    taskId: signPoint.taskId,
    pointId: signPoint.pointId,
    appVersion: '1.2.14',
    signType,
    token,
  }
}

export default generateMorningExercisesReq
