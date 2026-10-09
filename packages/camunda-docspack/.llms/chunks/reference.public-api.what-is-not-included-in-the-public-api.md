# Camunda 8 public API — What is not included in the public API

Some APIs are excluded from the public API by design. While we aim for stability, they may evolve more quickly or follow different lifecycles.

Only the APIs listed in [Included in the public API](#included-in-the-public-api) are covered by SemVer guarantees. All others are considered outside the public API. The [excluded APIs listed below](#excluded-apis) are commonly used, but this list is not exhaustive.

### Alpha endpoints within the public API

Some endpoints in otherwise stable APIs are marked as [alpha features](https://docs.camunda.io/docs/next/components/early-access/alpha/alpha-features) and are **not** included in the public API guarantee.

Alpha endpoints:

- Are clearly marked in API docs.
- May introduce breaking changes in minor or patch releases.
- Follow the [alpha feature policy](https://docs.camunda.io/docs/next/components/early-access/alpha/alpha-features#alpha) rather than SemVer.
- Are released for early feedback before general availability.

Check the API documentation before building on any alpha endpoint.

### Excluded APIs

The following APIs are **explicitly excluded** from the public API:

- [Camunda Hub API](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/overview): Manage workspaces, projects, files, folders,
  versions, and members in Camunda Hub programmatically.
- [Web Modeler API](https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/index): Used for browser-based modeling.
- [Administration API](https://docs.camunda.io/docs/next/apis-tools/administration-api/administration-api-reference): For administrative operations and system configuration.
- [Optimize API](https://docs.camunda.io/docs/next/apis-tools/optimize-api/overview): Used for analytics, reporting, and performance insights.
- [Orchestration Cluster MCP Server](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-mcp/orchestration-cluster-api-mcp-overview): Exposes Camunda capabilities through the Model Context Protocol. Tool schemas and behavior may evolve across versions.

### Policy for non-public APIs

Though not covered by the public API contract, we aim to provide a consistent experience. For non-public APIs, we commit to:

- Following API versioning best practices.
- Announcing deprecations at least two minor versions in advance (for example, deprecated in 8.9, removed no earlier than 8.11).
- Avoiding breaking changes to configuration, endpoints, or backup-related features within the same minor release range.

This balance allows continuous improvement to tools like Web Modeler and Console, while preserving stability for orchestration logic.

---
Source: https://docs.camunda.io/docs/next/reference/public-api
