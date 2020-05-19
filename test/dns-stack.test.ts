import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import DNSStack from "../lib/dns-stack";

test("DNS Stack", () => {
  const app = new cdk.App();
  // WHEN
  const siteDomain = "example.com";
  const siteSubDomain = "www.example.come";
  const environments = {
    "us-east": {
      env: {
        account: "000000000000",
        region: "us-east-1",
      },
    },
  };

  //CDK stack - self deploys itself and then deploys the site stack.
  const stack = new DNSStack(
    app,
    "DNSStack",
    {
      siteDomain: siteDomain,
      siteSubDomain: siteSubDomain,
    },
    environments["us-east"]
  );
  // THEN
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
