# Camunda 8 Deployment — Lifecycle Events

Use the TypedEventEmitter to react to API events:

```typescript
client.on("request", (e) => {
  console.log(`→ ${e.method} ${e.url}`);
});

client.on("response", (e) => {
  console.log(`← ${e.status} in ${e.durationMs}ms`);
});

client.on("error", (e) => {
  metrics.increment("camunda.api.error", { url: e.url });
});
```


## From the CLI

`casen profile import` reads the credentials file, so the CLI needs no flags after it:

```sh
casen profile import saas ./camunda-credentials.sh
casen profile use saas
casen deploy deploy invoice-approval.bpmn --target camunda8
casen process-instance create --data '{"processDefinitionId":"invoice-approval"}'
```

`casen resource create-deployment <file...>` deploys several files, such as a process and
its DMN tables, as one deployment.

---
Source: https://bpmnkit.com/docs/guides/deployment
