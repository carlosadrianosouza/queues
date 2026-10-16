import { CustomError } from '../exceptions/CustomError'

export const getEnv = (varName: string, default_value?: any): string => {
  if (!process.env[varName]) {
    if (default_value) {
      return default_value
    }

    throw new CustomError(`Environment variable '${varName}' is not defined!`, {
      environment: process.env,
    })
  }

  return String(process.env[varName])
}