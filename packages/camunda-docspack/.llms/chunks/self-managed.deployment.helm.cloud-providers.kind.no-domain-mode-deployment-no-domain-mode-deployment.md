# Deploy Camunda 8 to a local kind cluster — No-domain mode deployment {#no-domain-mode-deployment}

This section covers the simplified setup using port-forwarding without TLS.

### Deploy prerequisite services

Before deploying Camunda, you need to deploy the external services it depends on. These dependencies are deployed using Kubernetes operators as described in [Deploy infrastructure with Kubernetes operators](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure):

- Elasticsearch via [ECK (Elastic Cloud on Kubernetes)](https://www.elastic.co/guide/en/cloud-on-k8s/current/index.html) — used as secondary storage in this guide
- PostgreSQL via [CloudNativePG](https://cloudnative-pg.io/)
- Keycloak via the [Keycloak Operator](https://www.keycloak.org/operator/installation)

Run the operator deployment script, specifying the no-domain deployment mode:

```bash
CAMUNDA_MODE=no-domain ./procedure/operators-deploy.sh
```

This script installs each operator and its custom resources, then waits for all instances to be ready. When `SECONDARY_STORAGE=postgres`, the ECK operator and Elasticsearch cluster are skipped, and an additional PostgreSQL cluster (`pg-camunda`) is deployed for RDBMS secondary storage.

### Configure your hosts file for Keycloak

The Keycloak operator configures Keycloak with `keycloak-service` as its hostname. The JWT tokens issued by Keycloak use this hostname in the `iss` claim. To ensure your browser can resolve this hostname during the OIDC login flow, add the following entry to your `/etc/hosts` file:

```text
127.0.0.1  keycloak-service
```

Alternatively, you can run `make hosts.add-keycloak` to add this entry automatically.

After adding this entry and deploying Camunda 8 in the next step, you'll be able to reach Keycloak at `http://keycloak-service:18080/auth`.

**Why port `18080`?** The Keycloak instance is configured to listen on port `18080` (via `httpPort` in the operator CR) to avoid conflicts with the Zeebe Gateway HTTP endpoint, which uses port `8080` locally.

### Create identity secrets

Before deploying Camunda, create the `camunda-credentials` Kubernetes secret with randomly generated credentials for all identity components. This secret is required by the Helm chart to configure authentication between Camunda components:

```bash
./procedure/create-identity-secrets.sh
```

See the create-identity-secrets.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/create-identity-secrets.sh
```

This script generates random passwords and tokens for Connectors, Console, Web Modeler, Orchestration, Optimize, and the admin user, then stores them in the `camunda-credentials` secret in the `camunda` namespace.

### Deploy Camunda 8

Deploy Camunda 8 with the no-domain mode Helm values. The deployment script layers the [operator-based Helm values](https://github.com/camunda/camunda-deployment-references/tree/main/generic/kubernetes/operator-based) to connect Camunda to the external PostgreSQL and Keycloak instances, and to the secondary storage backend you selected:

```bash
./procedure/camunda-deploy-no-domain.sh
```

The script selects the appropriate Helm values based on your [exported `SECONDARY_STORAGE`](#secondary-storage-options) value. With `elasticsearch`, it includes the Elasticsearch values overlay. With `postgres`, it includes the RDBMS values overlay and disables Elasticsearch and Optimize.

Deploy script source

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/camunda-deploy-no-domain.sh
```

This uses the following Helm values:

No-domain mode Helm values (kind-specific)

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/helm-values/values-no-domain.yml
```

Operator-based Helm values (external Elasticsearch, PostgreSQL, Keycloak)

The deployment script layers the following shared operator values before the kind-specific values:

- [`camunda-elastic-values.yml`](https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/elasticsearch/camunda-elastic-values.yml): Connects Camunda to the ECK-managed Elasticsearch (Elasticsearch secondary storage only).
- [`camunda-rdbms-values.yml`](https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/postgresql/camunda-rdbms-values.yml): Configures PostgreSQL RDBMS as secondary storage and disables Elasticsearch and Optimize (PostgreSQL secondary storage only).
- [`camunda-keycloak-no-domain-values.yml`](https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/keycloak/camunda-keycloak-no-domain-values.yml): Connects Camunda to the operator-managed Keycloak (no-domain mode).
- [`camunda-identity-values.yml`](https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/postgresql/camunda-identity-values.yml): Configures Identity to use the CloudNativePG PostgreSQL.
- [`camunda-hub-values.yml`](https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/postgresql/camunda-hub-values.yml): Configures Camunda Hub to use the CloudNativePG PostgreSQL.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
