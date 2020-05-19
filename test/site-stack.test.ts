import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import SiteStack from "../lib/site-stack";

test("CDK Stack", () => {
  const app = new cdk.App();
  // WHEN
  const siteDomain = "example.com";
  const siteSubDomain = "www.example.come";
  const siteRepsitoryArn =
    "arn:aws:codecommit:us-east-1:000000000000:example.com";

  //CDK stack - self deploys itself and then deploys the site stack.
  const stack = new SiteStack(app, "TestSiteStack", {
    siteDomain: siteDomain,
    siteSubDomain: siteSubDomain,
    repositoryArn: siteRepsitoryArn,
  });
  // THEN
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
