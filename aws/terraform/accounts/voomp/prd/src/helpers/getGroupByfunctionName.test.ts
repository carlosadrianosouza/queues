import { test, expect } from 'vitest'
import { getGroupByfunctionName } from './getGroupByfunctionName'

test('should return the group name from a valid function name', () => {
  const functionName = 'fn-groupName-abc123'
  const result = getGroupByfunctionName(functionName)
  expect(result).toBe('groupName')
})

test('should throw an error for an invalid function name', () => {
  const functionName = 'invalidFunctionName'
  expect(() => {
    getGroupByfunctionName(functionName)
  }).toThrowError('Nome da função invalidFunctionName não é um nome de função válido')
})