/* eslint-disable @typescript-eslint/no-var-requires */
import { merge } from "lodash";
import { v4 as uuid } from "uuid";

export type Action = string;
export type Level = "info" | "error" | "warn" | "debug";

export interface Payload {
  RID?: string;
  [key: string]: any;
}

export interface LoggerInstance {
  send(level: Level, message: string, payload?: Payload): Promise<void>;
}

export default abstract class Logger {
  public static payload: Required<Payload>;
  public static loggers: LoggerInstance[] = [];

  public static setPayload(payload: Payload) {
    const version = process.env.APP_VERSION ?? "unknown";

    Logger.payload = {
      ...payload,
      version,
      RID: payload.RID || uuid(),
    };
  }

  public static register(logger: LoggerInstance) {
    Logger.loggers.push(logger);
  }

  public static async send(
    level: Level,
    message: string,
    payload?: Payload
  ): Promise<void> {
    const payloadMerged = merge({ ...Logger.payload, message, level }, payload);

    await Promise.allSettled(
      Logger.loggers.map((logger) => {
        return logger.send(level, message, payloadMerged);
      })
    );
  }

  public static async info(message: string, payload?: Payload) {
    await Logger.send("info", message, payload);
  }

  public static async error(message: string, payload?: Payload) {
    await Logger.send("error", message, payload);
  }

  public static async warn(message: string, payload?: Payload) {
    await Logger.send("warn", message, payload);
  }

  public static async debug(message: string, payload?: Payload) {
    if (String(process.env.APP_DEBUG).toLocaleUpperCase() === "TRUE") {
      await Logger.send("debug", message, payload);
    }
  }
}