import type BaseResponse from './BaseResponse'

export default interface MornSignPaperResponse extends BaseResponse {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  dayNeedSignCount: string
  dayCompSignCount: string
  minTimeInterval: string
  offsetRange: string
  qrCode: string
  signType: string
  signPointList: SignPoint[]
}

export interface SignPoint {
  taskId: string
  pointId: string
  pointName: string
  longitude: string
  latitude: string
  qrCode: string
}
