import ky from 'ky';
import type { Point } from '../types/RunPoint';
import type BasicRequest from '../types/requestTypes/BasicRequest';
import type GetSchoolMonthByTermRequest from '../types/requestTypes/GetSchoolMonthByTermRequest';
import type GetSchoolTermRequest from '../types/requestTypes/GetSchoolTermRequest';
import type GetSunRunArchDetailRequest from '../types/requestTypes/GetSunRunArchDetailRequest';
import type GetSunRunArchRequest from '../types/requestTypes/GetSunRunArchRequest';
import type SunRunExercisesDetailRequest from '../types/requestTypes/SunRunExercisesDetailRequest';
import type SunRunExercisesRequest from '../types/requestTypes/SunRunExercisesRequest';
import type MornSignPaperRequest from '../types/requestTypes/MornSignPaperRequest';
import type MorningExercisesRequest from '../types/requestTypes/MorningExercisesRequest';
import type UpdateAppVersionRequest from '../types/requestTypes/UpdateAppVersionRequest';
import type FreeRunPaperResponse from '../types/responseTypes/FreeRunPaperResponse';
import type GetAppAdResponse from '../types/responseTypes/GetAppAdResponse';
import type GetAppFrontPageResponse from '../types/responseTypes/GetAppFrontPageResponse';
import type GetAppNoticeResponse from '../types/responseTypes/GetAppNoticeResponse';
import type GetAppSloganResponse from '../types/responseTypes/GetAppSloganResponse';
import type GetLesseeServerResponse from '../types/responseTypes/GetLesseeServerResponse';
import type GetRegisterUrlResponse from '../types/responseTypes/GetRegisterUrlResponse';
import type GetRunBeginResponse from '../types/responseTypes/GetRunBeginResponse';
import type GetSchoolMonthByTermResponse from '../types/responseTypes/GetSchoolMonthByTermResponse';
import type GetSchoolTermResponse from '../types/responseTypes/GetSchoolTermResponse';
import type GetSunRunArchDetailResponse from '../types/responseTypes/GetSunRunArchDetailResponse';
import type GetSunRunArchResponse from '../types/responseTypes/GetSunRunArchResponse';
import type GetSunRunPaperResponse from '../types/responseTypes/GetSunRunPaperResponse';
import type LoginResponse from '../types/responseTypes/LoginResponse';
import type MornSignPaperResponse from '../types/responseTypes/MornSignPaperResponse';
import type MorningExercisesResponse from '../types/responseTypes/MorningExercisesResponse';
import type SunRunExercisesDetailResponse from '../types/responseTypes/SunRunExercisesDetailResponse';
import type SunRunExercisesResponse from '../types/responseTypes/SunRunExercisesResponse';
import type UpdateAppVersionResponse from '../types/responseTypes/UpdateAppVersionResponse';
import encryptRequestContent from '../utils/encryptRequestContent';

const LOG_PREFIX = '[TotoroAPI]'

