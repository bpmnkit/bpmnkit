# Enable secure connectivity — Manage allowed principals and regions

After activation, you can modify the configuration from the **Private networking** tab.

In the **Service details** section:

- Select the edit icon next to **Allowed principals** to add or remove AWS principal ARNs.
- Select the edit icon next to **Supported regions** to add or remove regions.

Changes apply to new VPC endpoint connection attempts.

Removing a previously allowed principal does not invalidate existing VPC endpoint connections.

### Endpoint connection approval

VPC endpoint connections are automatically approved when the AWS principal creating the interface endpoint is included in the **Allowed principals** list.

You don’t need to manually approve endpoint connections.

### Removing supported regions

Removing a supported region does not affect existing VPC endpoint connections that were created using that region.

Existing endpoint connections remain available.

---
Source: https://docs.camunda.io/docs/next/components/saas/secure-connectivity/enable-secure-connectivity
