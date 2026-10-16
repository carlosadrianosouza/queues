export const getFnApp = (appName: string): string => {
  const regexAppName = new RegExp('^fn-voomp-(dev|hml|prd)-(low|medium|high)-[a-z]{2}-(\\d+)$', 'g')

  if (!regexAppName.test(appName)) {
    throw new Error('Invalid app name')
  }
  
  const app = appName.split('-')

  return `${app[3]}-${app[5]}`
}
