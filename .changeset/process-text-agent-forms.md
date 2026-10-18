---
"@bpmnkit/core": minor
---

The process-text format reads and writes what an AI Agent chat needs: `form=<id>` on start and user nodes, `in.<name>=` and `out.<name>=` mappings, `# Name | camunda=8.10` for the target platform, `adhoc` containers with `inside=` tools, `note <id>: text` annotations and `doc <id>: text` documentation (an agent tool's description). A mapping value stops at a following `|` or `,`, a title tail that is not `camunda=…` stays in the name, and an unknown `inside=` resolves to the only ad-hoc sub-process. `compactify` keeps node outputs, a connector's `\n` in a `==` value is a line break, and `patchElement` sets form, mapping and documentation fields.
