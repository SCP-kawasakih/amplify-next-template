import { defineBackend } from "@aws-amplify/backend";
import * as iam from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { invokeBedrock } from "./invoke-bedrock/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  invokeBedrock,
});
const authenticatedUserIamRole =
  backend.auth.resources.authenticatedUserIamRole;
backend.invokeBedrock.resources.lambda.grantInvoke(authenticatedUserIamRole);
const bedrockStatement = new iam.PolicyStatement({
  actions: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
  resources: ["arn:aws:bedrock:ap-northeast-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0"],
});

backend.invokeBedrock.resources.lambda.addToRolePolicy(bedrockStatement);
backend.addOutput({
  custom: {
    invokeBedrockFunctionName:
      backend.invokeBedrock.resources.lambda.functionName,
  },
});
