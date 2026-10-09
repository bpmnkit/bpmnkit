# Version compatibility checks — Secondary storage (Elasticsearch or OpenSearch) schema manager

Secondary storage holds exported data. Starting with Camunda 8.8, schema upgrades are designed to be backward compatible, allowing older application nodes to continue writing to newer schemas.

### When version checks are available

| Capability                                                                              | Introduced in patches   |
| --------------------------------------------------------------------------------------- | ----------------------- |
| Store schema version metadata (no enforcement)                                          | 8.6.31 / 8.7.18 / 8.8.3 |
| Enforce compatibility rules (same matrix as broker, with tolerant skips for downgrades) | 8.8.3                   |

If you upgrade from an earlier patch that does **not** store schema version metadata, the schema manager treats it as an indeterminate case (assumed fresh install) and proceeds.

### Schema manager rules

All minor version upgrades must follow the required upgrade procedure described above and proceed strictly minor-by-minor.
The schema manager compares the stored schema version (the last successful schema upgrade) with the current application version:

| Case                        | Action        | Metadata updated?    | Notes                                         |
| --------------------------- | ------------- | -------------------- | --------------------------------------------- |
| Patch upgrade               | Update schema | Yes (to new version) |                                               |
| Minor upgrade (single step) | Update schema | Yes                  |                                               |
| Minor downgrade             | Skip          | No                   | Tolerated for rolling update restarts         |
| Patch downgrade             | Skip          | No                   | Avoids churn; schema stays forward compatible |
| Skipped minor (multi-step)  | Fail startup  | No                   | Prevents unsupported jump                     |
| Alpha build involved        | Fail startup  | No                   | Must use stable releases for upgrade path     |
| Major change                | Fail startup  | No                   | Not supported                                 |

### Where the schema version is stored

The schema version metadata is stored in a dedicated metadata index. For current versions, this appears as an index named:

```text
operate-metadata-8.8.0_
```

Within that index, the document holding the current schema baseline uses the identifier:

```text
id = "schema-version"
```

The document value reflects the last successfully applied version (for example, `8.8.3`).
This value is updated only after a successful schema upgrade.  
If the document or index is missing (for example, if you upgraded from an older patch that didn’t write it), the system treats the startup as a fresh baseline and writes it after initialization.

### Failure behavior

If the schema manager detects an incompatible path, it fails fast during application startup before modifying indices. Existing indices remain unchanged.

### Rolling updates and restarts

Because schema upgrades are backward compatible from 8.8 onward, a temporary mix of versions during a rolling update is safe. Older patch or minor nodes encountering a newer stored schema version skip schema changes automatically.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/version-compatibility
