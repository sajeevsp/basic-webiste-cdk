import { Stack, App, StackProps } from "@aws-cdk/core";
import StaticSite from "./static-site";

interface SiteStackProps {
  siteDomain: string;
  siteSubDomain: string;
  repositoryArn: string;
}

class SiteStack extends Stack {
  constructor(
    parent: App,
    name: string,
    siteProps: SiteStackProps,
    props?: StackProps
  ) {
    super(parent, name, props);
    new StaticSite(this, "Stack", {
      siteDomain: siteProps.siteDomain,
      siteSubDomain: siteProps.siteSubDomain,
      repositoryArn: siteProps.repositoryArn,
    });
  }
}

export default SiteStack;
