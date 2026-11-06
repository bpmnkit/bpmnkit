---
"@bpmnkit/core": minor
"@bpmnkit/cli": patch
"@bpmnkit/docspack": patch
---

Camunda 8.10 is now the default target: the BPMN builder stamps `executionPlatformVersion` `8.10.0` (was `8.9.0`), the form builder `8.10.0` (was `8.7.0`), the DMN builders `8.10.0` (was `8.5.0`) and the Camunda 7 migration `8.10.0` (was `8.8.0`). `.executionPlatformVersion("8.8.0")` and the migration's `executionPlatformVersion` option still override it. The agent cards no longer warn that 8.10 is not the default.
