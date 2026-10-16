/* eslint-disable @typescript-eslint/no-empty-function */
import path from 'path'
import yargs from 'yargs'
import replace from 'replace-in-file'
import { hideBin } from 'yargs/helpers'

const builderCommand = async (yargs: any) => {
  const appName = yargs.argv.appName || null

  if (!appName) {
    throw new Error('appName are required')
  }

  const replaceInFile = '#{{fn-app-name}}#'
  const baseDir = path.join(__dirname, '../../')

  const result = replace.sync({
    files: path.join(baseDir, 'dist', appName, 'src', 'functions', '*.js'),
    from: replaceInFile,
    to: appName,
  })

  console.log('Replaced in files:', result)
}

yargs(hideBin(process.argv))
  .command('$0', '', builderCommand)
  .option('appName', { type: 'string', describe: 'function app name', demand: true })
  .demandCommand(1)
  .parse()
