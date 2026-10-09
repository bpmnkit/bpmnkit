# Tasklist API changes

Learn how Tasklist changed in Camunda 8.10 after the removal of the legacy Tasklist V1 API.

Tasklist in Camunda 8.10 and later uses only the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).

The legacy Tasklist V1 API and the Tasklist V1 UI mode were removed in 8.10.

For the release-level summary of these removals, see the [8.10 release announcement](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/8100-announcements#removal-of-legacy-apis-tasklist-v1-dependent-features-and-zeebe-process-test).


## What changed in 8.10

- Tasklist always uses the Orchestration Cluster REST API.
- The Tasklist V1 mode toggle is no longer available in SaaS or Self-Managed clusters.
- Features that depended on Tasklist V1 are no longer available in the current version.

---
Source: https://docs.camunda.io/docs/next/components/tasklist/api-versions
