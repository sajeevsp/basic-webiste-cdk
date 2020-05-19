import { Construct } from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codecommit from "@aws-cdk/aws-codecommit";
import * as s3 from "@aws-cdk/aws-s3";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import { RedirectProtocol } from "@aws-cdk/aws-s3";

export interface StaticSiteProps {
  repositoryArn: string;
  siteDomain: string;
  siteSubDomain: string;
}

class StaticSite extends Construct {
  constructor(parent: Construct, name: string, props: StaticSiteProps) {
    super(parent, name);

    const siteDomain = props.siteDomain;
    const siteSubDomain = props.siteSubDomain;

    //S3 bucket of primary domain where we host all site files - html, css, js and assets.
    //Bucket with public read access.
    const siteS3 = new s3.Bucket(this, "DomainBucket", {
      bucketName: siteDomain,
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
    });

    //S3 bucket representing sub domain, empty bucket, all requests will be redirected to primary S3 bucket.
    const subDomainS3 = new s3.Bucket(this, "subDomainBucket", {
      bucketName: siteSubDomain,
      websiteRedirect: {
        hostName: siteDomain,
        protocol: RedirectProtocol.HTTP,
      },
    });

    //Code repository that houses npm front end application.
    const repository = codecommit.Repository.fromRepositoryArn(
      this,
      "Repository",
      props.repositoryArn
    );

    const packageBuild = new codebuild.PipelineProject(this, "Build", {
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
        computeType: codebuild.ComputeType.SMALL,
      },
    });

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact("NPMBuildOutput");

    //Pipeline that releases code when there is a new commit to master branch.
    //Build uses buildspec.yml in the root of repository to execute right npm commands.
    //Deploy copies output of npm build over to S3 bucket.
    new codepipeline.Pipeline(this, "Pipeline", {
      stages: [
        {
          stageName: "Source",
          actions: [
            new codepipeline_actions.CodeCommitSourceAction({
              actionName: "CodeCommit_Source",
              repository: repository,
              output: sourceOutput,
            }),
          ],
        },
        {
          stageName: "Build",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "NPM_Build",
              input: sourceOutput,
              project: packageBuild,
              outputs: [buildOutput],
            }),
          ],
        },
        {
          stageName: "Deploy",
          actions: [
            new codepipeline_actions.S3DeployAction({
              actionName: "Site_Deploy",
              input: buildOutput,
              bucket: siteS3,
            }),
          ],
        },
      ],
    });
  }
}

export default StaticSite;
