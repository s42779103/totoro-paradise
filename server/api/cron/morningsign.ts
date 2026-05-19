// TODO: Vercel Cron 早操自动打卡端点
// 后续实现，当前仅留接口骨架。
//
// 计划流程：
// 1. 从 process.env 读取 TOTORO_TOKEN / TOTORO_STU_NUMBER / TOTORO_SCHOOL_ID / TOTORO_CAMPUS_ID / TOTORO_PHONE_NUMBER
// 2. 用环境变量中的 token 调用 getMornSignPaper 获取签到任务
// 3. 从 signPointList 中选取当日未签到的签到点（dayCompSignCount < dayNeedSignCount）
// 4. 生成签到请求（使用 signPoint.qrCode + 模拟 GPS 坐标）
// 5. 调用 morningExercises 提交签到
// 6. 返回 JSON 结果（成功/失败/Token 过期）
//
// 注意：需要直接调 app.xtotoro.com（绕过 /api/totoro 代理），
// 因为 Cron 运行在 serverless 环境，没有浏览器 Cookie 上下文。

export default defineEventHandler(async () => {
  return {
    success: false,
    message: 'Cron endpoint not yet implemented',
    hint: 'Set TOTORO_TOKEN env var and implement the flow above',
  }
})
