// import { app } from '@azure/functions'
// import { handlerMessageConsumer } from '../handlers/handler-message-consumer'
// import { getHostConfigByAppName } from './getHostConfigByAppName'

// export const startFnApp = (stage: string, appName: string) => {
//   const { queues } = getHostConfigByAppName(stage, appName)

//   for (const queue of queues) {
//     app.serviceBusQueue(`fn-${queue}`, {
//       queueName: `sbq-${queue}`,
//       connection: 'SB_CONNECTION',
//       handler: handlerMessageConsumer,
//     })
//   }
// }
