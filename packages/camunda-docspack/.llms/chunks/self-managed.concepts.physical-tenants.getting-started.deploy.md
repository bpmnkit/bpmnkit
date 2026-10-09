# Set up two isolated Physical Tenants — Deploy

Apply the updated values with a rolling restart:

```bash
helm upgrade camunda camunda/camunda-platform -f values.yaml
```

Adding a Physical Tenant always requires a rolling restart. `default` keeps serving requests throughout the rollout. See [rolling restart expectations](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/provisioning-and-lifecycle#rolling-restart-expectations).

Confirm `riskprod` is up before deploying a process to it. This and every other request in this guide requires an access token from the identity provider you assigned to `riskprod`; the examples omit the auth header for brevity. See [authentication](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication) for how to obtain one:

```bash
curl https://your-cluster/physical-tenants/riskprod/v2/topology
```

Deploy your process to `riskprod` from Desktop Modeler by targeting its tenant URL (see the pre-flight checklist), or from the CLI/Java client by connecting a client scoped to `riskprod` (see [API walkthrough](#api-walkthrough) below) and calling the deploy operation as usual.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started
