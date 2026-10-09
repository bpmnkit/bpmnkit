# HTTP Webhook connector — Activate the HTTP Webhook connector by deploying your diagram — Example

Give a use-case when you need to configure a GitHub webhook with an **HTTP Webhook connector** in such a way that: (1) your BPMN process starts on every opened PR, and (2) the PR URL is exposed as a process variable.
Let's say you choose `mySecretKey` as a shared secret passphrase. GitHub [declares](https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks) that they use `X-Hub-Signature-256` header for `SHA-256` HMAC.
Therefore, you would need to set the following:

1. **Webhook ID**: any unique to your cluster webhook ID. This will generate a URL to trigger your webhook. In example, `myWebhookPath`.
2. **HMAC Authentication**: `enabled`.
3. **HMAC Secret Key**: `mySecretKey` or `{{secrets.MY_GH_SECRET}}`.
4. **HMAC Header**: `X-Hub-Signature-256`.
5. **HMAC Algorithm**: `SHA-256`.
6. **HMAC Scopes**: `=["BODY"]` or leave empty.
7. **Activation Condition**: `=(request.body.action = "opened")`.
8. **Variable Mapping**: `={prUrl: request.body.pull_request.url}`.
9. Click **Deploy**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook
