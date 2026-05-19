import type MornSignPaperRequest from '~~/src/types/requestTypes/MornSignPaperRequest'
import type MornSignPaperResponse from '~~/src/types/responseTypes/MornSignPaperResponse'
import encryptRequestContent from '~~/src/utils/encryptRequestContent'

export default defineEventHandler(async (e) => {
  try {
    const body = await readBody<MornSignPaperRequest>(e)
    console.log('[mornsign/getPaper] 请求:', JSON.stringify({ ...body, token: body.token?.substring(0, 20) + '...' }))
    const encrypted = await encryptRequestContent(body)
    const paper = await $fetch<MornSignPaperResponse>('https://app.xtotoro.com/app/mornsign/getMornSignPaper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'User-Agent': 'okhttp/4.9.0' },
      body: encrypted,
    })
    console.log('[mornsign/getPaper] 响应:', JSON.stringify(paper))
    if (paper.code === '0') {
      return { message: '获取签到任务成功', paper }
    }
    return { message: paper.message || '获取签到任务失败', paper: null }
  } catch (error) {
    console.log('[mornsign/getPaper]', error)
    return { message: '龙猫服务器错误', paper: null }
  }
})
