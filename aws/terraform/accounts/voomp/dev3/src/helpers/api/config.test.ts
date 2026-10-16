import { afterEach, describe, expect, test, vi } from 'vitest'
import { configRequest, configResponseError, configResponseSuccess } from './config'
import Logger from '../logger'

vi.mock('../logger')

describe('#api/interceptors', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('should run configRequest', () => {
    const spyLogger = vi.spyOn(Logger, 'info')

    configRequest({} as any)
    expect(spyLogger).toHaveBeenNthCalledWith(1, 'Request started')
  })

  test('should run configResponseSuccess', async () => {
    const responseSuccess: any = {
      status: 200,
      statusText: '',
    }

    const spyLogger = vi.spyOn(Logger, 'info')
    const response = await configResponseSuccess(responseSuccess)

    expect(spyLogger).toHaveBeenNthCalledWith(1, 'Request completed successfully', {
      finishedInSeconds: 0,
      response: responseSuccess,
    })

    expect(response.data).toMatchObject(responseSuccess.data)
  })

  test('should run configResponseError', () => {
    const responseError: any = { code: 404, message: 'Request ended with error' }
    expect(() => configResponseError(responseError))
      .rejects
      .toThrow(responseError.message)
  })
})

