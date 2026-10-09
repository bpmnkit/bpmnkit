---
"@bpmnkit/connector-gen": patch
---

`parseOpenApi` upgrades Swagger 2.0 specs to OpenAPI 3 instead of rejecting them, so the generator accepts both (servers from `host`/`basePath`, `definitions`, body/formData parameters, responses and `securityDefinitions`). `GeneratorOptions.baseUrl` — the CLI's `--base-url` — now actually replaces the spec's server URL; it was ignored before.
