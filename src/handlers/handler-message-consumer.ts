import { SQSEvent, Context } from "aws-lambda";
import { getConfig } from "../config/config";
import { MessageConsumer } from "../MessageConsumer";
import { Payload } from "../helpers/logger/Logger";
import { getGroupByfunctionName } from "../helpers/getGroupByfunctionName";
import Logger from "../helpers/logger";
import AwsLog from "../helpers/logger/AwsLog";

export const handler = async (event: SQSEvent, context: Context) => {
  //Logger.register(new AwsLog());

  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body);
      const group = getGroupByfunctionName(context.functionName);
      const retryContext = {
        approximateReceiveCount: record.attributes?.ApproximateReceiveCount,
      };

      const consumer = new MessageConsumer(
        getConfig(group),
        message as Payload,
        context,
        retryContext
      );

      await consumer.request();
    } catch (error: any) {
      await Logger.error(`Error processing message: ${error.message}`, {
        error: error.stack,
        record: record.messageId,
      });
      throw error;
    }
  }
};
