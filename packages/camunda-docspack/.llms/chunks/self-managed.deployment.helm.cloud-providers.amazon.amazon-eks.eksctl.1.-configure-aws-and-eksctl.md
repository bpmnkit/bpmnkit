# Deploy an EKS cluster with eksctl — 1. Configure AWS and eksctl

### Set up AWS authentication

Use the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) to run the following commands:

```bash
# set your region
export AWS_REGION="eu-central-1"

aws configure
```

Enter your `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and output format. These can be retrieved from the [AWS Console](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).

**Caution: Ownership of the created resources**

A user who creates resources in AWS will always retain administrative access to those resources, including any Kubernetes clusters. It is recommended to create a dedicated [AWS IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html) to ensure that the resources are managed and owned by that specific user.
This ensures that the user maintains admin access to Kubernetes and associated resources unless those resources are explicitly deleted.

[Create access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) for the new IAM user via the console and export them as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` variables to use with the AWS CLI and `eksctl`.

### Set up eksctl

[eksctl](https://eksctl.io/) is a tool that allows the creation of clusters via a single command, but does not support all configuration options. This setup supplies a YAML file that can be used with the CLI to create the cluster preconfigured with various settings.

Review the [installation guide](https://eksctl.io/installation/) for additional details.

### Configure your infrastructure

In this guide, we will set up multiple environment variables to configure the components.
Each component starts with a section that configures the different variables according to your needs.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
