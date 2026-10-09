# AI Agent model providers — Supported providers — foundry

Use a Claude model deployed in [Microsoft Foundry](https://ai.azure.com/) (Azure AI Foundry) as the LLM for your Camunda AI agents.

| Field              | Required | Description                                                                                                  |
| :----------------- | :------- | :----------------------------------------------------------------------------------------------------------- |
| **API endpoint**   | Yes      | Base URL of the Microsoft Foundry resource, for example `https://your-resource.services.ai.azure.com`.       |
| **Authentication** | Yes      | **API key**, **Entra ID: Client credentials**, or **Entra ID: Managed identity** (Hybrid/Self-Managed only). |

Authentication fields per method:

- **API key**: an API key for the resource, available in the [Azure AI Foundry portal](https://ai.azure.com/).
- **Entra ID: Client credentials**: registers an application in [Microsoft Entra ID](https://go.microsoft.com/fwlink/?linkid=2083908) and authenticates with it.
  - **Client ID**: the Microsoft Entra application (client) ID.
  - **Client secret**: the application's client secret.
  - **Tenant ID**: the Microsoft Entra tenant (directory) ID.
  - **Authority host**: (optional) overrides the Microsoft Entra authority host, for example for sovereign clouds. Leave unset for the public cloud authority.
- **Entra ID: Managed identity** (Hybrid/Self-Managed only): authenticates using the environment's managed identity.
  - **Client ID**: (optional) the client ID of a user-assigned managed identity. Leave unset to use the system-assigned managed identity.

**Note**
To use a Claude model through Foundry, deploy it first from the [Foundry model catalog](https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/concepts/models-sold-directly-by-azure), and enter the deployment name in the **Model** field below.

A multi-replica connectors runtime setup means each replica also acquires and caches its own Entra ID token independently. Expect multiple, parallel credential/token requests against Entra ID under load, rather than a single shared token, and size any Entra ID application throttling limits accordingly.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers
