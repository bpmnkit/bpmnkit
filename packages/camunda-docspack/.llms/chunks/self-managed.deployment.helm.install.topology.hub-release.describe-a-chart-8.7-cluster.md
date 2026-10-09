# Install the Camunda Hub release — Describe a chart 8.7 cluster

**Note: Minimum chart versions**
This page needs Helm chart 15.0.0 or later for 8.10 releases. For the minimum chart version per Camunda version, see [release roles](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index#release-roles).

An 8.10 Hub manages Orchestration Cluster releases on the 8.7, 8.8, 8.9, and 8.10 charts. Records for 8.8, 8.9, and 8.10 clusters all take the standard shape shown above. To connect releases that already run, see [connect existing clusters to Hub](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters).

Chart 8.7 predates the unified Orchestration Cluster, so it runs Zeebe, Zeebe Gateway, Operate, and Tasklist as separate workloads on separate services. Its record needs `architecture: legacy` and the names of those services:

```yaml
global:
  topology:
    mode: hub
    clusters:
      - id: legacy-a
        name: Legacy A
        namespace: orchestration-legacy
        releaseName: camunda
        host: legacy-a.example.com
        version: "8.7.38"
        architecture: legacy
        contextPaths:
          orchestration: ""
          optimize: /optimize
          connectors: /connectors
        components:
          orchestration:
            enabled: true
            clientId: orchestration-legacy-a
            audience: orchestration-legacy-a-api
            redirectUrl: https://legacy-a.example.com
            serviceName: camunda-zeebe
            gatewayServiceName: camunda-zeebe-gateway
            operateServiceName: camunda-operate
            tasklistServiceName: camunda-tasklist
            restUrl: http://camunda-zeebe-gateway.orchestration-legacy.svc.cluster.local:8080/zeebe
            readinessUrl: http://camunda-zeebe-gateway.orchestration-legacy.svc.cluster.local:9600/zeebe/actuator/health/readiness
            secret:
              existingSecret: orchestration-legacy-a-oidc
              existingSecretKey: client-secret
```

`architecture: legacy` changes two things in the generated inventory. It addresses the split Operate, Tasklist, and Zeebe Gateway services instead of one Orchestration Cluster service, and it omits the Orchestration Admin component, which chart 8.7 doesn't have. It also omits the cluster's `authorizations` block.

The service names depend on that release's own release name, so adjust them if it isn't `camunda`.

For the workload side of a chart 8.7 release, see [requirements by chart version](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release#requirements-by-chart-version).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release
