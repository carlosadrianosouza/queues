import { beforeEach, describe, expect, test, vi } from 'vitest'
import { getEnv } from './getEnv'

describe('#helpers/getEnv', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubEnv('TEST', 'abc')
  })

  test('should return throw when env is not defined', () => {
    expect(() => {
      getEnv('TEST2')
    }).toThrow('Environment variable \'TEST2\' is not defined!')
  })

  test('should return string when getEnv is called', () => {
    expect(getEnv('TEST')).toBe(process.env.TEST)
  })

  test('should return string when getEnv is called ignoring default value', () => {
    expect(getEnv('TEST', '123')).toBe(process.env.TEST)
  })

  test('should return default value when getEnv is called', () => {
    expect(getEnv('TEST2', 'zxy')).toBe('zxy')
  })
})