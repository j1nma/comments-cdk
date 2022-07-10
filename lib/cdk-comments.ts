import * as path from "path";
import { Construct } from "constructs";
import {
  Stack,
  StackProps,
  aws_lambda_nodejs as NodejsFunction,
  aws_apigateway as ApiGateway,
  aws_dynamodb as dynamodb,
} from "aws-cdk-lib";

interface CommentsStackProps extends StackProps {
  allowOrigins: string[];
}

export class CommentsStack extends Stack {
  constructor(scope: Construct, id: string, props: CommentsStackProps) {
    super(scope, id, props);

    // DynamoDB 'Comments' Table
    const commentsTable = new dynamodb.Table(this, "Comments", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    // 'Get Comments' Lambda
    const getComments = new NodejsFunction.NodejsFunction(this, "GetComments", {
      entry: path.join(__dirname, "..", "src", "getComments.ts"),
      handler: "handler",
      environment: {
        TABLE_NAME: commentsTable.tableName,
      },
    });

    // 'Post Comment' Lambda
    const postComment = new NodejsFunction.NodejsFunction(
      this,
      "PostComment",
      {
        entry: path.join(__dirname, "..", "src", "postComment.ts"),
        handler: "handler",
        environment: {
          TABLE_NAME: commentsTable.tableName,
        },
      }
    );

    // Grant Lambdas read/write access to DynamoDB
    commentsTable.grantReadData(getComments);
    commentsTable.grantWriteData(postComment);

    // API Gateway
    const commentsApi = new ApiGateway.RestApi(this, "CommentsApi", {
      defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type"],
        allowOrigins: props.allowOrigins,
        allowMethods: ["GET", "POST"],
      },
      deployOptions: {
        throttlingRateLimit: 1,
        throttlingBurstLimit: 1,
      },
    });
    commentsApi.root.addMethod(
      "GET",
      new ApiGateway.LambdaIntegration(getComments)
    );
    commentsApi.root.addMethod(
      "POST",
      new ApiGateway.LambdaIntegration(postComment)
    );
  }
}
