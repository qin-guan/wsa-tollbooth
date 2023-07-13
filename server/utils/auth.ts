// Will be polyfilled, alls good
import { randomInt, scryptSync, timingSafeEqual } from 'node:crypto'
import { Buffer } from 'node:buffer'

export function createVfnToken() {
  return randomInt(0, 1000000).toString().padStart(6, '0')
}

export function createTokenHash(token: string, email: string) {
  return scryptSync(token, email, 64).toString('base64')
}

export function compareHash(token: string, email: string, hash: string) {
  return timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(createTokenHash(token, email)),
  )
}
