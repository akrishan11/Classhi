import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const USERS_TABLE = process.env.USERS_TABLE!;

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

interface JwtAuthorizerContext {
  jwt?: {
    claims?: Record<string, string>;
  };
}

interface UserRow {
  userId: string;
  email: string;
  balance?: number;
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const ctx = event.requestContext as typeof event.requestContext & {
    authorizer?: JwtAuthorizerContext;
  };
  const callerId = ctx.authorizer?.jwt?.claims?.sub;
  if (!callerId) {
    return {
      statusCode: 401,
      headers: HEADERS,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  const result = await ddb.send(new ScanCommand({ TableName: USERS_TABLE }));
  const users = (result.Items ?? []) as UserRow[];

  // Sort descending by balance (undefined -> 0)
  users.sort((a, b) => (b.balance ?? 0) - (a.balance ?? 0));

  const top20 = users.slice(0, 20).map((u, i) => ({
    rank: i + 1,
    userId: u.userId,
    email: u.email,
    balance: u.balance ?? 0,
  }));

  const callerIndex = users.findIndex((u) => u.userId === callerId);
  const ownRank = callerIndex === -1 ? null : callerIndex + 1;
  const ownBalance = callerIndex === -1 ? null : users[callerIndex].balance ?? 0;

  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ top20, ownRank, ownBalance }),
  };
};
