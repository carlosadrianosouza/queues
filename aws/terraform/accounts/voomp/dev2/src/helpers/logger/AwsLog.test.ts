import { beforeEach, describe, expect, test, vi } from "vitest";
import { DateTime } from "luxon";
import AwsLog from "./AwsLog";
import { Level } from "./Logger";

const message = "message test";
const datetime = DateTime.now().toISO();
const payload = { params: "test", timestamp: datetime, message };

const sendMessage = async (level: Level) => {
  const log = new AwsLog();
  await log.send(level, message, payload);
};

describe("#Logger/AwsLog", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("should send message with level info", async () => {
    const logSpy = vi.spyOn(console, "info");
    await sendMessage("info");
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain('"level":"info"');
    expect(logSpy.mock.calls[0][0]).toContain('"message":"message test"');
  });

  test("should send message with level warn", async () => {
    const warnSpy = vi.spyOn(console, "warn");
    await sendMessage("warn");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('"level":"warn"');
  });

  test("should send message with level error", async () => {
    const errorSpy = vi.spyOn(console, "error");
    await sendMessage("error");
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toContain('"level":"error"');
  });

  test("should send message with level debug", async () => {
    const debugSpy = vi.spyOn(console, "debug");
    await sendMessage("debug");
    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy.mock.calls[0][0]).toContain('"level":"debug"');
  });
});
