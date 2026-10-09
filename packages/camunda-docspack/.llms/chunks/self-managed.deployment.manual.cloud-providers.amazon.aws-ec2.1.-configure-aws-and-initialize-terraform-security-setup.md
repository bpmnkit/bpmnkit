# Amazon EC2 — 1. Configure AWS and initialize Terraform — Security setup

The `security.tf` file defines several security groups to manage access and traffic flow for different use cases, including:

- Allowing internal VPC traffic on Camunda ports
- Permitting EC2 instances to access external traffic on ports 80 and 443 to download dependencies (e.g., Java, Camunda)
- Allowing inbound traffic to the Load Balancer on specific ports
- Enabling SSH access for the bastion host

In addition to traffic management, this file also includes:

- A KMS key for encrypting EC2 disks and the OpenSearch domain
- An SSH key pair used to authorize remote SSH connections

The embedded snippet below shows which resources are created and how they can be customized in your copied reference. The preview is limited to 30 lines. For the complete file, refer to the link at the bottom of the snippet:

```hcl reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/compute/ec2-single-region/terraform/cluster/security.tf#L1-L30
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2
