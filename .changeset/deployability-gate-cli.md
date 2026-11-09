---
"@bpmnkit/cli": minor
---

Deploy gate in the CLI. `casen generate bpmn` writes BPMN that deploys on Camunda 8, or nothing: a definition, template or patched file Zeebe would refuse prints the gate's lines (`Not deployable on Camunda <version>: <n> error(s)` and `- <id>: <message> (zeebe/<rule>)`), writes no file and exits 1. New flags `--placeholders` (fill documented placeholder values, each listed on stderr) and `--no-validate` (write it as it is). The `error-boundary`, `event-subprocess`, `timer-start` and `message-start` templates were not deployable and now are (error code, interrupting error start, a timer cycle, a message name). `casen deploy` runs the gate on a `.bpmn` file before sending it, with `--no-validate` to skip it. `casen check --deploy` adds what the gate refuses in the file's bytes (the XML schema stage included) to its findings.
