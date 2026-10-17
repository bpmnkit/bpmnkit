# Migration journey — When to migrate?

Any new projects should already be started using Camunda 8.

For Camunda 7 solutions, understand the support timeline for the Camunda 7 product:

- **Camunda 7 CE** (Community Edition) will EOL (end of life) in **October 2025** with a final release (v7.24) on Oct 14, 2025.
- There will be no more Camunda 7 CE releases after that date, and the GitHub repo will be archived. The code will still be available, but issues and pull requests will be closed, and the README will reflect the EOL status.
- **Camunda 7 EE** (Enterprise Edition) customers will continue to get **patch releases** (security patches & bug fixes) on a rolling basis **till at least 2030**.
- Camunda 7 CE users could switch to Camunda 7 EE to benefit from this long-term support to have enough time for migration.

While there is some urgency to start migration efforts, you are not yet under hard pressure.

Migrating to Camunda 8 gives you additional advantages, which might raise priority for your solution if:

- You want to leverage a SaaS offering (for example, to reduce the effort for hardware or infrastructure setup and maintenance).
- You need performance at scale and/or improved resilience.
- You need certain features that can only be found in Camunda 8 (for example, BPMN message buffering, improved multi-instance handling, the new connectors framework, RPA, IDP, or the improved collaboration features in Camunda Hub).

<!-- TODO Link to conceptual differences -->

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-journey
