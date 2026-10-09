# Amazon EC2 — Requirements

- An AWS account to provision resources.
  - At a high level, permissions are needed for **ec2**, **iam**, **elasticloadbalancing**, **kms**, **logs**, and **es** services.
  - For detailed permissions, refer to this [example policy](https://github.com/camunda/camunda-deployment-references/blob/main/aws/compute/ec2-single-region/example/policy.json).
- Terraform (v1.7 or later)
- A Unix-based operating system with `ssh` and `sftp`
  - Windows may be used with [Cygwin](https://www.cygwin.com/) or [Windows WSL](https://learn.microsoft.com/en-us/windows/wsl/install), though these configurations have not been tested.

### Outcome

The result is a fully functioning Camunda Orchestration Cluster deployed in a high-availability setup using AWS EC2 and a managed OpenSearch domain.

Each EC2 instance includes an additional disk, dedicated to Camunda, to separate application data from the operating system.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2
