# Blue Prism connector — Authentication

You can choose among the available **Blue Prism connector** authentication types according to your authentication requirements.

### Bearer token authentication

#### Create a new connector secret

We advise you to keep your **Bearer Token** safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).
2. Name your secret (i.e `BLUE_PRISM_BEARER_TOKEN`) so you can reference it later in the connector.

#### Configure the bearer token

Select the **Blue Prism connector** and fill out the following properties under the **Authentication** section:

1. Click **Bearer Token** in the **Authentication** section.
2. Set **Bearer** to the secret you created (i.e. `{{secrets.BLUE_PRISM_BEARER_TOKEN}}`).

### OAuth Client Credentials Flow

#### Create a new connector secret

We advise you to keep your **Client ID** and **Client secret** safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).
2. Name your secret (i.e `BLUE_PRISM_CLIENT_ID`) so you can reference it later in the connector.

#### Configure the OAuth Token

Select the **Blue Prism connector** and fill out the following properties under the **Authentication** section:

1. Select **OAuth 2.0 client credentials** in the **Authentication** section.
2. Set **Identity token provider URL** to identity provider configured for your Blue Prism instance.
3. Set **Client ID** to the secret you created (i.e. `{{secrets.BLUE_PRISM_CLIENT_ID}}`).
4. Set **Client secret** to the secret you created (i.e. `{{secrets.BLUE_PRISM_CLIENT_SECRET}}`).

Find more information about the OAuth client credentials flow in the [RFC reference](https://www.rfc-editor.org/rfc/rfc6749#section-4.4).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/blueprism
