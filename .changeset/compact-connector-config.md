---
"@bpmnkit/core": minor
"@bpmnkit/cli": patch
"@bpmnkit/proxy": patch
---

Connector tasks from the compact format now run on Camunda 8:

- `CompactElement` gains `inputs` (`zeebe:input` mappings, target → source) and `modelerTemplate` (`{ id, version }`). Both round-trip through `compactify()` and `expand()`, so compact edits no longer drop a connector's configuration.
- An HTTP connector task (`io.camunda:http-json:1`) with `url`, `method` or `authentication.*` in `taskHeaders` gets them as input mappings, where the connector reads them, with `authentication.type` defaulting to `noAuth`.
- For a Camunda connector job type (`io.camunda:…`), `resultVariable` becomes the `resultVariable` task header instead of an output mapping of `response`, which the connector never sets. Other job workers keep the output mapping.
- `Bpmn.restConnector()` stamps `zeebe:modelerTemplateVersion` `1`, the version of the bundled HTTP connector template, instead of `12`.
- The CLI's `generate` help and the proxy's AI prompts teach `inputs` for HTTP calls instead of task headers.
