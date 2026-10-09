# Configure TLS — Install-time guardrails

The chart emits these as `[camunda][warning]` messages from its constraints template while rendering `helm install` / `helm upgrade`. They also appear in the `helm status <release>` NOTES output when `global.createReleaseInfo` is enabled. Keep them in mind — some are enforced as render-time errors, others are silent precedence rules you must account for in your values:

- Per-component JKS overrides the bundle. If a component has a legacy `tls.secret` JKS configured, you must remove it to use the bundle. Legacy JKS fields take priority over `global.tls.caBundle`.
- Bundle is trust, not encryption. `global.tls.caBundle` adds CA trust but does not enable TLS on a plaintext URL. Set the URL to `https://` (or set the JDBC `sslmode`).
- `JAVA_TOOL_OPTIONS` in component `env` overrides the truststore flags. For Orchestration and Optimize, set it via `javaOpts` instead, which the chart appends its truststore flags to. Connectors, Identity, and Web Modeler restapi receive the truststore flags automatically through a dedicated `JAVA_TOOL_OPTIONS` env — do not put truststore flags in their `javaOpts` (Web Modeler restapi's `javaOpts` feeds `JAVA_OPTIONS`, a different variable, so it has no effect on trust).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls
