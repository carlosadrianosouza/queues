/* eslint-disable @typescript-eslint/no-var-requires */
import { getEnv } from '../helpers/getEnv'
import { EnvConfig } from '../@types/env.config'

export const getConfig = (group: string): EnvConfig => {
    
  if(!group){
    throw new Error('Group is not defined!')
  }
  
  return {
    stage: getEnv('STAGE', 'dev') as EnvConfig['stage'],

    request: {
      url: getEnv(`CONSUMER_URL_${group.toLocaleUpperCase()}`),

      token: {
        name: 'X-VOOMP-CREATORS-QUEUE-TOKEN',
        secret: getEnv('TOKEN'),
      },
    },
  }
}
