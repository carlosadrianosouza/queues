import Logger from "../helpers/logger";
import { Payload } from "../helpers/logger/Logger";

export class CustomError extends Error {
  constructor(message: string, payload?: Payload) {
    super(message);
    (async () => {
      await Logger.error(message, payload);
    })();
  }
}
