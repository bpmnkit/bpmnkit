# Integrate IDP into your processes — Input message data

### Document

Specify the document object variable used for document handling, provided as a [FEEL expression](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel) with the document reference.

For example, if you have uploaded a document via form upload using a `documents` **Key**, you can specify `documents[1]` to retrieve the first document in the array.

Example: `documents[1]`.

**Info**
To learn more about storing, tracking, and managing documents in Camunda 8, see [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).


## Provider authentication

### Authentication

Ensure the **Credentials** AWS authentication type is selected.

### Access key

Specify your AWS _access key_ connector secret, provided as a [FEEL expression](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel).

Example: `{{secrets.IDP_AWS_ACCESSKEY}}`

### Secret key

Specify your AWS _secret access key_ connector secret, provided as a [FEEL expression](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel).

Example: `{{secrets.IDP_AWS_SECRETKEY}}`

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-integrate
