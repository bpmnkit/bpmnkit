# Camunda 8.10 APIs & Tools migration guide — Deprecations

Review the actions required for the following deprecations:

### Deprecated: GET resource content API {#deprecated-get-resource-content}

The [Get resource content] endpoint is deprecated. Use [Get resource content binary] instead, which provides the same functionality and also returns generic resources.


## Next steps

Once you have completed the [upgrade steps](#upgrade-steps) in this guide, you should:

1. Re-compile and run your test suite against the 8.10 API.

<!--- 1. Review [8.10 release announcements](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/8100-announcements) for additional context on each change. --->

[Get resource]: ../orchestration-cluster-api-rest/specifications/get-resource.api.mdx
[Get resource content]: ../orchestration-cluster-api-rest/specifications/get-resource-content.api.mdx
[Get resource content binary]: ../orchestration-cluster-api-rest/specifications/get-resource-content-binary.api.mdx

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-810
