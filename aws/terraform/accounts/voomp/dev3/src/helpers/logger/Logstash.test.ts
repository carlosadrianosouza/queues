import { beforeEach, describe, expect, test, vi } from "vitest";

const refMocked = vi.fn();
const sendMocked = vi.fn();
const unrefMocked = vi.fn();
const socketMock = {
  ref: refMocked,
  send: sendMocked,
  unref: unrefMocked,
};
const createSocketMocked = vi.fn(() => socketMock);

vi.mock("dgram", () => ({
  createSocket: createSocketMocked,
}));

const { default: Logstash } = await import("./Logstash");

const port = 1234;
const host = "logstash";
const message = "message test";

describe("#Logger/Logstash", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should have created udp4 socket", () => {
    new Logstash(host, port);

    expect(createSocketMocked).toHaveBeenCalledTimes(1);
    expect(createSocketMocked).toHaveBeenCalledWith("udp4");
  });

  test("should have sent message", async () => {
    const logstash = new Logstash(host, port);

    await logstash.send("info", message, { param1: 1, param2: 2 });

    expect(refMocked).toHaveBeenCalledTimes(1);
    expect(sendMocked).toHaveBeenCalledTimes(1);
  });

  test("should have received the parameters when sending from socket", async () => {
    const logstash = new Logstash(host, port);

    await logstash.send("info", message, { param1: 1, param2: 2 });

    expect(sendMocked).toHaveBeenCalledTimes(1);
    const [buffer, offset, length, portArg, hostArg] = sendMocked.mock.calls[0];

    expect(buffer).toBeInstanceOf(Buffer);
    expect(offset).toBe(0);
    expect(length).toBeGreaterThan(0);
    expect(portArg).toBe(port);
    expect(hostArg).toBe(host);
  });

  test("should have received json message", async () => {
    const bufferSpy = vi.spyOn(Buffer, "from");
    const logstash = new Logstash(host, port);

    await logstash.send("info", message, { param1: 1, param2: 2 });

    expect(bufferSpy).toHaveBeenCalledWith(expect.stringContaining(message));
  });
});
