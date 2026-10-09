# Amazon Comprehend connector — Make your Amazon Comprehend connector executable

To execute the **Amazon Comprehend connector**, ensure all mandatory fields are correctly filled.


## 1. Authentication

Choose an authentication type from the **Authentication** dropdown. For details on the different authentication types, refer to the [appendix](#aws-authentication-types).

If you select **Credentials**, the following fields must be provided:

- **Access Key**: The AWS access key for a user with Comprehend permissions.
- **Secret Key**: The corresponding AWS secret key.

Both **Access Key** and **Secret Key** are required to use the connector.


## 2. **Configuration (AWS Region)**

After authentication, set the AWS **Region** where the Textract service is hosted:

- **Region**: Specify the region (for example, `us-east-1`, `eu-west-1`).

**Note**
Ensure the region matches the location of your Comprehend service and S3 buckets to reduce latency and meet compliance requirements. For a full list of AWS regions, refer to the [AWS regional data](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-comprehend
