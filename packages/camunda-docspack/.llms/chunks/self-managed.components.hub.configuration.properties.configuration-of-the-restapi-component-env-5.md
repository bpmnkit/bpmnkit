# Property reference — Configuration of the `restapi` component — env

```bash
CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_0_NAME='Orchestration Cluster'
CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_0_TYPE=orchestration
CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_0_VERSION=8.10-SNAPSHOT
CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_0_URLS_GRPC=grpcs://camunda.example.com:26500
CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_0_URLS_REST=https://camunda.example.com
CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_0_URLS_READINESS=https://camunda.example.com:9600/core/actuator/health/readiness

CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_1_NAME='Orchestration Admin'
CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_1_TYPE=admin
CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_1_VERSION=8.10-SNAPSHOT
CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_1_URLS_WEBAPP=https://camunda.example.com
CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_1_URLS_READINESS=https://camunda.example.com:9600/core/actuator/health/readiness
```

#### Mark a cluster as production

This step is optional. Tag a cluster with `prod` only if you want Camunda Hub to treat its environments as production environments. Camunda Hub treats an environment as a production environment if the tags of its cluster include `prod`. The match is exact and case-sensitive, so `prod` works but `Prod` and `production` don't. All Physical Tenants of a cluster tagged `prod` are production environments. See the [project deployment settings](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeler-settings#project-deployment).

```yaml
camunda:
  hub:
    clusters:
      - id: camunda-platform
        # other fields...
        tags: ["prod"]
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
