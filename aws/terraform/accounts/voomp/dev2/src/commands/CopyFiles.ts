import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { getHostConfigByAppName } from '../helpers/getHostConfigByAppName'

const copyFileSync = (origin: string, dist: string) => {
  fs.mkdirSync(path.dirname(dist), { recursive: true })
  fs.copyFileSync(origin, dist)
  
  console.log(`Copy ${origin} => ${dist}`)
}


const builderCommand = async (yargs: any) => {
  const stage = yargs.argv.stage || null
  const appName = yargs.argv.appName || null

  if (!stage || !appName) {
    throw new Error('stage and appName are required')
  }

  const baseDir = path.join(__dirname, '../../')
  const distDir = path.join(baseDir, 'dist', appName)

  const { hostConfigFile } = getHostConfigByAppName(stage, appName)
  
  if(!hostConfigFile) {
    throw new Error('No host.json config file found')
  }

  copyFileSync(
    path.join(baseDir, 'package.json'),
    path.join(distDir, 'package.json')
  )

  copyFileSync(
    path.join(baseDir, hostConfigFile),
    path.join(distDir, 'host.json')
  )

  copyFileSync(
    path.join(baseDir, 'app.' + stage + '.config.yml'),
    path.join(distDir, 'app.' + stage + '.config.yml')
  )
}

yargs(hideBin(process.argv))
  .command('$0', '', builderCommand)
  .option('stage', { type: 'string', describe: 'dev|hml|prd|test', demand: true })
  .option('appName', { type: 'string', describe: 'function app name', demand: true })
  .demandCommand(1)
  .parse()
