# Amazon EC2 — 1. Configure AWS and initialize Terraform — Load balancer setup

The `lb.tf` file defines the load balancer configuration used to expose Camunda 8 either publicly or within your internal network. You can further restrict access based on your security requirements.

The configuration includes two types of load balancers:

- A **Network Load Balancer** to expose the gRPC endpoint
- An **Application Load Balancer** to expose the Camunda WebApps and REST API

The embedded snippet below shows the resources defined in this file and how they can be customized in your copied reference. The preview is limited to 30 lines. For the complete file, refer to the link at the bottom of the snippet:

```hcl reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/compute/ec2-single-region/terraform/cluster/lb.tf#L1-L30
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2
