# Secure connectivity (AWS PrivateLink) — Connect from your AWS VPC via PrivateLink

At a high level:

1. Enable secure connectivity for a cluster in Hub.
2. Review the VPC endpoint service details provided by Camunda (for example, service name, service type, region, and private DNS name).
3. Create one or more VPC interface endpoints in your AWS account and configure the required security groups.
4. Optionally configure private DNS for the endpoint connection in AWS. Enabling private DNS provides a seamless HTTPS experience.
5. Test connectivity from resources inside your VPC.

Camunda owns and operates the VPC endpoint service and the associated cluster-side infrastructure.

You own and manage resources in your AWS VPC, including:

- VPC interface endpoints.
- Security groups.
- Routing and DNS configuration.
- AWS permissions and quotas.

For step-by-step Camunda Hub instructions, see [Enable secure connectivity for a cluster](https://docs.camunda.io/docs/next/components/saas/secure-connectivity/enable-secure-connectivity).

---
Source: https://docs.camunda.io/docs/next/components/saas/secure-connectivity/index
