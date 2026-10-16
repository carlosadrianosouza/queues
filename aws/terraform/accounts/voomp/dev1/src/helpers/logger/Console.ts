import * as colors from "colors/safe";
import { merge } from "lodash";
import { DateTime } from "luxon";
import { Level, Payload, LoggerInstance } from "./Logger";

interface Options {
  show: {
    color?: boolean;
    date?: boolean;
    level?: boolean;
    payload?: boolean;
  };
}

export default class Console implements LoggerInstance {
  protected options: Options = {
    show: {
      date: true,
      level: true,
      color: true,
      payload: true,
    },
  };

  public constructor(options?: Options) {
    this.options = merge(this.options, options);
  }

  public async send(
    level: Level,
    message: string,
    payload?: Payload
  ): Promise<void> {
    const prefix = this.createPrefix(level);
    const payloadMerged = { timestamp: DateTime.now().toISO(), ...payload };
    const logMessage = prefix + this.color(message, level);

    if (this.options.show.payload) {
      console.log(logMessage, payloadMerged);
    } else {
      console.log(logMessage);
    }
  }

  protected createPrefix(level?: Level): string {
    const prefix: string[] = [];

    // date
    if (this.options.show.date) {
      prefix.push(this.getDate());
    }

    // append levek with color
    if (this.options.show.level && level) {
      prefix.push(this.getLevel(level));
    }

    return prefix.length ? prefix.join(" ") + " " : "";
  }

  protected getDate(): string {
    return DateTime.now().toISO();
  }

  protected getLevel(level: Level): string {
    return this.color(`[${level.toUpperCase()}]`, level);
  }

  protected color(message: string, level?: Level): string {
    if (this.options.show.color && level) {
      switch (level) {
        case "info":
          return colors.green(message);
        case "error":
          return colors.red(message);
        case "debug":
          return colors.blue(message);
        case "warn":
          return colors.yellow(message);
      }
    }

    return message;
  }
}
