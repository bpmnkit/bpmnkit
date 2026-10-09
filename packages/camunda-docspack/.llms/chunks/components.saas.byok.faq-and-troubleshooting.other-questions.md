# FAQ & troubleshooting — Other questions

- Performance: Minimal impact; handled by AWS KMS.
- Per-cluster keys: Supported.
- Encryption in transit: TLS enforced.
- Cost: AWS KMS key storage and management charges apply in your AWS account. See [cost implications](https://docs.camunda.io/docs/next/components/saas/byok/index#cost-implications).


## Troubleshooting external encryption keys

| Issue                             | Possible cause                                                | Resolution                                                                                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cluster cannot access AWS KMS key | Key policy does not grant the Camunda cluster AWS Role access | Update the AWS KMS key policy with the correct AWS Role ARN from Camunda Hub.                                                                                                               |
| Encryption/decryption errors      | Key disabled, deleted, or in wrong Region                     | Re-enable, restore, or create a new key in the correct AWS Region.                                                                                                                          |
| CloudTrail does not show activity | AWS CloudTrail not enabled or retention too short             | Enable AWS CloudTrail in the cluster Region and store logs beyond 90 days. [View CloudTrail events](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/view-cloudtrail-events.html) |
| Key rotation issues               | Cluster encryption update not supported                       | Create a new key and associate it with a new cluster. Verify encryption settings before use.                                                                                                |

**Note**
For details on how Camunda responds when an external KMS key becomes disabled, deleted, or misconfigured, see [key state behavior](https://docs.camunda.io/docs/next/components/saas/byok/key-state-behavior).

**Note: Support**
For persistent issues with key policies, Region, or key status, contact [AWS support](https://docs.aws.amazon.com/awssupport/latest/user/case-management.html).  
For Camunda-specific cluster provisioning issues, contact [Camunda support](https://camunda.com/services/support-guide/).

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/faq-and-troubleshooting
