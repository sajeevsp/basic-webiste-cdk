# Basic website using AWS CDK!

This is AWS CDK project for deploying a basic website in S3. This creates all S3 buckets and it's configuration required to host the site. It will create two pipelines -

- For deploying CDK changes. This gets automatically invoked whenever a changed is pushed to cdk codecommit repository.
- For deploying website when a new code is pushed to codecommit site repository.

## Steps to deploy

1. Install NodeJS
2. Install AWS CDK - `npm install -g aws-cdk`
3. Install AWS CLI - [link](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)
4. In AWS console, create IAM user with programmatic and administrator access. Make a note of access key id and secret key.
5. Execute `aws configure` and provide the access key from above step.
6. Check in website code to AWS codecommit with `buildspec.yml` in root. e.g., webiste [code](https://github.com/sajeevsp/webpack-bootstrap-react). Take a note of the repository arn.
7. Create repository in AWS codecommit for cdk code and make a note of arn.
8. Clone the code in this repository.
9. Update variables in `bin/index.ts` with account id, domain name, site repository arn and cdk repository arn.
10. Push code changes to AWS codecommit repository.
11. `npm install`
12. `npm run build`
13. 'cdk ls' - this will display three stacks - CDK, DNS and siteName.
14. `cdk deploy CDKStack` - this installs a self updating pipeline, create required S3 buckets and pipeline for deploying website code.
15. After completion of deployment, use S3 url to test the site. (To find URL, go to CloudFormation -> Stacks --> yourdomain -> Outputs)
16. Ensure Route53 --> registered domain has the site you are trying to host.
17. `cdk deploy DNSStack`

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
