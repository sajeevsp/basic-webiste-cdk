import { Stack, App, StackProps } from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";
import { BucketWebsiteTarget } from "@aws-cdk/aws-route53-targets";
import * as s3 from "@aws-cdk/aws-s3";

interface DNSStackProps {
  siteDomain: string;
  siteSubDomain: string;
}

class DNSStack extends Stack {
  constructor(
    parent: App,
    name: string,
    dnsProps: DNSStackProps,
    props?: StackProps
  ) {
    super(parent, name, props);

    const siteDomain = dnsProps.siteDomain;
    const siteSubDomain = dnsProps.siteSubDomain;

    const siteS3 = s3.Bucket.fromBucketName(this, "siteS3", siteDomain);
    const subDomainS3 = s3.Bucket.fromBucketName(
      this,
      "siteSubDomainS3",
      siteSubDomain
    );

    //Find the public hosted zone in the account for the primary domain.
    const zone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: siteDomain,
    });

    //DNS A-Record for routing primary domain to main bucket.
    new route53.ARecord(this, "DomainARecord", {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(new BucketWebsiteTarget(siteS3)),
      zone: zone,
    });

    //DNS A-Record for routing sub domain to it's bucket.
    new route53.ARecord(this, "SubDomainARecord", {
      recordName: siteSubDomain,
      target: route53.RecordTarget.fromAlias(
        new BucketWebsiteTarget(subDomainS3)
      ),
      zone: zone,
    });
  }
}

export default DNSStack;
