import {
  expect as expectCDK,
  haveResource,
  haveResourceLike,
  countResources,
} from "@aws-cdk/assert";
import { App } from "aws-cdk-lib";
import * as Comments from "../lib/cdk-comments";

describe("CDK comments Stack", () => {
  const app = new App();
  const stack = new Comments.CommentsStack(app, "TestCommentsStack", {
    allowOrigins: ["https://j1nma.com"],
  });

  it("creates a DynamoDB table", () => {
    expectCDK(stack).to(haveResource("AWS::DynamoDB::Table"));
  });

  it("creates the Lambda functions", () => {
    expectCDK(stack).to(countResources("AWS::Lambda::Function", 2));
    expectCDK(stack).to(
      haveResource("AWS::Lambda::Function", {
        Handler: "index.handler",
        Runtime: "nodejs14.x",
      })
    );
  });

  it("creates an API Gateway", () => {
    expectCDK(stack).to(
      haveResourceLike("AWS::ApiGateway::RestApi", {
        Name: "CommentsApi",
      })
    );
  });
});
