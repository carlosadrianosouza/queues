import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIGatewayTokenAuthorizerEvent } from "aws-lambda";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const { handler } = await import("./authorizer");

describe("Authorizer", () => {
  const validHeader = { kid: "test-kid", alg: "RS256", typ: "JWT" };
  const validPayload = {
    tid: "a50e7b76-8ea5-492c-bf17-97d652fc3ce9",
    appid: "2a44bc21-1f0a-4639-874e-bc48af3a566f",
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  
  const validToken = `${Buffer.from(JSON.stringify(validHeader)).toString('base64')}.${Buffer.from(JSON.stringify(validPayload)).toString('base64')}.signature`;
  
  const mockEvent: APIGatewayTokenAuthorizerEvent = {
    type: "TOKEN",
    authorizationToken: validToken,
    methodArn: "arn:aws:execute-api:us-east-1:123456789012:abcdef123/test/GET/request"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TENANT_ID = "a50e7b76-8ea5-492c-bf17-97d652fc3ce9";
    process.env.CLIENT_ID = "2a44bc21-1f0a-4639-874e-bc48af3a566f";
  });

  it("should allow access with valid token", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        keys: [{ kid: "test-kid" }]
      })
    });

    const result = await handler(mockEvent);

    expect(result.principalId).toBe("2a44bc21-1f0a-4639-874e-bc48af3a566f");
    expect(result.policyDocument.Statement[0].Effect).toBe("Allow");
    expect((result.policyDocument.Statement[0] as any).Resource).toBe("arn:aws:execute-api:us-east-1:123456789012:abcdef123/*/*");
  });

  it("should deny access when token is missing", async () => {
    const eventWithoutToken = {
      ...mockEvent,
      authorizationToken: ""
    };

    const result = await handler(eventWithoutToken);

    expect(result.principalId).toBe("unauthorized");
    expect(result.policyDocument.Statement[0].Effect).toBe("Deny");
  });

  it("should deny access with invalid tenant ID", async () => {
    const invalidPayload = { ...validPayload, tid: "wrong-tenant" };
    const invalidToken = `${Buffer.from(JSON.stringify(validHeader)).toString('base64')}.${Buffer.from(JSON.stringify(invalidPayload)).toString('base64')}.signature`;
    
    const eventWithInvalidTenant = {
      ...mockEvent,
      authorizationToken: invalidToken
    };

    const result = await handler(eventWithInvalidTenant);

    expect(result.principalId).toBe("unauthorized");
    expect(result.policyDocument.Statement[0].Effect).toBe("Deny");
  });

  it("should deny access with invalid app ID", async () => {
    const invalidPayload = { ...validPayload, appid: "wrong-app-id" };
    const invalidToken = `${Buffer.from(JSON.stringify(validHeader)).toString('base64')}.${Buffer.from(JSON.stringify(invalidPayload)).toString('base64')}.signature`;
    
    const eventWithInvalidAppId = {
      ...mockEvent,
      authorizationToken: invalidToken
    };

    const result = await handler(eventWithInvalidAppId);

    expect(result.principalId).toBe("unauthorized");
    expect(result.policyDocument.Statement[0].Effect).toBe("Deny");
  });

  it("should deny access with expired token", async () => {
    const expiredPayload = { ...validPayload, exp: Math.floor(Date.now() / 1000) - 3600 };
    const expiredToken = `${Buffer.from(JSON.stringify(validHeader)).toString('base64')}.${Buffer.from(JSON.stringify(expiredPayload)).toString('base64')}.signature`;
    
    const eventWithExpiredToken = {
      ...mockEvent,
      authorizationToken: expiredToken
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        keys: [{ kid: "test-kid" }]
      })
    });

    const result = await handler(eventWithExpiredToken);

    expect(result.principalId).toBe("unauthorized");
    expect(result.policyDocument.Statement[0].Effect).toBe("Deny");
  });

  it("should deny access with invalid KID", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        keys: [{ kid: "different-kid" }]
      })
    });

    const result = await handler(mockEvent);

    expect(result.principalId).toBe("unauthorized");
    expect(result.policyDocument.Statement[0].Effect).toBe("Deny");
  });

  it("should deny access when JWKS fetch fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500
    });

    const result = await handler(mockEvent);

    expect(result.principalId).toBe("unauthorized");
    expect(result.policyDocument.Statement[0].Effect).toBe("Deny");
  });


});