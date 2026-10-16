import { loadYAML } from './loadYaml'
import { AppConfig } from '../@types/app.config'

const getConfig = (stage: string) => {
  const configPath = __dirname + '/../../app.' + stage + '.config.yml'
  const config = loadYAML(configPath) as AppConfig
  return config.parameters[0].default
}

export const getHostConfigByAppName = (stage: string, appName: string) => {
  const hosts = getConfig(stage)
  const host = hosts.find((host) => host.appName === appName)

  if (!host) {
    throw new Error(`No host found for ${appName}`)
  }

  return host
}

export const getAllHostConfigs = (stage: string) => {
  return getConfig(stage).map((app) => ({
    functionType: app.functionType,
    appName: app.appName,
    queues: app.queues,
  }))
}


