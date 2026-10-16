import { api } from "./helpers/api";
import Logger from "./helpers/logger";
import { Context } from "aws-lambda";
import { Payload } from "./helpers/logger/Logger";
import { EnvConfig } from "./@types/env.config";
import { validateStatus } from "./helpers/api/config";

export class MessageConsumer {
  private config: EnvConfig;
  private payload: Payload;
  private context: Context;
  private retryContext: { approximateReceiveCount: string };

  constructor(
    config: EnvConfig,
    payload: Payload,
    context: Context,
    retryContext: { approximateReceiveCount: string }
  ) {
    this.config = config;
    this.payload = payload;
    this.context = context;
    this.retryContext = retryContext;

    this.setPayload();

    (async () => {
      await Logger.info("Application started");
    })();
  }

  public async request(): Promise<void> {
    // TODO: Remover após validar deploy - teste de atualização de código na Lambda
    console.log("deploy");

    console.log("Request:", {
      url: this.getURL(),
      method: this.getMethod(),
      headers: this.getHeaders(),
      data: this.getPayload(),
      validateStatus,
    });

    const result = await api.request({
      url: this.getURL(),
      method: this.getMethod(),
      headers: this.getHeaders(),
      data: this.getPayload(),
      validateStatus,
    });

    console.log("Request result:", result);

    return;
  }

  public getURL(): string {
    return this.config.request.url + "?from=" + this.context.functionName;
  }

  public getHeaders(): { [x: string]: string } {
    const { name, secret } = this.config.request.token;

    return {
      "Content-Type": "application/json",
      RID: this.getPayload().RID || "",
      [name]: secret,
    };
  }

  public getMethod(): string {
    return "POST";
  }

  public getPayload(): Payload {
    return this.payload;
  }

  private setPayload(): void {
    const payload = { ...this.payload };
    payload.args = "********";

    const { awsRequestId, functionName } = this.context;

    Logger.setPayload({
      url: this.config.request.url,
      method: this.getMethod(),
      tokenHeader: {
        key: this.config.request.token.name.substring(0, 10) + "********",
        value: this.config.request.token.secret.substring(0, 10) + "********",
      },
      payload,
      stage: this.config.stage,
      invocationId: awsRequestId,
      functionName,
      retryContext: this.retryContext,
    });
  }
}
