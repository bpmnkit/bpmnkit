---
"@bpmnkit/cli-legacy": minor
"@bpmnkit/cli-sdk": minor
"@bpmnkit/create-bpmnkit-plugin": minor
"@bpmnkit/create-casen-plugin": patch
"@bpmnkit/docspack": patch
---

The Node CLI is now `@bpmnkit/cli-legacy` (bin `bpmnkit-legacy`), the fallback behind the native `bpmnkit` binary that `@bpmnkit/cli` 2.0 installs. Help text, docs and examples say `bpmnkit`; `casen` is an alias. `@bpmnkit/cli-sdk` exports `BpmnkitPlugin` (`CasenPlugin` stays as an alias), and `@bpmnkit/create-bpmnkit-plugin` is the new name of the plugin scaffolder.
