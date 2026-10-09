# Enable secure connectivity — Validation and activation requirements

When configuring and activating the PrivateLink endpoint service, Hub validates the provided values during each step:

- At least one valid AWS principal ARN must be provided.
- Principal ARNs must follow a valid AWS ARN format.
- At least one supported region must be configured.
- The cluster’s AWS region is preselected by default.

You cannot activate the service until all required fields are completed.


## Activation behavior

After selecting **Activate service**, Hub provisions the VPC endpoint service for the cluster.

The service status is displayed in the **Service details** section. Provisioning may take up to 10 minutes.

During provisioning, the endpoint service is not available for new VPC endpoint connections.

---
Source: https://docs.camunda.io/docs/next/components/saas/secure-connectivity/enable-secure-connectivity
