# Amazon Textract connector — Use this connector

New to using an outbound connector? Learn how to add and use this type of connector, apply element templates, use connector secrets, handle results and errors, and more.

Use an outbound connector


## Authentication

Select an authentication type from the **Authentication** dropdown.

### Credentials

Use AWS authentication.

| Property   | Type   | Required | Description                  | Example                          |
| :--------- | :----- | :------- | :--------------------------- | :------------------------------- |
| Access Key | String | Yes      | AWS access key for Textract. | `AKIAIOSFODNN37`                 |
| Secret Key | String | Yes      | AWS secret key for Textract. | `wJalrXUtnFEgfMIK7MDENGbPxRfiCY` |

**Note**
Requires your AWS access key and secret access key (see [prerequisites](#prerequisites)).

### Default Credentials Chain (hybrid/Self-Managed only)

Use this authentication type if your system relies on implicit authentication (for example, IAM roles, environment variables, or credentials files). Uses the [Default Credential Provider Chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html) to resolve credentials.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-textract
