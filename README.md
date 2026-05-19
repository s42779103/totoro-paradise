# Totoro-paradise

Fuck `totoro school`, without MITM.

The name is netaed from `nekopara`.

## 功能

- **阳光跑** — 路线选择 + 模拟轨迹 + 自动提交打卡（支持自选时间）
- **早操签到** — 签到点选择 + 自动提交（QR 码由服务端下发）
- **自由跑** — 同阳光跑，`runType=2`
- **凭据持久化** — 登录态 localStorage 保存，刷新不丢
- **自动打卡** — Vercel Cron 定时早操签到（需配环境变量，接口已留）
- **设置页** — 查看/复制 token，清除登录

## How to build

```bash
pnpm i
pnpm build
```

## How to run

```bash
pnpm start
```

## How to develop

```bash
pnpm dev
```

## Vercel Cron 自动打卡

1. 部署到 Vercel
2. 在 Dashboard 设置环境变量：
   - `TOTORO_TOKEN` — 从 Settings 页面复制
   - `TOTORO_STU_NUMBER`
   - `TOTORO_SCHOOL_ID`
   - `TOTORO_CAMPUS_ID`
   - `TOTORO_PHONE_NUMBER`
3. `vercel.json` 中的 crons 会在每天指定时间触发早操签到

当前 cron 端点为骨架，需后续实现具体逻辑。

## License

[AGPL-3.0](LICENSE)
