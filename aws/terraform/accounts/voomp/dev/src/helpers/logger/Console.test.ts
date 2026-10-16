import { beforeEach, describe, expect, test, vi } from "vitest";
import Console from "./Console";
import { Level } from "./Logger";
import { DateTime } from "luxon";

const message = "message test";
const datetime = DateTime.now().toISO();
const payload = { params: "test" };

vi.mock("luxon", () => ({
  DateTime: {
    now: vi.fn(() => ({
      toISO: vi.fn(() => datetime),
    })),
  },
}));

vi.mock("colors/safe", () => ({
  red: vi.fn((m) => m),
  blue: vi.fn((m) => m),
  grey: vi.fn((m) => m),
  green: vi.fn((m) => m),
  yellow: vi.fn((m) => m),
}));

const sendMessage = async (options?: any, level: Level = "info") => {
  await new Console(options).send(level, message, payload);
};

global.console.log = vi.fn();

describe("#Logger/Console", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should have sent message with payload", async () => {
    const logSpy = vi.spyOn(console, "log");
    await sendMessage();

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(datetime),
      expect.objectContaining({
        timestamp: datetime,
        params: "test",
      })
    );
  });

  test("should have sent message and payload only", async () => {
    const logSpy = vi.spyOn(console, "log");
    await sendMessage({ show: { date: false, level: false } });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const [firstArg, secondArg] = logSpy.mock.calls[0];
    expect(firstArg).toContain(message);
    expect(secondArg).toEqual({
      timestamp: datetime,
      params: "test",
    });
  });

  test("should have sent a message without displaying the payload", async () => {
    const logSpy = vi.spyOn(console, "log");
    await sendMessage({ show: { payload: false } });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(datetime));
  });

  test("should have sent a message without displaying the date", async () => {
    const logSpy = vi.spyOn(console, "log");
    await sendMessage({ show: { date: false } });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("[INFO]"),
      expect.objectContaining({
        timestamp: datetime,
        params: "test",
      })
    );
  });

  test("should have sent a message without displaying the level", async () => {
    const logSpy = vi.spyOn(console, "log");
    await sendMessage({ show: { level: false } });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(datetime),
      expect.objectContaining({
        timestamp: datetime,
        params: "test",
      })
    );
  });

  test("should have sent a message without displaying the color", async () => {
    const logSpy = vi.spyOn(console, "log");
    await sendMessage({ show: { color: false } });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(datetime),
      expect.objectContaining({
        timestamp: datetime,
        params: "test",
      })
    );
  });

  test("should have sent a message with color/info", async () => {
    const logSpy = vi.spyOn(console, "log");
    await sendMessage({ show: { payload: false } }, "info");

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(datetime));
  });

  test("should have sent a message with color/error", async () => {
    const logSpy = vi.spyOn(console, "log");
    await sendMessage({ show: { payload: false } }, "error");

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(datetime));
  });

  test("should have sent a message with color/debug", async () => {
    const logSpy = vi.spyOn(console, "log");
    await sendMessage({ show: { payload: false } }, "debug");

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(datetime));
  });

  test("should have sent a message with color/warn", async () => {
    const logSpy = vi.spyOn(console, "log");
    await sendMessage({ show: { payload: false } }, "warn");

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(datetime));
  });
});
