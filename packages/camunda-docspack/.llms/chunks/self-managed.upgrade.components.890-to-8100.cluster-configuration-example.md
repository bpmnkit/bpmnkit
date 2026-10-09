# Upgrade Camunda components from 8.9 to 8.10 — Cluster configuration example

Console 8.9 configuration:

```yaml
camunda:
  console:
    managed:
      releases:
        - name: camunda-platform
          namespace: qa-camunda-platform
          version: 8.9.0
          tags:
            - dev
          custom-properties:
            - description: "Monitoring"
              links:
                - name: "Grafana"
                  url: "http://localhost:3000"
                - name: "Prometheus"
                  url: "http://localhost:9090"
            - description: "Documentation"
              links:
                - name: "Wiki"
                  url: "http://localhost:8090/wiki"
          components:
            - name: camunda-platform
              namespace: camunda-platform-namespace
              version: 9.1.2
              components:
                - name: Console
                  id: console
                  version: 8.9-SNAPSHOT
                  url: https://qa.ci.distro.ultrawombat.com/
                  readiness: http://camunda-platform-console.qa-camunda-platform:9100/health/readiness
                  metrics: http://camunda-platform-console.qa-camunda-platform:9100/prometheus
                - name: Keycloak
                  id: keycloak
                  url: https://qa.ci.distro.ultrawombat.com/auth/
                - name: Identity
                  id: identity
                  version: SNAPSHOT
                  url: https://qa.ci.distro.ultrawombat.com/identity
                  readiness: http://camunda-platform-identity.qa-camunda-platform:82/actuator/health
                  metrics: http://camunda-platform-identity.qa-camunda-platform:82/actuator/prometheus
                - name: WebModeler
                  id: webModelerWebApp
                  version: SNAPSHOT
                  url: https://qa.ci.distro.ultrawombat.com/modeler
                  readiness: http://camunda-platform-web-modeler-restapi.qa-camunda-platform:8091/modeler/health/readiness
                  metrics: http://camunda-platform-web-modeler-restapi.qa-camunda-platform:8091/modeler/metrics
                - name: Optimize
                  id: optimize
                  version: 8.9-SNAPSHOT
                  url: https://qa.ci.distro.ultrawombat.com/optimize
                  readiness: http://camunda-platform-optimize.qa-camunda-platform:80/optimize/api/readyz
                  metrics: http://camunda-platform-optimize.qa-camunda-platform:8092/actuator/prometheus
                - name: Connectors
                  id: connectors
                  version: 8.9-SNAPSHOT
                  url: http://camunda-platform-connectors.qa-camunda-platform:8080/connectors
                  readiness: http://camunda-platform-connectors.qa-camunda-platform:8080/connectors/actuator/health/readiness
                  metrics: http://camunda-platform-connectors.qa-camunda-platform:8080/connectors/actuator/prometheus
                - name: Operate
                  id: operate
                  version: 8.9-SNAPSHOT
                  url: https://qa.ci.distro.ultrawombat.com/core/operate
                  readiness: http://camunda-platform-zeebe.qa-camunda-platform:9600/core/actuator/health/readiness
                  metrics: http://camunda-platform-zeebe.qa-camunda-platform:9600/core/actuator/prometheus
                - name: Tasklist
                  id: tasklist
                  version: 8.9-SNAPSHOT
                  url: https://qa.ci.distro.ultrawombat.com/core/tasklist
                  readiness: http://camunda-platform-zeebe.qa-camunda-platform:9600/core/actuator/health/readiness
                  metrics: http://camunda-platform-zeebe.qa-camunda-platform:9600/core/actuator/prometheus
                - name: Orchestration Admin
                  id: orchestrationIdentity
                  version: 8.9-SNAPSHOT
                  url: https://qa.ci.distro.ultrawombat.com/core/admin
                  readiness: http://camunda-platform-zeebe.qa-camunda-platform:9600/core/actuator/health/readiness
                  metrics: http://camunda-platform-zeebe.qa-camunda-platform:9600/core/actuator/prometheus
                - name: Orchestration Cluster
                  id: orchestration
                  version: 8.9-SNAPSHOT
                  urls:
                    grpc: https://grpc-qa.ci.distro.ultrawombat.com
                    http: https://qa.ci.distro.ultrawombat.com/core
                    readiness: http://camunda-platform-zeebe.qa-camunda-platform:9600/core/actuator/health/readiness
                    metrics: http://camunda-platform-zeebe.qa-camunda-platform:9600/core/actuator/prometheus
```

Camunda Hub 8.10 configuration:

```yaml
camunda:
  hub:
    clusters:
      - id: "camunda-platform"
        name: "camunda-platform"
        namespace: "qa-camunda-platform"
        version: "8.10.0"
        authentication: BEARER_TOKEN
        authorizations:
          enabled: true
        tags:
          - "dev"
        custom-properties:
          - description: "Monitoring"
            links:
              - name: "Grafana"
                url: "http://localhost:3000"
              - name: "Prometheus"
                url: "http://localhost:9090"
          - description: "Documentation"
            links:
              - name: "Wiki"
                url: "http://localhost:8090/wiki"
        components:
          - name: "Identity"
            type: "identity"
            version: "8.10-SNAPSHOT"
            urls:
              webapp: "https://qa.ci.distro.ultrawombat.com/identity"
              readiness: "http://camunda-platform-identity.qa-camunda-platform:82/actuator/health"
          - name: "Camunda Hub"
            type: "hub"
            version: "8.10-SNAPSHOT"
            urls:
              webapp: "https://qa.ci.distro.ultrawombat.com/modeler"
              readiness: "http://camunda-platform-web-modeler-restapi.qa-camunda-platform:8091/modeler/health/readiness"
          - name: "Optimize"
            type: "optimize"
            version: "8.10-SNAPSHOT"
            urls:
              webapp: "https://qa.ci.distro.ultrawombat.com/optimize"
              readiness: "http://camunda-platform-optimize.qa-camunda-platform:80/optimize/api/readyz"
          - name: "Connectors"
            type: "connectors"
            version: "8.10.0"
            urls:
              rest: "http://camunda-platform-connectors.qa-camunda-platform:8080/connectors"
              readiness: "http://camunda-platform-connectors.qa-camunda-platform:8080/connectors/actuator/health/readiness"
          - name: "Operate"
            type: "operate"
            version: "8.10-SNAPSHOT"
            urls:
              webapp: "https://qa.ci.distro.ultrawombat.com/core/operate"
              readiness: "http://camunda-platform-zeebe.qa-camunda-platform:9600/core/actuator/health/readiness"
          - name: "Tasklist"
            type: "tasklist"
            version: "8.10-SNAPSHOT"
            urls:
              webapp: "https://qa.ci.distro.ultrawombat.com/core/tasklist"
              readiness: "http://camunda-platform-zeebe.qa-camunda-platform:9600/core/actuator/health/readiness"
          - name: "Orchestration Admin"
            type: "admin"
            version: "8.10-SNAPSHOT"
            urls:
              webapp: "https://qa.ci.distro.ultrawombat.com/core/admin"
              readiness: "http://camunda-platform-zeebe.qa-camunda-platform:9600/core/actuator/health/readiness"
          - name: "Orchestration Cluster"
            type: "orchestration"
            version: "8.10-SNAPSHOT"
            urls:
              grpc: "https://grpc-qa.ci.distro.ultrawombat.com"
              rest: "https://qa.ci.distro.ultrawombat.com/core"
              readiness: "http://camunda-platform-zeebe.qa-camunda-platform:9600/core/actuator/health/readiness"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
