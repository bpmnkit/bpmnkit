---
"@bpmnkit/cli": minor
---

`casen test` runs Camunda process-test JSON files on reebe. It finds `<name>.test.json` next to the BPMN (after `<file>.tests.json`), and a repeatable `--case <name>` runs only the named test cases. A failing case names the instruction that failed. `-s` now selects the scenarios file (it was ignored), `casen test <file>` works as well as `casen test test <file>`, and `--case` with a legacy scenario file prints a notice.
