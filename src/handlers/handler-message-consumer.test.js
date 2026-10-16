/* eslint-disable no-undef */
import { beforeEach, describe, expect, test, vi } from "vitest";
import { validateStatus } from "../helpers/api/config";

// Mock Logger
vi.mock("../helpers/logger", () => ({
  default: {
    register: vi.fn(),
    info: vi.fn().mockResolvedValue(undefined),
    error: vi.fn().mockResolvedValue(undefined),
    setPayload: vi.fn(),
  },
}));

// Mock AwsLog
vi.mock("../helpers/logger/AwsLog", () => ({
  default: class MockAwsLog {
    constructor() {}
  }
}));

// Mock API
const apiRequestMock = vi.fn(() => Promise.resolve({ data: {}, status: 200 }));
vi.mock("../helpers/api", () => ({
  api: {
    request: apiRequestMock,
  },
}));

// Import após mocks
const { handler } = await import("./handler-message-consumer");

const sqsEvent = {
  Records: [
    {
      body: JSON.stringify({ id: 1 }),
      attributes: {
        ApproximateReceiveCount: "1",
      },
      messageId: "test-message-id",
    },
  ],
};

const context = {
  functionName: "fn-test-queue",
  awsRequestId: "test-request-id",
};

describe("#functions/handler-rest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should run handler with success", async () => {
    await handler(sqsEvent, context);

    expect(apiRequestMock).toHaveBeenCalledWith({
      data: { id: 1 },
      headers: {
        "Content-Type": "application/json",
        "X-VOOMP-CREATORS-QUEUE-TOKEN": process.env.TOKEN,
        RID: "",
      },
      url: `${process.env.CONSUMER_URL_TEST}?from=${context.functionName}`,
      method: "POST",
      validateStatus,
    });
  });

  test("should return throw when functionName is invalid", async () => {
    const invalidContext = {
      ...context,
      functionName: "invalid-name",
    };

    await expect(handler(sqsEvent, invalidContext)).rejects.toThrow(
      "Nome da função invalid-name não é um nome de função válido"
    );
  });
});