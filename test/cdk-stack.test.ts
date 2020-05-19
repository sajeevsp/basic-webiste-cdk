import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import CDKStack from "../lib/cdk-stack";

test("CDK Stack", () => {
  const app = new cdk.App();
  // WHEN
  const siteDomain = "example.com";
  const siteSubDomain = "www.example.come";
  const cdkRepositoryArn = "arn:aws:codecommit:us-east-1:000000000000:cdk";
  const siteRepsitoryArn =
    "arn:aws:codecommit:us-east-1:000000000000:example.com";

  //CDK stack - self deploys itself and then deploys the site stack.
  const stack = new CDKStack(app, "CDKStack", {
    siteDomain: siteDomain,
    siteSubDomain: siteSubDomain,
    cdkRepositoryArn: cdkRepositoryArn,
    siteRepsitoryArn: siteRepsitoryArn,
  });
  // THEN
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
