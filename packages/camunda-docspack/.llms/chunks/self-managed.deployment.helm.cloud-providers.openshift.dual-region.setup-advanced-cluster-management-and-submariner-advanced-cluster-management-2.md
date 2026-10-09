# Red Hat OpenShift Dual-Region — Setup Advanced Cluster Management and Submariner — Advanced Cluster Management (2)

```yaml reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/managed-cluster-set.yml
   ```

   Save this manifest as `managed-cluster-set.yml` then apply it to enable ACM:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/install-managed-cluster-set.sh
   ```

   Verify that the ManagedClusterSet has been created, at this step, only `local-cluster` will be listed:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/verify-managed-cluster-set.sh
   ```

5. After creating the Managed Cluster Set, the next step is to import clusters into the set.
   - To import a cluster, you need to template the manifest for each cluster.

     Save the following file as `managed-cluster.yml.tpl`:

     ```yaml reference
     https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/managed-cluster.yml.tpl
     ```

   - The cluster’s associated addon configuration will be managed using the following manifest.

     Save it as `klusterlet-config.yml.tpl`:

     ```yaml reference
     https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/klusterlet-config.yml.tpl
     ```

   - To import a cluster, you must store the associated authentication token.

     Save the following file as `auto-import-cluster-secret.yml.tpl`:

     ```yaml reference
     https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/auto-import-cluster-secret.yml.tpl
     ```

   - If running on Red Hat OpenShift Service on AWS (ROSA), the following addition is required to ensure certificates are trusted.

     Save the following file as `klusterlet-global-config.yml`:

     ```bash reference
     https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/klusterlet-global-config.yml
     ```

   - Finally, import the target cluster into the Managed Cluster Set and verify that they can be reached and managed successfully:

     ```bash reference
     https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/initiate-cluster-set.sh
     ```

   - Once all the clusters are imported, verify that all of them are available and reachable:

     ```bash reference
     https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/acm/verify-managed-cluster-set.sh
     ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
