import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const PRICE_HISTORY_TABLE = process.env.PRICE_HISTORY_TABLE!;

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const marketId = event.pathParameters?.marketId;
  if (!marketId) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: "marketId is required" }),
    };
  }

  const result = await ddb.send(
    new QueryCommand({
      TableName: PRICE_HISTORY_TABLE,
      KeyConditionExpression: "marketId = :mid",
      ExpressionAttributeValues: { ":mid": marketId },
      ScanIndexForward: true,
      Limit: 500,
    })
  );

  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ history: result.Items ?? [] }),
  };
};
