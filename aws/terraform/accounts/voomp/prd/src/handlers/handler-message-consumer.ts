import { SQSEvent, Context } from "aws-lambda";
import { getConfig } from "../config/config";
import { MessageConsumer } from "../MessageConsumer";
import { Payload } from "../helpers/logger/Logger";
import { getGroupByEventSource } from "../helpers/getGroupByEventSource";
import Logger from "../helpers/logger";

export const handler = async (event: SQSEvent, context: Context) => {
  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body);
      const group = getGroupByEventSource(record.eventSourceARN);
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
      console.log("Error:", error);
      await Logger.error(`Error processing message: ${error.message}`, {
        error: error.stack,
        record: record.messageId,
      });
      throw error;
    }
  }
};
