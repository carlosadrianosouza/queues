import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    unstubEnvs: true,
    restoreMocks: true,
    environment: 'node',
    coverage: {
      provider: 'istanbul',
    },
    setupFiles: [
      __dirname + '/tests/setup.ts',
    ],
  },
})