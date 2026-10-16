import { vi } from 'vitest'

vi.mock('../../src/helpers/logger/Logger', async () => {
  const actual: any = await vi.importActual('../../src/helpers/logger/Logger')

  return {
    default: {
      ...actual.default,
      setPayload: vi.fn(),
      register: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  }
})


