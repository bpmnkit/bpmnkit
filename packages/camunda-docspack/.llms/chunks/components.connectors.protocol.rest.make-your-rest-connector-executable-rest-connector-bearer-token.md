# REST connector — Make your REST connector executable — REST connector (Bearer Token)

#### Create a new connector secret

We advise you to keep your **Bearer token** safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).
2. Name your secret (i.e `REST_BEARER_TOKEN`) so you can reference it later in the connector.

#### Configure the Bearer token

Select the **REST connector** and fill out the following properties under the **Authentication** section:

1. Click **Bearer token** in the **Authentication** section.
2. Set **Bearer** to the secret you created (i.e. `{{secrets.REST_BEARER_TOKEN}}`).

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/rest
