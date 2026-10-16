import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";

interface JWTHeader {
  kid: string;
  alg: string;
  typ: string;
}

interface JWTPayload {
  tid: string;
  appid: string;
  exp: number;
  [key: string]: any;
}

interface JWKSKey {
  kid: string;
  [key: string]: any;
}

interface JWKSResponse {
  keys: JWKSKey[];
}

async function validateJWT(token: string): Promise<JWTPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const header: JWTHeader = JSON.parse(
    Buffer.from(parts[0], "base64").toString()
  );
  const payload: JWTPayload = JSON.parse(
    Buffer.from(parts[1], "base64").toString()
  );

  console.log("Header:", header);
  console.log("Payload:", payload);

  const expectedTenantId = process.env.TENANT_ID;

  if (payload.tid !== expectedTenantId) {
    console.log(`Falha na validação do TID!`);
    throw new Error("Invalid tenant ID");
  }
  console.log("Sucesso na validação do Tenant ID!");

  const expectedAppId = process.env.CLIENT_ID;

  if (payload.appid !== expectedAppId) {
    console.log(`Falha na validação do AppId!`);
    throw new Error("Invalid app ID");
  }
  console.log("Sucesso na validação do AppId");

  const jwksUrl = "https://login.microsoftonline.com/common/discovery/keys";
  console.log("Fetching JWKS from:", jwksUrl);

  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.status}`);
  }

  const jwks: JWKSResponse = await response.json();
  console.log(`JWKS contains ${jwks.keys.length} keys`);

  const kidExists = jwks.keys.some((key) => key.kid === header.kid);
  if (!kidExists) {
    console.log(
      `Falha na validação do KID! KID ${header.kid} não encontrado na JWKS`
    );
    throw new Error("Invalid KID");
  }
  console.log("Sucesso na validação do KID!");

  const currentTimeUnix = Math.floor(new Date().getTime() / 1000);
  console.log(`Current time (unix): ${currentTimeUnix}`);
  console.log(`Token exp (unix): ${payload.exp}`);

  if (payload.exp <= currentTimeUnix) {
    console.log(
      `Token expirado. Current: ${currentTimeUnix}, Exp: ${payload.exp}`
    );
    throw new Error("Token expired");
  }
  console.log("Sucesso na validação da validade do token!");

  return payload;
}

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  try {
    const token = event.authorizationToken;

    if (!token) throw new Error("No token provided");

    const payload = await validateJWT(token);

    // Para Service Principal, usar appid como identificador principal
    const principalId = payload.appid || payload.sub || payload.oid || "authenticated-user";
    console.log("Using principalId:", principalId);

    const policy = generatePolicy("Allow", event.methodArn, principalId);
    console.log("Generated policy:", JSON.stringify(policy, null, 2));
    console.log("Original methodArn:", event.methodArn);

    return policy;
  } catch (error) {
    console.error("Token validation failed:", error);

    return generatePolicy("Deny", event.methodArn, "unauthorized");
  }
};

function generatePolicy(
  effect: "Allow" | "Deny",
  resource: string,
  principalId: string
): APIGatewayAuthorizerResult {
  // Extract API ID and region from the resource ARN to create a wildcard policy
  const resourceParts = resource.split('/');
  const apiArn = resourceParts[0]; // arn:aws:execute-api:region:account:api-id
  const wildcardResource = `${apiArn}/*/*`;
  
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: wildcardResource,
        },
      ],
    },
  };
}
