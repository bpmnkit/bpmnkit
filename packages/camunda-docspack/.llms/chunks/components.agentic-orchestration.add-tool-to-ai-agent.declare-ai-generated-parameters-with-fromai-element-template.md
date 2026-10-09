# Add tools to an AI agent — Declare AI-generated parameters with `fromAi()` — element-template

Use this approach for an element with an element template applied, such as a [connector](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index) task.

1. Select the tool element and find the template field whose value the LLM should supply. For example, the [REST outbound connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest) exposes a **URL** field in its **HTTP Endpoint** section, plus **Query parameters** and **Request body** fields.
1. Set the field to a FEEL expression and wrap the value in `fromAi()`, referencing the parameter as a field of the `toolCall` context. For example, in the **URL** field:

   ```feel
   fromAi(toolCall.url, "The URL to fetch. Must be a valid HTTP(s) URL.")
   ```

1. Repeat for each field the LLM should supply. A single field can also declare several parameters. For example, in the **Query parameters** field:

   ```feel
   {
     latitude: fromAi(toolCall.latitude, "The latitude of the location.", "number"),
     longitude: fromAi(toolCall.longitude, "The longitude of the location.", "number")
   }
   ```

You don't need an additional input mapping entry for these fields. The AI Agent connector handles element template fields as input mappings, so it picks up the `fromAi()` calls written directly in them.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent
