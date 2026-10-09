# UiPath connector — Operation types — UiPath connector (bearer token)

#### Create a new connector secret

We advise you to keep your **Bearer Token** safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets).
2. Name your secret (i.e `BEARER_TOKEN_UIPATH`) so you can reference it later in the connector.

#### Configure the bearer token

Select the **UiPath connector** and fill out the following properties under the **Authentication** section:

1. Click **Bearer Token** in the **Authentication** section.
2. Set **Bearer** to the secret you created (i.e. `{{secrets.UIPATH_BEARER_TOKEN}}`).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/uipath
