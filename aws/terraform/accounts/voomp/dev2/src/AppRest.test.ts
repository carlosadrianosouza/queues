import { afterEach, describe, expect, test, vi } from "vitest";
import { validateStatus } from "./helpers/api/config";

// Mock Logger primeiro
vi.mock("./helpers/logger", () => ({
  default: {
    setPayload: vi.fn(),
    register: vi.fn(),
    info: vi.fn().mockResolvedValue(undefined),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock API
const apiRequestMock = vi.fn(() => Promise.resolve({ data: {}, status: 200 }));
vi.mock("./helpers/api", () => ({
  api: {
    request: apiRequestMock,
  },
}));

// Import após mocks
const { getConfig } = await import("./config/config");
const { MessageConsumer } = await import("./MessageConsumer");

const group = "test";
const message = { id: 1 };
const context = { 
  log: console, 
  functionName: "fn-abc",
  awsRequestId: "test-request-id"
} as any;

describe("#MessageConsumer", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should return environment CONSUMER_URL", () => {
    const rest = new MessageConsumer(getConfig(group), message, context, {
      approximateReceiveCount: "1",
    });
    const url = `${getConfig(group).request.url}?from=${context.functionName}`;

    expect(rest.getURL()).equals(url);
  });

  test("should return request body", () => {
    const rest = new MessageConsumer(getConfig(group), message, context, {
      approximateReceiveCount: "1",
    });
    expect(rest.getPayload()).equals(message);
  });

  test("should return request headers", () => {
    const rest = new MessageConsumer(getConfig(group), message, context, {
      approximateReceiveCount: "1",
    });
    const { name: tokenName, secret: tokenSecret } =
      getConfig(group).request.token;

    expect(rest.getHeaders()["Content-Type"]).equals("application/json");
    expect(rest.getHeaders()[tokenName]).equals(tokenSecret);
  });

  test("should run api request", async () => {
    const { name: tokenName, secret: tokenSecret } =
      getConfig(group).request.token;

    const consumer = new MessageConsumer(getConfig(group), message, context, {
      approximateReceiveCount: "1",
    });

    await consumer.request();

    expect(apiRequestMock).toHaveBeenCalledWith({
      url: `${getConfig(group).request.url}?from=${context.functionName}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        RID: "",
        [tokenName]: tokenSecret,
      },
      data: message,
      validateStatus,
    });
  });
});