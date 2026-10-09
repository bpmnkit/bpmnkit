# Upgrade Camunda components from 8.9 to 8.10 — Component types

`console` and `keycloak` are no longer valid component types. The application will fail on startup if you've configured a `console` or `keycloak` component.

Additionally, the following component types have been renamed:

- `webModelerWebApp` → `hub`
- `orchestrationIdentity` → `admin`

The old values are still accepted for backward compatibility, but you should update your configuration to use the new values.

```yaml
camunda:
  hub:
    clusters:
      - id: camunda-platform
        # other fields...
        components:
          - name: "Console"
            type: "console" # type cannot be "console" or "keycloak"
            version: "8.10-SNAPSHOT"
            urls:
              webapp: "https://qa.ci.distro.ultrawombat.com/"
              readiness: "http://camunda-platform-console.qa-camunda-platform:9100/health/readiness"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
