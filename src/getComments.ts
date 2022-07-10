import { APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { generateResponse, orderComments } from "./utils";

const { AWS_REGION: region, TABLE_NAME: TableName } = process.env;
const dbClient = new DynamoDBClient({ region });

interface IComment {
  id: string;
  name: string;
  comment: string;
  slug: string;
  createdAt: number;
}

async function handler(): Promise<APIGatewayProxyResult> {
  try {
    const { Items } = await dbClient.send(
      new ScanCommand({
        TableName,
      })
    );

    const unmarshalledItems = Items?.map((i) => unmarshall(i)) as IComment[];
    return generateResponse(200, orderComments(unmarshalledItems));
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "error getting comments";
    console.error(error_message)
    return generateResponse(400, {error: error_message});
  }
}

export { handler };
