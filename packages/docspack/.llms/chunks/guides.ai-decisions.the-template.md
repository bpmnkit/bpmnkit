# AI Decisions — The template

`@bpmnkit/connectors` bundles **Cloudflare Clef Decision**
(`io.bpmnkit.connectors.CloudflareClef.v1`). It is an element template for a service task that
runs on Camunda's REST connector (`io.camunda:http-json:1`), so any cluster with the connector
runtime can run it. You do not deploy a job worker.

| Field | Key | Notes |
|---|---|---|
| API token | `authentication.token` | Default `{{secrets.CLOUDFLARE_API_TOKEN}}`. Needs Workers AI permission. |
| Account ID | `accountId` | Default `{{secrets.CLOUDFLARE_ACCOUNT_ID}}`. |
| Model | `model` | `clef` (more accurate, has a vision encoder) or `clef-flash` (lower latency). Sets the URL and the body's `model` together. |
| State | `body.state` | Required. FEEL. What the model evaluates: text, or a context or list. |
| Questions | `body.questions` | Required. FEEL context of 1 to 64 questions, keyed by id. |
| Images | `body.images` | Optional. FEEL list of up to 4 base64 data URLs (PNG, JPEG, WebP). |
| Result expression | `resultExpression` | Default `={clef: response.body.result.answers}`. |

Before you deploy, create the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the
cluster's connector secrets.

---
Source: https://bpmnkit.com/docs/guides/ai-decisions
