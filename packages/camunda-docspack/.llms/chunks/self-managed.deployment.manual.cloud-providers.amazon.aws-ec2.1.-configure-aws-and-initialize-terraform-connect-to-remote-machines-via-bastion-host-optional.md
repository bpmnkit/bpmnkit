# Amazon EC2 — 1. Configure AWS and initialize Terraform — Connect to remote machines via Bastion host (optional)

Since the EC2 instances are not publicly accessible, you must connect to them through a Bastion host. Alternatively, you can use the [AWS VPN Client](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/what-is.html) to securely access the private VPC.

This guide does not cover the VPN client setup, as it requires specific manual configuration and user interaction:

```sh
export BASTION_HOST=$(terraform output -raw bastion_ip)
# retrieves the first IP from the camunda_ips array
export CAMUNDA_IP=$(tf output -json camunda_ips | jq -r '.[0]')

ssh -J admin@${BASTION_HOST} admin@${CAMUNDA_IP}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2
