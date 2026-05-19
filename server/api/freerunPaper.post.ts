import type BasicRequest from '~~/src/types/requestTypes/BasicRequest'
import type FreeRunPaperResponse from '~~/src/types/responseTypes/FreeRunPaperResponse'
import encryptRequestContent from '~~/src/utils/encryptRequestContent'

export default defineEventHandler(async (e) => {
  try {
    const body = await readBody<BasicRequest>(e)
    const encrypted = await encryptRequestContent(body)
    const paper = await $fetch<FreeRunPaperResponse>('https://app.xtotoro.com/app/sunrun/getFreerunPaper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'User-Agent': 'okhttp/4.9.0' },
      body: encrypted,
    })
    console.log('[freerunPaper] 响应:', JSON.stringify(paper))
    return { message: '获取自由跑任务成功', paper }
  } catch (error) {
    console.log('[freerunPaper]', error)
    return { message: '龙猫服务器错误', paper: null }
  }
})
