# Build your first AI agent — Step 2: Configure the AI Agent connector — local

Configure your local LLM with Ollama.

#### Set up Ollama

1. **Download and install**: Follow [Ollama's documentation](https://docs.ollama.com/quickstart) for details.
1. **Confirm installation**: Check the installed version in a terminal or command prompt by running `ollama --version`.
1. **Start the local server**: Start it using the application, or run `ollama serve` in a terminal or command prompt.
1. **Pull a model**: This guide uses GPT-OSS:20b as an example. Run `ollama pull gpt-oss:20b` in a terminal or command prompt to download it. Any [model supported by Ollama](https://ollama.com/search) works with the AI Agent connector; substitute a smaller model (for example, `ollama pull llama3.2`) if you prefer a lighter download.
1. **Test**: Ollama serves an API at `http://localhost:11434` by default. To test it, open that URL in a browser or run this command in your terminal:

```
curl -X POST http://localhost:11434/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d '{"model":"gpt-oss:20b","messages":[{"role":"user","content":"Hello!"}]}'
```

#### Configure properties

The example blueprint downloaded in step one is preconfigured to use AWS Bedrock. Update the connector's configuration using the Model provider and Model sections to use Ollama instead.

**Model provider**

1. Select **OpenAI Compatible** from the **Provider** dropdown.
1. Enter `http://localhost:11434/v1` in the **API endpoint** field. This is Ollama's default API URL.
1. No authentication or additional headers are required for the local Ollama API, so leave the remaining fields blank.

**Model**

1. Enter `gpt-oss:20b` in the **Model** field, or the name of whichever model you pulled instead. This field is case-sensitive, so be sure to enter it in all lowercase.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-agentic-orchestration
