# Helm chart dual-region operational procedure — Procedure — OpenShift

Follow the installation steps for the **surviving region**:

- [Set up the Camunda 8 Dual-Region Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region#configure-your-deployment-for-each-region) (optional if you already have your pre-configured `generated-values-file.yml`)
- Once your values file is generated from the installation step, upgrade **Camunda 8 only in the surviving region**. Adjust the installation command to disable Operate and Tasklist:

  ```bash
  --set orchestration.profiles.operate=false \
  --set orchestration.profiles.tasklist=false
  ```

  Example command adapted from the installation step:

  ```bash
  helm upgrade --install \
  "$CAMUNDA_RELEASE_NAME" camunda/camunda-platform \
  --version "$HELM_CHART_VERSION" \
  --kube-context "$CLUSTER_SURVIVING" \
  --namespace "$CAMUNDA_NAMESPACE_SURVIVING" \
  -f "<generated-values-region-0|1.yaml>" \
  --set orchestration.profiles.operate=false \
  --set orchestration.profiles.tasklist=false
  ```

- [Follow the installation step for the **surviving region only**](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region#install-camunda-8-using-helm).

#### Verification

1. If the environment is exposed through an Ingress, verify that Operate and Tasklist are no longer accessible via the Ingress.
2. Check the logs of any `camunda-zeebe-X` pod to confirm that only a subset of profiles are active:

   ```bash
   kubectl --context $CLUSTER_SURVIVING logs camunda-zeebe-0 | grep "profiles are active"
   ```

   ```bash
   # The default are 5 profiles, so this confirms that Operate and Tasklist are not enabled
   io.camunda.application.StandaloneCamunda - The following 3 profiles are active: "broker", "admin", "consolidated-auth"
   ```

3. Alternatively, verify that the configuration does not list Operate and Tasklist as active profiles:

   ```bash
   kubectl --context $CLUSTER_SURVIVING get cm camunda-zeebe-configuration-unified -oyaml | grep spring -A2
   ```

   ```bash
   spring:
     profiles:
       active: "broker,admin,consolidated-auth"
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
