---
title: Quick Start
description: Build and run your first BPMN process in minutes.
sidebar:
  order: 2
---

This guide walks you from zero to a deployed, running BPMN process in three steps.

## Step 1: Create a process

Use the fluent builder to describe your process in TypeScript:

```typescript
import { Bpmn } from "@bpmnkit/core";

const xml = Bpmn.export(
  Bpmn.createProcess("hello")
    .startEvent("start")
    .serviceTask("task", {
      name: "Hello World",
      taskType: "greet",   // Zeebe worker type
    })
    .endEvent("end")
    .withAutoLayout()      // apply Sugiyama layout
    .build()
);

console.log(xml); // valid BPMN 2.0 XML
```

The `xml` string is a complete, valid BPMN 2.0 document that any standards-compliant engine can load.

## Step 2: Simulate locally

The simulation engine runs the process right in Node.js — no Camunda cluster required:

```typescript
import { Engine } from "@bpmnkit/engine";

const engine = new Engine();
await engine.deploy({ bpmn: xml });

// Register a job worker for the "greet" service task
engine.registerJobWorker("greet", async (job) => {
  console.log("Hello from the worker!");
  await job.complete({ greeting: "Hello!" });
});

const instance = engine.start("hello");

// Wait for the process to finish
await new Promise<void>((resolve) => {
  instance.onChange((state) => {
    if (state === "completed") resolve();
  });
});
```

Prefer to see it? Write `xml` to `hello.bpmn` and run [`casen dev`](/docs/cli/dev) in that
folder: the editor opens in your browser with the simulator, and every save is linted and runs
the file's scenario tests.

```sh
npx @bpmnkit/cli dev
```

## Step 3: Deploy to Camunda 8

When you're ready, run it on a real Camunda 8 cluster. In Camunda Hub, open **Console →
Clusters**, pick your cluster, and on its **API** tab click **Create new client**. Download the
credentials file it shows once. Then, from the CLI:

```sh
npx @bpmnkit/cli profile import saas ./camunda-credentials.sh
npx @bpmnkit/cli profile use saas
npx @bpmnkit/cli deploy deploy hello.bpmn --target camunda8
npx @bpmnkit/cli process-instance create --data '{"processDefinitionId":"hello","variables":{"greeting":"world"}}'
```

The instance waits at the `greet` task until a worker completes it — see
[Camunda 8 Deployment](/docs/guides/deployment#handling-jobs).

Or do the same from code. The base URL is your cluster's REST address with `/v2` on the end:
`ZEEBE_REST_ADDRESS` in the credentials file.

```typescript
import { CamundaClient } from "@bpmnkit/api";

const client = new CamundaClient({
  baseUrl: `${process.env.ZEEBE_REST_ADDRESS}/v2`,
  auth: {
    type: "oauth2",
    clientId: process.env.ZEEBE_CLIENT_ID ?? "",
    clientSecret: process.env.ZEEBE_CLIENT_SECRET ?? "",
    tokenUrl: process.env.ZEEBE_AUTHORIZATION_SERVER_URL ?? "",
    audience: "zeebe.camunda.io",
  },
});

// Deploy the process definition
const form = new FormData();
form.append("resources", new Blob([xml]), "hello.bpmn");
await client.resource.createDeployment(form);

// Start a new process instance
const instance = await client.processInstance.createProcessInstance({
  processDefinitionId: "hello",
  variables: { greeting: "world" },
});

console.log("Started instance:", instance.processInstanceKey);
```

## What's next?

- [AI-Driven Implementation](/docs/guides/ai-implement) — let Claude implement processes end-to-end from a description
- [Core Concepts](/docs/getting-started/concepts) — understand how the builder, layout, and roundtrip work
- [Building Processes](/docs/guides/building-processes) — tasks, events, sub-processes, and markers
- [Gateways & Branching](/docs/guides/gateways) — exclusive, parallel, and event-based gateways

> **AI-first workflow** — if you have Claude Code, the fastest path is `casen skills install`
> then `/implement <description>`. Claude generates the BPMN, scaffolds workers, and deploys —
> all from a single prompt.
