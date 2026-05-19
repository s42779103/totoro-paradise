import type MorningExercisesRequest from '~~/src/types/requestTypes/MorningExercisesRequest'
import type MorningExercisesResponse from '~~/src/types/responseTypes/MorningExercisesResponse'
import encryptRequestContent from '~~/src/utils/encryptRequestContent'

export default defineEventHandler(async (e) => {
  try {
    const body = await readBody<MorningExercisesRequest>(e)
    const encrypted = await encryptRequestContent(body)
    const res = await $fetch<MorningExercisesResponse>('https://app.xtotoro.com/app/platform/recrecord/morningExercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'User-Agent': 'okhttp/4.9.0' },
      body: encrypted,
    })
    console.log('[mornsign/submit] 响应:', JSON.stringify(res))
    return res
  } catch (e) {
    return { message: (e as Error).message }
  }
})
