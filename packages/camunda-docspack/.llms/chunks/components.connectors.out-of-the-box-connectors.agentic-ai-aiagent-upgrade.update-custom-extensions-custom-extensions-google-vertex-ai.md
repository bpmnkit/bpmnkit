# Upgrade AI Agent element templates — Update custom extensions {#custom-extensions} — Google Vertex AI

**Legacy template Provider**: Google Vertex AI → **New template Provider**: [Google Gemini](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers#google-gemini), **Backend**: Enterprise Agent Platform (Vertex AI).

The provider itself changes from **Google Vertex AI** to **Google Gemini**. Vertex AI is now the Enterprise Agent Platform backend of the general-purpose Google Gemini provider. A new [Google Gemini API](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers#google-gemini) backend is also available if you'd rather not manage a Google Cloud project.

**Project ID**, **Region**, **Authentication** (**Service account credentials** / **Application default credentials**), **Model**, **Temperature**, **top P**, and **top K** carry over unchanged.

| Legacy field          | New template guidance                                                                                                    |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| Maximum output tokens | Enter the same value as **Maximum tokens**.                                                                              |
| Endpoint              | Not available. There's no custom/compatible endpoint backend for Google Gemini to switch to, unlike Anthropic or OpenAI. |

The new template additionally exposes **Thinking budget**/**Thinking level** for reasoning configuration.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-upgrade
