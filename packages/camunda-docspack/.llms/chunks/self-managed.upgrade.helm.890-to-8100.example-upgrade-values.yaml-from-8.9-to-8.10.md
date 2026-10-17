# Upgrade Camunda 8.9 to 8.10 using Helm — Example: upgrade `values.yaml` from 8.9 to 8.10

This example shows a Helm `values.yaml` for 8.9 and the same configuration after you migrate it to 8.10. It covers the most common changes: removed `global.elasticsearch` keys, the Camunda Hub consolidation, a deprecated application configuration key, and the changed issuer URL default. The Hub consolidation includes Hub sizing and pinned Pusher secrets. The Kubernetes Secrets the example references (`elasticsearch-credentials`, `web-modeler-db`, and `camunda-hub-pusher`) must exist before you upgrade.

View example values files

### before

```yaml
# =========================
# Camunda 8.9 values.yaml
# =========================

global:
  host: camunda.example.com

  # Removed in 8.10
  elasticsearch:
    enabled: true
    external: true
    url:
      protocol: https
      host: elasticsearch.example.com
      port: 443
    auth:
      username: elastic
      secret:
        existingSecret: elasticsearch-credentials
        existingSecretKey: password

  # publicIssuerUrl is not set: the 8.9 default applies
  identity:
    auth:
      console:
        redirectUrl: https://camunda.example.com/console

identity:
  enabled: true

orchestration:
  data:
    secondaryStorage:
      type: elasticsearch
  # Deprecated in 8.10
  history:
    retention:
      enabled: true
      minimumAge: 45d

optimize:
  enabled: true

console:
  enabled: true

webModeler:
  enabled: true
  restapi:
    externalDatabase:
      url: jdbc:postgresql://postgres.example.com:5432/web-modeler
      username: web-modeler
      secret:
        existingSecret: web-modeler-db
        existingSecretKey: password
    mail:
      fromAddress: noreply@example.com
```

### after

```yaml
# =========================
# Camunda 8.10 values-8.10.yaml
# =========================

global:
  host: camunda.example.com

  identity:
    auth:
      # The 8.10 default is empty; set it explicitly
      publicIssuerUrl: https://camunda.example.com/auth/realms/camunda-platform
      # global.identity.auth.console removed; it has no effect in 8.10

identity:
  enabled: true

orchestration:
  data:
    secondaryStorage:
      type: elasticsearch
      elasticsearch:
        url: https://elasticsearch.example.com:443
        auth:
          username: elastic
          secret:
            existingSecret: elasticsearch-credentials
            existingSecretKey: password
  extraConfiguration:
    - file: application-migrated.yaml
      content: |
        camunda:
          data:
            secondary-storage:
              retention:
                enabled: true
                minimum-age: 45d
              elasticsearch:
                history:
                  policy-name: camunda-history-retention-policy

optimize:
  enabled: true
  database:
    elasticsearch:
      enabled: true
      external: true
      url:
        protocol: https
        host: elasticsearch.example.com
        port: 443
      auth:
        username: elastic
        secret:
          existingSecret: elasticsearch-credentials
          existingSecretKey: password

# Replaces console and webModeler
camundaHub:
  enabled: true
  restapi:
    # Sized for Console and the Web Modeler REST API together
    resources:
      requests:
        cpu: 1900m
        memory: 2304Mi
      limits:
        cpu: 3800m
        memory: 4608Mi
    externalDatabase:
      url: jdbc:postgresql://postgres.example.com:5432/web-modeler
      username: web-modeler
      secret:
        existingSecret: web-modeler-db
        existingSecretKey: password
    extraConfiguration:
      - file: application-mail.yaml
        content: |
          camunda:
            hub:
              mail:
                from-address: noreply@example.com
    pusher:
      secret:
        existingSecret: camunda-hub-pusher
        existingSecretKey: app-secret
      client:
        secret:
          existingSecret: camunda-hub-pusher
          existingSecretKey: app-key
```

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
