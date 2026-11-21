# @bpmnkit/create-bpmnkit-plugin

## 0.2.0

### Minor Changes

- b638979: The Node CLI is now `@bpmnkit/cli-legacy` (bin `bpmnkit-legacy`), the fallback behind the native `bpmnkit` binary that `@bpmnkit/cli` 2.0 installs. Help text, docs and examples say `bpmnkit`; `casen` is an alias. `@bpmnkit/cli-sdk` exports `BpmnkitPlugin` (`CasenPlugin` stays as an alias), and `@bpmnkit/create-bpmnkit-plugin` is the new name of the plugin scaffolder.

### Patch Changes

- Updated dependencies [b638979]
  - @bpmnkit/create-casen-plugin@0.0.13
