# Helm chart dual-region operational procedure — Procedure — OpenShift

Follow the installation instructions for both regions. You’ll need to apply `helm upgrade` on both `CLUSTER_RECREATED` and `CLUSTER_SURVIVING`.

Make sure to remove the `CAMUNDA_DATABASE_SCHEMAMANAGER_CREATESCHEMA` variable from `camunda-values.yml`.

Edit the `generated-values-region-0|1.yml` file and remove the following from the `orchestration.env`:

```yaml
orchestration:
  env:
    - name: CAMUNDA_DATABASE_SCHEMAMANAGER_CREATESCHEMA
      value: "false"
  # ...
```

- [Apply the initial installation on the two regions](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region#install-camunda-8-using-helm).
- Ensure that the services are exported correctly using `subctl`.
- This step re-enables Operate and Tasklist in both regions.

#### Verification

1. If the environment is exposed through an Ingress, verify that Operate and Tasklist are reachable again.
2. Check the logs of any `camunda-zeebe-X` pod to confirm the active profiles.

   Run this command for both the surviving and recreated clusters (`CLUSTER_RECREATED` and `CAMUNDA_NAMESPACE_RECREATED`):

   ```bash
   kubectl --context $CLUSTER_SURVIVING logs camunda-zeebe-0 | grep "profiles are active"
   ```

   ```bash
   # The default are 5 profiles, so this confirms that Operate and Tasklist are enabled
   io.camunda.application.StandaloneCamunda - The following 5 profiles are active: "broker", "operate", "tasklist", "admin", "consolidated-auth"
   ```

3. Alternatively, verify that the configuration lists Operate and Tasklist as active profiles:

   ```bash
   kubectl --context $CLUSTER_SURVIVING get cm camunda-zeebe-configuration-unified -oyaml | grep spring -A2
   ```

   ```bash
   spring:
     profiles:
       active: "broker,operate,tasklist,admin,consolidated-auth"
   ```

  

---

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
