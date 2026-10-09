# Configure IDP — Configure IDP — Add Azure connector secrets to cluster {#azure-secrets}

If you are using Azure as your cloud provider, add the following Azure connector secrets required for IDP.

| Connector secret Key                       | Required | Description                                                                                                                                                                                     |
| :----------------------------------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IDP_AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` | Yes      | The endpoint URL for your Azure AI Document Intelligence resource.                                                                                                                              |
| `IDP_AZURE_DOCUMENT_INTELLIGENCE_KEY`      | Yes      | The access key for your Azure AI Document Intelligence resource.                                                                                                                                |
| `IDP_AZURE_AI_FOUNDRY_ENDPOINT`            | Yes      | The endpoint URL for your Azure AI Foundry resource. Construct this URL using the pattern: `https://<resource-name>.services.ai.azure.com/models`.                                              |
| `IDP_AZURE_AI_FOUNDRY_KEY`                 | Yes      | The access key for your Azure AI Foundry resource. You can find this key in the details page of deployed base models or on the Azure AI Foundry "Overview" page.                                |
| `IDP_AZURE_OPEN_AI_ENDPOINT`               | Optional | The endpoint URL for your Azure OpenAI resource. Required only if you want to use OpenAI models. You can find this endpoint in the "Models + endpoints" page in the Azure AI Foundry dashboard. |
| `IDP_AZURE_OPEN_AI_KEY`                    | Optional | The access key for your Azure OpenAI resource. Required only if you want to use OpenAI models. You can find this key in the "Models + endpoints" page in the Azure AI Foundry dashboard.        |

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration
