# Camunda 8 Deployment — CI/CD: Deploy on Push

A typical GitHub Actions step:

```yaml
- name: Deploy BPMN processes
  run: node scripts/deploy.mjs
  env:
    ZEEBE_REST_ADDRESS: ${{ secrets.ZEEBE_REST_ADDRESS }}
    ZEEBE_CLIENT_ID: ${{ secrets.ZEEBE_CLIENT_ID }}
    ZEEBE_CLIENT_SECRET: ${{ secrets.ZEEBE_CLIENT_SECRET }}
    ZEEBE_AUTHORIZATION_SERVER_URL: ${{ secrets.ZEEBE_AUTHORIZATION_SERVER_URL }}
```

```typescript
// scripts/deploy.mjs
import { CamundaClient } from "@bpmnkit/api";
import { readdir, readFile } from "node:fs/promises";

const client = new CamundaClient({
  baseUrl: `${process.env.ZEEBE_REST_ADDRESS}/v2`,
  auth: {
    type: "oauth2",
    clientId: process.env.ZEEBE_CLIENT_ID,
    clientSecret: process.env.ZEEBE_CLIENT_SECRET,
    tokenUrl: process.env.ZEEBE_AUTHORIZATION_SERVER_URL,
    audience: "zeebe.camunda.io",
  },
});

const form = new FormData();
for (const file of await readdir("./processes")) {
  if (!/\.(bpmn|dmn|form)$/.test(file)) continue;
  form.append("resources", new Blob([await readFile(`./processes/${file}`)]), file);
}

// One deployment: every file goes in, or none does
const result = await client.resource.createDeployment(form);
console.log(`Deployed ${result.deployments.length} resources`);
```

---
Source: https://bpmnkit.com/docs/guides/deployment
