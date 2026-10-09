# Property reference — Security — CSRF protection and HTTP security headers

The chart has no dedicated Helm values for CSRF protection or HTTP security headers. Set the `camunda.security.csrf.*` and `camunda.security.http-headers.*` application properties listed in the **Application properties** tab through `orchestration.extraConfiguration` instead:

```yaml
orchestration:
  extraConfiguration:
    - file: security-headers.yaml
      content: |
        camunda:
          security:
            csrf:
              enabled: true
            http-headers:
              hsts:
                enabled: true
                max-age-in-seconds: 31536000
                include-subdomains: true
```

Leaving `content-security-policy` out, as above, keeps the shipped policy in place — see **Default Content Security Policy** in the **Application properties** tab. Setting `content-security-policy.policy-directives` replaces that policy wholesale rather than adding to it, so a minimal value such as `default-src 'self'` drops the sources the web applications need and breaks the UIs. Start from the default policy and adjust it.

<!-- No link to "Default Content Security Policy" in the Application properties tab: the Tabs component on this page has no groupId or lazy prop, so inactive tab panels stay hidden in the DOM and an anchor into one resolves at build time but doesn't navigate for the reader. -->

For how the file is mounted and imported, see [application configuration with `extraConfiguration`](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs#how-extraconfiguration-works-per-component).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
