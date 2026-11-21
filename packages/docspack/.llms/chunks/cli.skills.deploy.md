# AIKit Skills — `/deploy`

Gate a BPMN process on deploy-readiness, then deploy it to local Reebe or Camunda 8.

```
/deploy invoice-approval.bpmn
```

**What it does:**

1. Runs `bpmnkit lint lint <file> --profile deploy` — stops if it reports any errors
2. Deploys via `bpmnkit deploy deploy <file>` (local) or `bpmnkit deploy deploy <file> --target camunda8`
3. Verifies with `bpmnkit process-definition list`
4. Reminds you to start any scaffolded workers and provision any `{{secrets.NAME}}` the process references

**Targets:**

- **Local Reebe** — deploys via `ZEEBE_ADDRESS` (default `http://localhost:26500`). Start Reebe first: `bpmnkit reebe start --port 26500`
- **Camunda 8** — deploys using the active `bpmnkit` profile. Set one up: `bpmnkit profile create`

---

---
Source: https://bpmnkit.com/docs/cli/skills
