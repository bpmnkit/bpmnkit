# UiPath connector — Operation types — UiPath connector (OAuth token)

#### Create a new connector secret

We advise you to keep your **Client ID** safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).
2. Name your secret (i.e `UIPATH_CLIENT_ID`) so you can reference it later in the connector.

#### Configure the OAuth Token

Select the **UiPath connector** and fill out the following properties under the **Authentication** section:

1. Click **OAuth 2.0** in the **Authentication** section.
2. Set **Client ID** to the secret you created (i.e. `{{secrets.UIPATH_CLIENT_ID}}`).
3. Set **Client secret** to the secret you created (i.e. `{{secrets.UIPATH_CLIENT_SECRET}}`).
4. Choose **Client Authentication** from the dropdown menu (i.e. `{{Send client credentials in body}}`).

Find more information about the OAuth client credentials flow in the [RFC reference](https://www.rfc-editor.org/rfc/rfc6749#section-4.4).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/uipath
