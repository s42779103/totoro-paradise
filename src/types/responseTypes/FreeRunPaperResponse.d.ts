import type RunPoint from '../RunPoint'
import type BaseResponse from './BaseResponse'

export default interface FreeRunPaperResponse extends BaseResponse {
  faceFlag: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  offsetRange: string
  mileage: string
  fitDegree: string
  minSpeed: string
  maxSpeed: string
  minTime: string
  maxTime: string
  runPointList: RunPoint[]
}
