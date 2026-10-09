# Discover the as-is process — Discovery specialists

Discovery specialists extract insights from specific source types. The `specialists` setting determines which sources ProcessOS Harness reads.

ProcessOS Harness comes with three specialists. Future versions will have a plugin mechanism to easily add specialists. For now, the Camunda team can support you with client-specific specialists.

### Web

The web specialist searches public websites, API documentation, and product documentation. Removing the `web` specialist keeps a run entirely on internal material.

### Filesystem

The filesystem specialist searches local Markdown, PDF, BPMN, CSV, and spreadsheet files.

The `source-mode` setting controls how the filesystem specialist treats the files you list: `hint` reads them first and then searches more broadly, while `allowlist` reads only those files.

### GitHub

The GitHub specialist searches issues, pull requests, and commit history. This specialist requires the `gh` CLI.

---
Source: https://docs.camunda.io/docs/next/components/process-os-harness/run-a-project/phases/1-discovery
