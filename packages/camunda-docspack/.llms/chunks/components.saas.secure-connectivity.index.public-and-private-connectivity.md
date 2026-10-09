# Secure connectivity (AWS PrivateLink) — Public and private connectivity

When secure connectivity is enabled, public connectivity remains available.

- Orchestration Cluster components like Operate, Tasklist, and Admin can still be accessed using their public URLs.
- When creating client credentials for a cluster, you can choose which connectivity type to use:
  - Public connectivity, which uses the public hostnames shown for the credentials.
  - Private connectivity, which uses the private DNS hostname of your VPC interface endpoint instead of the public cluster hostname.

### Private DNS hostname

When you create a VPC interface endpoint in AWS, the endpoint is assigned a private DNS hostname.

This hostname resolves to the private network address of the endpoint within your VPC and is used to route traffic through AWS PrivateLink.

When connecting to your Camunda cluster using secure connectivity, replace the `{PRIVATE_DNS}` placeholder in the cluster endpoint URL with the private DNS hostname of your VPC endpoint.

You can find this hostname in the details of your VPC interface endpoint in AWS. For more information, see the AWS documentation on VPC interface endpoints.

---
Source: https://docs.camunda.io/docs/next/components/saas/secure-connectivity/index
