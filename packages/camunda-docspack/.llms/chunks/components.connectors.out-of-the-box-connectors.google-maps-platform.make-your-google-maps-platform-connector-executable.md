# Google Maps Platform connector — Make your Google Maps Platform connector executable

To work with the Google Maps Platform connector, choose the required operation type in the **Operation** section and enable the required Google Service API (which depends on the operation). Set the API key in the **Authentication** section and complete the mandatory fields highlighted in red in the connector on the right side of the screen under the **Deploy** button.

**Note**
All the mandatory and non-mandatory fields and required settings depending on the operation selection you choose are covered in the upcoming sections.


## Authentication

In the **Authentication** section, set the relevant API key. Refer to the [official documentation](https://cloud.google.com/docs/authentication/api-keys#create) for more information on creating an API key.

**Note**
We advise you to keep your authentications and secrets data safe and avoid exposing it in the BPMN XML file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets).
2. Name your secret (i.e `GOOGLE_MAPS_PLATFORM_API_KEY`) so you can reference it later in the connector.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-maps-platform
