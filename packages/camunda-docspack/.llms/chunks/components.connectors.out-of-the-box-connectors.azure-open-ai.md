# Azure OpenAI connector

Interact with Azure OpenAI from your BPMN process.

The **Azure OpenAI connector** is an outbound connector that allows you to interact with
[Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) models from your BPMN processes.

The **Azure OpenAI connector** currently supports only prompt operations:
[`completions`](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#completions),
[`chat completions`](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#chat-completions), and
[`completions extensions`](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#completions-extensions).

Refer the [official models documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models)
to find out if a desired model supports the operations mentioned.


## Prerequisites

To begin using the **Azure OpenAI connector**, ensure you have created and deployed an Azure OpenAI resource.
A valid Azure OpenAI API key is also required.

Learn more at the [official Azure OpenAI portal entry](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/create-resource).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/azure-open-ai
