# Configure IDP — Configure IDP — Add ABBYY Vantage connector secrets to cluster {#abbyy-secrets}

If you want to use [ABBYY Vantage](#abbyy-vantage) as a [text extraction engine](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-reference#extraction-engines), add the following connector secrets. ABBYY Vantage can be combined with any cloud provider you have configured.

| Connector secret Key      | Required | Description                                                                                                                                                                    |
| :------------------------ | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IDP_ABBYY_BASE_URL`      | Yes      | The base URL of your ABBYY Vantage instance.Example: `https://vantage-eu.abbyy.com`                                                                              |
| `IDP_ABBYY_CLIENT_ID`     | Yes      | The OAuth2 Client ID generated in the ABBYY Vantage **Public API Clients** settings.                                                                                           |
| `IDP_ABBYY_CLIENT_SECRET` | Yes      | The OAuth2 Client Secret paired with `IDP_ABBYY_CLIENT_ID`.                                                                                                                    |
| `IDP_ABBYY_SKILL_ID`      | Yes      | The Skill ID of the ABBYY Vantage OCR skill used for text extraction. The skill must be configured to **output Text format**. The Skill ID is the GUID shown in the skill URL. |

**Note**

- These connector secrets are used in IDP document extraction templates. See [integrate IDP into your processes](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-integrate).
- You can rename these connector secrets if you want to change the testing configuration used in other environments (such as `test`, `stage` or `prod`). If you do this, you must also change these names to match within the **Authentication** section of the Properties panel for any related published document extraction templates.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration
