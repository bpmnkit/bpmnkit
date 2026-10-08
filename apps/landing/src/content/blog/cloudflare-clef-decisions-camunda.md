---
title: "How to route a Camunda 8 process on a Cloudflare Clef decision"
description: "Step by step: call Cloudflare's Clef decision model from a Camunda 8 service task with the BPMN Kit element template, then route a gateway on the answer and its confidence."
pubDate: 2026-10-03
author: "BPMN Kit"
tags: ["connectors", "camunda", "ai", "cloudflare"]
---

Cloudflare's [Clef](https://blog.cloudflare.com/clef-decision-models/) models are decision
models. You give them some data and a few typed questions. They do not write text. They
return one answer for each question, with a probability for each option. That is what an
exclusive gateway needs: "which team gets this ticket", plus how sure the model is.

BPMN Kit now ships an element template for it: **Cloudflare Clef Decision**
(`io.bpmnkit.connectors.CloudflareClef.v1`). It runs on Camunda's REST connector, so a cluster
with the connector runtime can run it as it is. You do not deploy a job worker.

This how-to takes you from nothing to a process instance that has Clef's answers in a
variable. It takes about 15 minutes.

## What you need

- A Cloudflare account with Workers AI.
- A Camunda 8 cluster with connectors: SaaS, or Self-Managed with the connector runtime.
- Camunda Desktop Modeler or Web Modeler. The [BPMN Kit editor](/editor) also has the template.

## 1. Get a Cloudflare API token and account ID

1. In the Cloudflare dashboard, open **Workers AI**.
2. Select **Create a Workers AI API Token**. A custom token needs `Workers AI - Read` and
   `Workers AI - Edit`.
3. Copy the token and the **Account ID** from the same page.

## 2. Call Clef once from your terminal

Do this before you involve Camunda. If this call fails, the problem is on the Cloudflare side.

```sh
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_API_TOKEN=...

curl "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/cloudflare/clef-flash" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "clef-flash",
    "state": "Checkout has been failing for every customer for the last hour.",
    "questions": {
      "urgent": { "type": "noul", "instructions": "Is this support request urgent?" },
      "team": {
        "type": "choice",
        "instructions": "Which team should handle this request?",
        "criteria": {
          "billing": "Payments, invoices and refunds",
          "technical": "Outages, errors and configuration"
        }
      }
    }
  }'
```

You get `"success": true` and the answers under `result.answers`:

```json
{
  "result": {
    "model": "clef-flash",
    "answers": {
      "urgent": { "type": "noul", "noul": 0.97 },
      "team": { "type": "choice", "choice": "technical", "probabilities": { "billing": 0.04, "technical": 0.96 }, "confidence": 0.93 }
    },
    "usage": { "input_tokens": 112, "output_tokens": 0 }
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

The numbers you get will be different.

## 3. Add two connector secrets to the cluster

Add these secrets to the cluster's connector secrets. In SaaS, open the cluster, then
**Connector secrets**. In Self-Managed, use your secret provider.

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | The token from step 1 |
| `CLOUDFLARE_ACCOUNT_ID` | The account ID from step 1 |

The template uses these names by default. You can change them in the task's fields.

## 4. Get the template

Download the template:
[`io.bpmnkit.connectors.CloudflareClef.v1.json`](/connectors/io.bpmnkit.connectors.CloudflareClef.v1.json).

- **Desktop Modeler:** put the file in a `.camunda/element-templates/` folder next to your
  `.bpmn` file, then restart Modeler.
- **Web Modeler:** upload the file to your project and publish it.
- **BPMN Kit editor:** you do not need the file. It is in the **Connector** list of a
  service task.

## 5. Model the process

Make the smallest process that shows the template works: a start event, one service task and
an end event.

1. Select the service task. Choose the template **Cloudflare Clef Decision**. In Modeler, it
   is in the **AI decisions** category.
2. Keep **API token** and **Account ID** as they are. They read the secrets from step 3.
3. Set **Model** to `Clef-flash`.
4. Set **State** to `=ticket`.
5. Set **Questions** to:

   ```feel
   ={
     "urgent": {"type": "noul", "instructions": "Is this support request urgent?"},
     "team": {
       "type": "choice",
       "instructions": "Which team should handle this request?",
       "criteria": {
         "billing": "Payments, invoices and refunds",
         "technical": "Outages, errors and configuration"
       }
     }
   }
   ```

6. Keep **Result expression** as `={clef: response.body.result.answers}`. Clef's answers then
   go into the process variable `clef`.

If you also want the gateway, the [ticket triage example](/docs/guides/ai-decisions#example-triage-a-support-ticket)
builds the complete process. To write its `.bpmn` file from a checkout of the repository, run
`pnpm --filter @bpmnkit/examples 07`. The file is
`apps/examples/output/07-ai-ticket-triage-clef.bpmn`.

## 6. Deploy and start an instance

Deploy the process from Modeler. Start an instance with these variables:

```json
{
  "ticket": {
    "subject": "Checkout broken",
    "body": "Every payment fails since 10:00. We are losing orders."
  }
}
```

## 7. Look at the result

Open the instance in Operate. The service task completes, and the variable `clef` holds the
answers:

```json
{
  "urgent": { "type": "noul", "noul": 0.95 },
  "team": { "type": "choice", "choice": "technical", "probabilities": { "billing": 0.05, "technical": 0.95 }, "confidence": 0.91 }
}
```

You can now route on it. For example, these are conditions on the outgoing flows of an
exclusive gateway:

| Flow | Condition |
|---|---|
| Page on-call | `=clef.team.choice = "technical" and clef.urgent.noul >= 0.8` |
| Triage by hand | `=clef.team.confidence < 0.6` |
| Billing queue | `=clef.team.choice = "billing"` |
| Support queue | default flow |

## If it does not work

The incident message on the service task usually tells you the cause.

| Symptom | Cause | What to do |
|---|---|---|
| HTTP 401 or 403 | The token does not have Workers AI permissions, or the secret is wrong. | Do step 2 again with the value from the secret. |
| HTTP 404, or the URL in the error has `{{secrets.CLOUDFLARE_ACCOUNT_ID}}` in it | The connector runtime did not replace the secret in the URL. | Type the account ID itself in **Account ID**. An account ID is not secret. |
| The URL in the error has `null` in it | The URL was built before the account ID was set. | Edit the task's `url` input mapping in the XML to the full URL. |
| HTTP 400 | Cloudflare did not accept the questions. | A `choice` needs 2 or more `criteria`. A `score` needs a list of 2 to 10 levels. Each question needs `type` and `instructions`. |
| The task completes, but `clef` is `null` | The response is not in the expected shape. | Set **Result variable** to `raw` and look at `raw.body`. |

The last three rows describe how the template builds the URL. We have not seen those
failures on a cluster yet. If you get one, please
[open an issue](https://github.com/bpmnkit/bpmnkit/issues) with the incident message.

## Next steps

- [AI Decisions guide](/docs/guides/ai-decisions): every field, the format of the questions
  and answers, and how to test the routing without calls to Cloudflare.
- [The template's page](/connectors/io.bpmnkit.connectors.CloudflareClef.v1): its inputs, and
  how to apply it from TypeScript with `@bpmnkit/connectors`.
