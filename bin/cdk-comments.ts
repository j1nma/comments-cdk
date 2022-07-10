#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { CommentsStack } from "../lib/cdk-comments";

const app = new App();
new CommentsStack(app, "CommentsStack", {
  allowOrigins: ["https://j1nma.com"],
});
