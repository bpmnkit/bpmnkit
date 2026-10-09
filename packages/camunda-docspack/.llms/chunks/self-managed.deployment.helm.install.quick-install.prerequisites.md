# Install Camunda with Helm for development — Prerequisites

- **Kubernetes cluster**: A functioning Kubernetes cluster with [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) access and block-storage persistent volumes for stateful components.
- **Helm**: The Helm CLI v4 installed. See [Installing Helm](https://helm.sh/docs/intro/install/).


## Orchestration Cluster only

The Helm chart deploys the Camunda Orchestration Cluster with **Basic authentication** and **RDBMS** as secondary storage (using embedded H2 when no external database URL is provided), intended only for testing and development. No external database or identity provider is required.

**Warning: H2 topology limitations**
Embedded H2 is non-production only and valid only with a single broker and a single partition.

Do not run embedded H2 with a multi-broker Helm topology. H2 is local to each broker and does not provide shared secondary storage, which can cause incomplete or inconsistent query results.

In production, Camunda 8 is typically deployed together with additional components such as Optimize, Web Modeler, and Console, which require OIDC-based authentication and external databases. For a full local deployment with all components, follow our [kind tutorial](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind).

1. **Create a namespace to install the platform on Kubernetes:**

   ```bash
   kubectl create namespace orchestration
   ```

   Output:

   ```bash
   namespace/orchestration created
   ```

2. **Add the Helm repository:**

   To install the Camunda 8 Self-Managed [Helm chart](https://helm.sh/docs/topics/charts/), add the [Helm repository](https://helm.sh/docs/topics/chart_repository/) with the following command:

   ```bash
   helm repo add camunda https://helm.camunda.io
   helm repo update
   ```

3. **Install the Helm chart:**

   ```bash
   helm install camunda camunda/camunda-platform \
     --set orchestration.exporters.rdbms.enabled=true \
     --set orchestration.clusterSize=1 \
     --set orchestration.partitionCount=1 \
     --set orchestration.replicationFactor=1 \
     --set-string 'orchestration.env[0].name=CAMUNDA_PERSISTENT_SESSIONS_ENABLED' \
     --set-string 'orchestration.env[0].value=false' \
     -n orchestration
   ```

This enables the RDBMS exporter with embedded H2 as secondary storage. The cluster is configured with a single broker, a single partition, and a replication factor of 1. The replication factor must be less than or equal to the cluster size. For a single-broker cluster, the only valid replication factor is 1.

The embedded H2 database is local to each broker. Running multiple brokers would result in separate, independent databases and incomplete query results.

If you need multiple brokers, switch to a shared external backend (for example, PostgreSQL) instead of H2.

If you already have an invalid H2 setup:

1. For local/dev use, reduce to `clusterSize=1`, `partitionCount=1`, `replicationFactor=1` and use file-based H2.
2. For clustered use, migrate secondary storage to an external persistent backend.

Starting with Camunda 8.9, the Helm chart no longer provisions Elasticsearch by default. You must explicitly enable a secondary storage backend (RDBMS, Elasticsearch, or OpenSearch) in your Helm values.

   <!-- TODO before 8.9 GA:
     The install command below includes a temporary workaround:
       --set-string orchestration.env[0].name=CAMUNDA_PERSISTENT_SESSIONS_ENABLED
       --set-string orchestration.env[0].value=false

     Why: The Helm chart (PR #5098) now enables persistent web sessions for RDBMS,
     but the application image does not yet include the PersistentWebSessionClient
     bean for the RDBMS backend. This causes a Spring bean injection failure
     (NoSuchBeanDefinitionException: PersistentWebSessionClient) at startup,
     crashing all Zeebe brokers in CrashLoopBackOff.

     The env var override disables persistent sessions until the app catches up.

     Before GA:
     - Remove the workaround once the app image supports persistent sessions with RDBMS
       (tracking: https://github.com/camunda/camunda-platform-helm/issues/5099)
     - Replace the install command with:
       ```
       helm install camunda camunda/camunda-platform \
         --set orchestration.exporters.rdbms.enabled=true \
         --set orchestration.clusterSize=1 \
         --set orchestration.partitionCount=1 \
         --set orchestration.replicationFactor=1 \
         -n orchestration
       ```
     - Confirm the Connectors service port in the chart NOTES matches the actual port (currently NOTES say 8086, service is 8080)
     - Validate that a plain `helm install` without any `--set` gives a clear error message guiding the user to choose a secondary storage
   -->

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install
