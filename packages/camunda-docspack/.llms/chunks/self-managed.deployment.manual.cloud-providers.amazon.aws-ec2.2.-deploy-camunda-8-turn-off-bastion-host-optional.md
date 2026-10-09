# Amazon EC2 — 2. Deploy Camunda 8 — Turn off bastion host (optional)

If you used the [bastion host](#turn-off-bastion-host-optional) for access, it can be turned off when longer needed for direct access to the EC2 instances.

To turn off the bastion host, set the `enable_jump_host` variable to `false` in the `variables.tf` file, and reapply Terraform.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2
