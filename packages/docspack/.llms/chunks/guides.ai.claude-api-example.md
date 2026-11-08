# AI Integration — Claude API Example

Using the Anthropic SDK to generate a process from a description:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { Bpmn, DeployabilityError, expand } from "@bpmnkit/core";
import type { CompactDiagram } from "@bpmnkit/core";

const anthropic = new Anthropic();

async function generateProcess(description: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: `Create a BPMN process for: ${description}` },
  ];
  // One repair round: the deploy gate's message tells the model exactly what to add.
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      system: `You are a BPMN process designer. Return only valid JSON matching the
CompactDiagram schema. No explanation, no markdown — raw JSON only. Give every service task a
jobType, every message a messageName (and a correlationKey where it is caught), every timer a
time, and every flow leaving an exclusive gateway a condition or isDefault.`,
      messages,
    });

    const json = response.content[0];
    if (json?.type !== "text") throw new Error("Unexpected response type");

    try {
      // expand() refuses a model Camunda 8 would not deploy (a DeployabilityError).
      return Bpmn.export(expand(JSON.parse(json.text) as CompactDiagram));
    } catch (err) {
      if (!(err instanceof DeployabilityError) || attempt === 1) throw err;
      messages.push(
        { role: "assistant", content: json.text },
        { role: "user", content: `Fix these and return the whole diagram again:\n${err.message}` },
      );
    }
  }
  throw new Error("unreachable");
}

const xml = await generateProcess(
  "An invoice approval process where invoices over $10,000 need manager approval"
);
```

---
Source: https://bpmnkit.com/docs/guides/ai
