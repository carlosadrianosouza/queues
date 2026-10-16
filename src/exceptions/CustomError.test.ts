import { beforeEach, describe, expect, test, vi } from 'vitest'
import { CustomError } from './CustomError'
import Logger from '../helpers/logger'

const message = 'message error',
  payload = { paylod: true }

describe('#CustomError', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('should have sent message level error', async () => {
    const logSpy = vi.spyOn(Logger, 'error')

    expect(() => {
      throw new CustomError(message, payload)
    }).toThrow(message)

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenNthCalledWith(1, message, payload)
  })
})