# Amazon EC2 — 1. Configure AWS and initialize Terraform — EC2 setup

The `ec2.tf` file handles the creation of compute instances and, optionally, a bastion host. Within this file, you can configure disk size, instance type, enable or disable the bastion host, and define the [Amazon Machine Image (AMI)](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html) to override the default behavior of using the latest available image.

The file defines all resources related to the EC2 setup and can be customized as needed in your copied reference architecture. Note that the embedded code snippet below is limited to 30 lines. For the complete file, see the link provided at the bottom of the snippet:

```hcl reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/compute/ec2-single-region/terraform/cluster/ec2.tf#L1-L30
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2