const TotoroApiWrapper = {
  client: ky.create({
    prefixUrl: '/api/totoro',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      Host: 'app.xtotoro.com',
      Connection: 'Keep-Alive',
      'Accept-Encoding': 'gzip',
      'User-Agent': 'okhttp/4.9.0',
    },
  }),

  async getRegisterUrl() {
    console.log(`${LOG_PREFIX} ▶ getRegisterUrl`)
    const res = await this.client.post('platform/serverlist/getRegisterUrl').json<GetRegisterUrlResponse>();
    console.log(`${LOG_PREFIX} ✓ getRegisterUrl`, res)
    return res
  },

  async getLesseeServer(code: string) {
    console.log(`${LOG_PREFIX} ▶ getLesseeServer`)
    const res = await this.client
      .post('platform/serverlist/getLesseeServer', { body: await encryptRequestContent({ code }) })
      .json<GetLesseeServerResponse>();
    console.log(`${LOG_PREFIX} ✓ getLesseeServer code=${res.code}`)
    return res
  },

  async getAppAd(code: string) {
    console.log(`${LOG_PREFIX} ▶ getAppAd`)
    const res = await this.client
      .post('platform/serverlist/getAppAd', { body: await encryptRequestContent({ code }) })
      .json<GetAppAdResponse>();
    console.log(`${LOG_PREFIX} ✓ getAppAd code=${res.code}`)
    return res
  },

  async login({ token }: { token: string }) {
    console.log(`${LOG_PREFIX} ▶ login token=${token.substring(0, 20)}...`)
    const res = await this.client
      .post('platform/login/login', {
        body: await encryptRequestContent({ code: '', latitude: '', loginWay: '', longitude: '', password: '', phoneNumber: '', token }),
      })
      .json<LoginResponse>();
    console.log(`${LOG_PREFIX} ✓ login code=${res.code} stuNumber=${res.stuNumber}`)
    return res
  },

  async getAppSlogan(req: BasicRequest): Promise<GetAppSloganResponse> {
    console.log(`${LOG_PREFIX} ▶ getAppSlogan`)
    return this.client.post('platform/serverlist/getAppSlogan', { body: await encryptRequestContent(req) }).json();
  },

  async getAppFrontPage(req: BasicRequest): Promise<GetAppFrontPageResponse> {
    console.log(`${LOG_PREFIX} ▶ getAppFrontPage`)
    const res = await this.client.post('platform/login/getAppFrontPage', { body: await encryptRequestContent(req) }).json();
    console.log(`${LOG_PREFIX} ✓ getAppFrontPage code=${res.code}`)
    return res
  },

  async updateAppVersion(breq: BasicRequest): Promise<UpdateAppVersionResponse> {
    console.log(`${LOG_PREFIX} ▶ updateAppVersion`)
    const req: UpdateAppVersionRequest & Record<string, string | number | null> = {
      campusId: breq.campusId, schoolId: breq.schoolId, token: breq.token,
      version: '1.2.14', deviceType: '2', stuNumber: breq.stuNumber,
    };
    return this.client.post('platform/serverlist/updateAppVersion', { body: await encryptRequestContent(req) }).json();
  },

  async getAppNotice(req: BasicRequest): Promise<GetAppNoticeResponse> {
    console.log(`${LOG_PREFIX} ▶ getAppNotice`)
    return this.client.post('platform/serverlist/getAppNotice', { body: await encryptRequestContent({ ...req, version: '' }) }).json();
  },

  async getSunRunPaper(req: BasicRequest): Promise<GetSunRunPaperResponse> {
    console.log(`${LOG_PREFIX} ▶ getSunRunPaper`)
    const res = await this.client.post('sunrun/getSunrunPaper', { body: await encryptRequestContent(req) }).json<GetSunRunPaperResponse>();
    console.log(`${LOG_PREFIX} ✓ getSunRunPaper code=${res.code} ifHasRun=${res.ifHasRun} routes=${res.runPointList?.length}`)
    return res
  },

  async getFreerunPaper(req: BasicRequest): Promise<FreeRunPaperResponse> {
    console.log(`${LOG_PREFIX} ▶ getFreerunPaper`)
    const res = await this.client.post('sunrun/getFreerunPaper', { body: await encryptRequestContent(req) }).json<FreeRunPaperResponse>();
    console.log(`${LOG_PREFIX} ✓ getFreerunPaper code=${res.code}`)
    return res
  },

  async getMornSignPaper(req: MornSignPaperRequest): Promise<MornSignPaperResponse> {
    console.log(`${LOG_PREFIX} ▶ getMornSignPaper`)
    const res = await this.client.post('mornsign/getMornSignPaper', { body: await encryptRequestContent(req) }).json<MornSignPaperResponse>();
    console.log(`${LOG_PREFIX} ✓ getMornSignPaper code=${res.code} signType=${res.signType} completed=${res.dayCompSignCount}/${res.dayNeedSignCount} points=${res.signPointList?.length}`)
    return res
  },

  async morningExercises(req: MorningExercisesRequest): Promise<MorningExercisesResponse> {
    console.log(`${LOG_PREFIX} ▶ morningExercises pointId=${req.pointId} signType=${req.signType}`)
    const res = await this.client.post('platform/recrecord/morningExercises', { body: await encryptRequestContent(req) }).json<MorningExercisesResponse>();
    console.log(`${LOG_PREFIX} ✓ morningExercises code=${res.code} message=${res.message}`)
    return res
  },

  async getRunBegin(req: BasicRequest) {
    console.log(`${LOG_PREFIX} ▶ getRunBegin`)
    const res = await this.client.post('sunrun/getRunBegin', { body: await encryptRequestContent(req) }).json<GetRunBeginResponse>();
    console.log(`${LOG_PREFIX} ✓ getRunBegin code=${res.code}`)
    return res
  },

  async sunRunExercises(req: SunRunExercisesRequest): Promise<SunRunExercisesResponse> {
    console.log(`${LOG_PREFIX} ▶ sunRunExercises km=${req.km} avgSpeed=${req.avgSpeed} runType=${req.runType}`)
    const res = await this.client.post('platform/recrecord/sunRunExercises', { body: await encryptRequestContent(req) }).json<SunRunExercisesResponse>();
    console.log(`${LOG_PREFIX} ✓ sunRunExercises code=${res.code} scantronId=${(res as any).scantronId}`)
    return res
  },

  async sunRunExercisesDetail({
    pointList, scantronId, breq,
  }: { pointList: Point[]; scantronId: string; breq: BasicRequest }) {
    console.log(`${LOG_PREFIX} ▶ sunRunExercisesDetail scantronId=${scantronId} points=${pointList.length}`)
    const req: SunRunExercisesDetailRequest = { pointList, scantronId, stuNumber: breq.stuNumber, token: breq.token };
    const res = await this.client.post('platform/recrecord/sunRunExercisesDetail', { json: req }).json<SunRunExercisesDetailResponse>();
    console.log(`${LOG_PREFIX} ✓ sunRunExercisesDetail code=${res.code}`)
    return res
  },

  async getSchoolTerm(breq: BasicRequest): Promise<GetSchoolTermResponse> {
    const req: GetSchoolTermRequest & Record<string, string | number | null> = { schoolId: breq.schoolId, token: breq.token };
    return this.client.post('platform/course/getSchoolTerm', { body: await encryptRequestContent(req) }).json();
  },

  async getSchoolMonthByTerm(termId: string, breq: BasicRequest): Promise<GetSchoolMonthByTermResponse> {
    const req: GetSchoolMonthByTermRequest & Record<string, string | number | null> = { schoolId: breq.schoolId, stuNumber: breq.stuNumber, token: breq.token, termId };
    return this.client.post('platform/course/getSchoolMonthByTerm', { body: await encryptRequestContent(req) }).json();
  },

  async getSunRunArch(monthId: string, termId: string, breq: BasicRequest): Promise<GetSunRunArchResponse> {
    const req: GetSunRunArchRequest & Record<string, string | number | null> = { ...breq, runType: '0', monthId, termId };
    return this.client.post('sunrun/getSunrunArch', { body: await encryptRequestContent(req) }).json();
  },

  async getSunRunArchDetail(scoreId: string, breq: BasicRequest): Promise<GetSunRunArchDetailResponse> {
    const req: GetSunRunArchDetailRequest & Record<string, string> = { scoreId, token: breq.token };
    return this.client.post('sunrun/getSunrunArchDetail', { body: await encryptRequestContent(req) }).json();
  },
};

export default TotoroApiWrapper;
