# Upgrade Camunda components from 8.9 to 8.10 — application.yaml

| Web Modeler (8.9 and earlier)                     | Camunda Hub (8.10)                        |
| ------------------------------------------------- | ----------------------------------------- |
| `camunda.marketplace.enabled`                     | `camunda.hub.feature.marketplace-enabled` |
| `camunda.modeler.feature.play-enabled`            | `camunda.hub.feature.test-mode-enabled`   |
| `camunda.modeler.security.jwt.issuer.backend-url` | `camunda.identity.issuer-backend-url`     |
| `camunda.modeler.oauth2.token.username-claim`     | `camunda.identity.username-claim`         |
| `logging.level.io.camunda.modeler`                | `logging.level.io.camunda.hub`            |

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
