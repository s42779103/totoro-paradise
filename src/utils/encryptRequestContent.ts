import rsaKeys from '../data/rsaKeys'

const CHUNK_SIZE = 117 // RSA 1024 + PKCS1Padding 每段最大 117 字节

const encryptRequestContent = async (req: Record<string, any>): Promise<string> => {
  const reqStr = JSON.stringify(req)

  if (typeof window === 'undefined') {
    // 服务端：Node.js 原生 crypto，分段加密
    const crypto = await import('node:crypto')
    const data = Buffer.from(reqStr, 'utf-8')
    const chunks: Buffer[] = []
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const slice = data.subarray(i, i + CHUNK_SIZE)
      chunks.push(
        crypto.publicEncrypt(
          { key: rsaKeys.publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
          slice,
        ),
      )
    }
    return Buffer.concat(chunks).toString('base64')
  }

  // 客户端：nodeRSA 浏览器库（内部自带分段）
  const { default: NodeRSA } = await import('./nodeRSA')
  const rsa = new NodeRSA(rsaKeys.publicKey)
  rsa.setOptions({ encryptionScheme: 'pkcs1' })
  return rsa.encrypt(reqStr, 'base64')
}
export default encryptRequestContent
