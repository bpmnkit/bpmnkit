# Integrate IDP into your processes — Provider configuration

### AWS S3 Bucket name

Specify the name of the Amazon S3 bucket where documents can be temporarily stored during Amazon Textract analysis as a connector secret, provided as a [FEEL expression](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel).

Example: `{{secrets.IDP_AWS_BUCKET_NAME}}` (for the Amazon S3 bucket used for document storage during extraction).

**Note**
The Amazon S3 bucket name must be unique across all your AWS accounts.

### Region

Specify the region where documents can be temporarily stored during Amazon Textract analysis as a connector secret, provided as a [FEEL expression](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel). This should match the region where the AWS S3 bucket is located. The default region is `us-east-1`.

Example: `{{secrets.IDP_AWS_REGION}}`

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-integrate
