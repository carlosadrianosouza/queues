import { test, expect } from 'vitest'
import { getFnApp } from './getFnApp'

test('should return the correct app name for a valid input', () => {
  expect(getFnApp('fn-voomp-dev-low-eu-1')).toBe('low-1')
  expect(getFnApp('fn-voomp-dev-medium-eu-1')).toBe('medium-1')
  expect(getFnApp('fn-voomp-dev-high-eu-1')).toBe('high-1')

  expect(getFnApp('fn-voomp-hml-low-eu-1')).toBe('low-1')
  expect(getFnApp('fn-voomp-hml-medium-eu-1')).toBe('medium-1')
  expect(getFnApp('fn-voomp-hml-high-eu-1')).toBe('high-1')

  expect(getFnApp('fn-voomp-prd-low-bs-1')).toBe('low-1')
  expect(getFnApp('fn-voomp-prd-medium-bs-1')).toBe('medium-1')
  expect(getFnApp('fn-voomp-prd-high-bs-1')).toBe('high-1')
})

test('should throw an error for an invalid app name', () => {
  const appName = 'invalidAppName'
  expect(() => {
    getFnApp(appName)
  }).toThrowError('Invalid app name')
})