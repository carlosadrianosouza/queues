import express, { Router, Request, Response } from "express";
import { MessageConsumer } from "./MessageConsumer";
import { getConfig } from "./config/config";
import Logger from "./helpers/logger";
import AwsLog from "./helpers/logger/AwsLog";
import * as dotenv from "dotenv";

dotenv.config({ path: `${__dirname}/../.env.local` });

const app = express();
const route = Router();

route.get("/", async (req: Request, res: Response) => {
  res.json({ status: "Server running!" });
});

route.post("/api/trigger/:group", async (req: Request, res: Response) => {
  const context: any = { log: console };
  const { group } = req.params;

  Logger.register(new AwsLog());

  try {
    console.log("Triggering...", new Date().toISOString());
    triggerAsync(group, req.body, context);
    res.json({ success: true, status: "Trigger initiated successfully." });
    console.log("Triggered...", new Date().toISOString());
  } catch (error: any) {
    console.error(`Error processing trigger: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

route.post("/queue/:queueName", async (req: Request, res: Response) => {
  console.log(`=== NEW REQUEST ===`);
  console.log(`Queue: ${req.params.queueName}`);
  console.log(`Body:`, req.body);

  try {
    const { queueName } = req.params;
    const group = getGroupFromQueueName(queueName);

    console.log(`Mapped group: ${group}`);

    res.json({
      success: true,
      message: "Message sent to queue successfully",
      queueName: `sqs-${queueName}`,
      group: group,
    });

    // Processa em background com tratamento de erro 1843 1855
    const context: any = {
      log: console,
      functionName: `fn-${queueName}`,
    };

    console.log(`Processing in background...`);
    triggerAsync(group, req.body, context).catch((error) => {
      console.error(`Background processing error:`, error.message);
    });
  } catch (error: any) {
    console.error(`Error in queue endpoint:`, error);
    res.status(500).json({
      error: "Failed to send message to queue",
      details: error.message,
    });
  }
});

function getGroupFromQueueName(queueName: string): string {
  if (queueName.startsWith("back-")) return "BACK";
  if (queueName.startsWith("play-")) return "PLAY";
  if (queueName.startsWith("messages-")) return "MESSAGES";
  if (queueName.startsWith("gateway-")) return "GATEWAY";
  return "BACK";
}

async function triggerAsync(group: string, requestBody: any, context: any) {
  return new Promise((resolve, reject) => {
    setImmediate(async () => {
      try {
        console.log(`Getting config for group: ${group}`);
        const config = getConfig(group);
        console.log(`Config URL: ${config.request.url}`);

        const response = await new MessageConsumer(
          config,
          requestBody,
          context,
          { approximateReceiveCount: "1" }
        ).request();
        console.log(`Background processing completed successfully`);
        resolve(response);
      } catch (error) {
        console.error(`triggerAsync error:`, error);
        reject(error);
      }
    });
  });
}

app.use(express.json());
app.use(route);

app.listen(3333, () => {
  console.log("Server running on http://localhost:3333");
  console.log(
    "API Gateway endpoint: POST http://localhost:3333/queue/{queueName}"
  );
});
