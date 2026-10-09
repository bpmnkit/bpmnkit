# Enable secure connectivity — Create a VPC interface endpoint in AWS

After activating the PrivateLink endpoint service in Hub:

1. Copy the **Service name** from the **Service details** section.
2. In your AWS account, create a VPC interface endpoint that connects to this service.
3. In the Amazon VPC console, open the **Create endpoint** wizard, then:
   - **Select a category** > **PrivateLink Ready partner services**.
   - Do not select **AWS services**. Otherwise, the Camunda service will not appear.
4. Configure subnets, security groups, and optional private DNS according to your AWS requirements.

AWS-side provisioning must follow the standard AWS PrivateLink process.

For detailed instructions, see the [AWS documentation on creating an interface endpoint](https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html), which also covers endpoint configuration and validation.

---
Source: https://docs.camunda.io/docs/next/components/saas/secure-connectivity/enable-secure-connectivity
