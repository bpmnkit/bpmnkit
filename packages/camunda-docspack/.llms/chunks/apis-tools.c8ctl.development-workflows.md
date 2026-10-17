# Development workflows

Use c8ctl to deploy resources, auto-redeploy on file changes, manage profiles, and bridge MCP connections for AI assistants.

<!-- This page is maintained in the c8ctl repository (https://github.com/camunda/c8ctl, in docs/) and
     is synced to camunda-docs automatically. Do not edit it in camunda-docs — changes will be
     overwritten. Edit the source in the c8ctl repo instead. -->

`c8ctl` includes commands that support local development and deployment workflows. You can deploy resources, run processes, watch for changes, manage profiles and sessions, and bridge MCP connections for AI assistants.

**Tip**
Use the `--profile` flag with any command to run it against a specific cluster without changing the active session.

```bash
c8 deploy ./process.bpmn --profile=staging
c8 run ./order.bpmn --profile=prod
c8 watch --profile=local
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/development-workflows
