#!/usr/bin/env node
import { App } from "@aws-cdk/core";
import CDKStack from "../lib/cdk-stack";
import DNSStack from "../lib/dns-stack";

const app = new App();

//Configurable parameters
const siteDomain = "yourdomain.com";
const siteSubDomain = "www.yourdomain.com";
const cdkRepositoryArn = "arn:aws:codecommit:us-east-1:000000000000:cdk";
const siteRepsitoryArn = "arn:aws:codecommit:us-east-1:000000000000:site";
const environments = {
  "us-east": {
    env: {
      account: "000000000000",
      region: "us-east-1",
    },
  },
};

//CDK stack - self deploys itself and then deploys the site stack.
new CDKStack(app, "CDKStack", {
  siteDomain: siteDomain,
  siteSubDomain: siteSubDomain,
  cdkRepositoryArn: cdkRepositoryArn,
  siteRepsitoryArn: siteRepsitoryArn,
});

//Deploys DNS changes.
new DNSStack(
  app,
  "DNSStack",
  {
    siteDomain: siteDomain,
    siteSubDomain: siteSubDomain,
  },
  environments["us-east"]
);

app.synth();
