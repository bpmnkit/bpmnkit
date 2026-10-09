# Deploy a ROSA HCP Cluster with Terraform — Requirements

- A [Red Hat Account](https://www.redhat.com/) to create the Red Hat OpenShift cluster.
- An [AWS account](https://docs.aws.amazon.com/accounts/latest/reference/accounts-welcome.html) to create any resources within AWS.
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), a CLI tool for creating AWS resources.
- [AWS Quotas](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html) _(only applies to [ROSA](https://www.redhat.com/en/technologies/cloud-computing/openshift/aws) or OpenShift deployed on AWS)_
  - Ensure at least **3 Elastic IPs** (one per availability zone).
  - Verify quotas for **VPCs, EC2 instances, and storage**.
  - Request increases if needed via the AWS console ([guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-resource-limits.html)); costs apply only to resources used.
- [Terraform](https://developer.hashicorp.com/terraform/downloads)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) to interact with the cluster.
- [ROSA CLI](https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws_classic_architecture/4/html/getting_started/rosa-quickstart-guide-ui.html) to interact with the cluster.
- [jq](https://jqlang.github.io/jq/download/) to interact with some Terraform variables.
- This guide uses GNU/Bash for all the shell commands listed.

For the tool versions used, check the [.tool-versions](https://github.com/camunda/camunda-deployment-references/blob/main/.tool-versions) file in the repository. It contains an up-to-date list of versions that we also use for testing.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup
