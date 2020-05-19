import { App, Stack, StackProps } from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as codecommit from "@aws-cdk/aws-codecommit";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as app_delivery from "@aws-cdk/app-delivery";
import SiteStack from "./site-stack";

interface CDKStackProps {
  siteDomain: string;
  siteSubDomain: string;
  cdkRepositoryArn: string;
  siteRepsitoryArn: string;
}

class CDKStack extends Stack {
  constructor(
    parent: App,
    name: string,
    cdkProps: CDKStackProps,
    props?: StackProps
  ) {
    super(parent, name, props);
    const siteStackName = cdkProps.siteDomain.includes(".")
      ? cdkProps.siteDomain.split(".")[0]
      : cdkProps.siteDomain;
    const siteStack = new SiteStack(parent, siteStackName, {
      siteDomain: cdkProps.siteDomain,
      siteSubDomain: cdkProps.siteSubDomain,
      repositoryArn: cdkProps.siteRepsitoryArn,
    });
    const repository = codecommit.Repository.fromRepositoryArn(
      this,
      "Repository",
      cdkProps.cdkRepositoryArn
    );
    const sourceOutput = new codepipeline.Artifact();
    const synthOutput = new codepipeline.Artifact("CDKSynthOutput");

    const packageBuild = new codebuild.PipelineProject(this, "Build", {
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
        computeType: codebuild.ComputeType.SMALL,
      },
    });

    new codepipeline.Pipeline(this, "Pipeline", {
      restartExecutionOnUpdate: true,
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
              actionName: "CDK_Synth",
              input: sourceOutput,
              project: packageBuild,
              outputs: [synthOutput],
            }),
          ],
        },
        {
          stageName: "SelfUpdate",
          actions: [
            new app_delivery.PipelineDeployStackAction({
              stack: this,
              input: synthOutput,
              adminPermissions: true,
            }),
          ],
        },
        {
          stageName: "Deploy",
          actions: [
            new app_delivery.PipelineDeployStackAction({
              stack: siteStack,
              input: synthOutput,
              adminPermissions: true,
            }),
          ],
        },
      ],
    });
  }
}

export default CDKStack;
