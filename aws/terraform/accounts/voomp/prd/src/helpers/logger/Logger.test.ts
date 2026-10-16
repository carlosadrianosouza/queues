import { beforeEach, describe, expect, test, vi } from "vitest";
import Logger, { LoggerInstance } from "./Logger";

const sendMock = vi.fn();

class MockLogger implements LoggerInstance {
  async send(level: any, message: string, payload?: any): Promise<void> {
    sendMock(level, message, payload);
  }
}

const message = "message test";
const data = { params: "test" };

describe("#Logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    Logger.loggers = [];
    Logger.setPayload({ RID: "test-rid" });
    Logger.register(new MockLogger());
    Logger.register(new MockLogger());
  });

  test("should have registered the instances as send messages", async () => {
    await Logger.info("message test");
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  test("should have sent the messages, level info", async () => {
    await Logger.info(message, data);

    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock).toHaveBeenCalledWith(
      "info",
      message,
      expect.objectContaining({
        params: "test",
        message,
        level: "info",
      })
    );
  });

  test("should have sent the messages, level error", async () => {
    await Logger.error(message, data);

    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock).toHaveBeenCalledWith(
      "error",
      message,
      expect.objectContaining({
        params: "test",
        message,
        level: "error",
      })
    );
  });

  test("should have sent the messages, level warn", async () => {
    await Logger.warn(message, data);

    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock).toHaveBeenCalledWith(
      "warn",
      message,
      expect.objectContaining({
        params: "test",
        message,
        level: "warn",
      })
    );
  });

  test("should have sent the messages, level debug with app_debug == true", async () => {
    vi.stubEnv("APP_DEBUG", "TRUE");

    await Logger.debug(message, data);

    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock).toHaveBeenCalledWith(
      "debug",
      message,
      expect.objectContaining({
        params: "test",
        message,
        level: "debug",
      })
    );
  });

  test("should not send the messages, level debug with app_debug == false", async () => {
    await Logger.debug(message, data);
    expect(sendMock).toHaveBeenCalledTimes(0);
  });
});
