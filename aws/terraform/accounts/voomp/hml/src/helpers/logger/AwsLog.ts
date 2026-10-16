import { Level, Payload, LoggerInstance } from "./Logger";
import { DateTime } from "luxon";
import { CustomError } from "../../exceptions/CustomError";

export default class AwsLog implements LoggerInstance {
  public constructor() {}

  private sanitizeMessage(message: string): string {
    return message
      .replace(/\r?\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  }

  public async send(
    level: Level,
    message: string,
    payload?: Payload
  ): Promise<void> {
    const sanitizedMessage = this.sanitizeMessage(message);
    const log = {
      timestamp: this.getDate(),
      ...payload,
      message: sanitizedMessage,
      level,
    };

    switch (level) {
      case "info":
        console.info(JSON.stringify(log));
        break;

      case "error":
        console.error(JSON.stringify(log));
        break;

      case "warn":
        console.warn(JSON.stringify(log));
        break;

      case "debug":
        console.debug(JSON.stringify(log));
        break;

      default:
        throw new CustomError(`Invalid method ${level}`, log);
    }
  }

  public getDate(): string {
    return DateTime.now().toISO();
  }
}