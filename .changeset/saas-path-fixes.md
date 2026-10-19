---
"@bpmnkit/api": minor
"@bpmnkit/profiles": minor
"@bpmnkit/cli": patch
"@bpmnkit/proxy": patch
"@bpmnkit/docspack": patch
---

Deploying to Camunda 8 SaaS works again.

- `@bpmnkit/profiles`: `clusterApiUrl(baseUrl, path)` joins a profile's base URL and an API path, with or without `/v2` on the base URL. `casen deploy deploy --target camunda8`, the proxy's worker daemon, its webhook, timer and file-watch triggers, run-history re-runs and the MCP deploy all use it. Before, they added `/v2` to base URLs that already end in it (every profile `casen profile import` writes), so they called `/v2/v2/…` and failed.
- `@bpmnkit/api`: multipart operations take their body. `resource.createDeployment(form)`, `document.createDocument(form, query?)` and `document.createDocuments(form, query?)` take a `FormData` and send it as is. Before, they took no body and sent an empty request, which the cluster rejects; code that called them must now pass the files.
- `@bpmnkit/api`: search queries have their `filter` and `sort`, and search results have their `items`. The types used to drop the properties a schema adds to its `allOf` members, so `searchProcessInstances({ filter })` did not type-check and needed a cast.
- `@bpmnkit/cli`: `casen resource create-deployment <file...>`, `casen document create <file>` and `casen document create-2 <file...>` upload the files they are given.
- Docs: the quick start, the Camunda 8 deployment guide and the `@bpmnkit/api` page use the real API (they called `client.process.deploy`, which does not exist, against the Console API URL) and show the CLI path from a Hub credentials file to a running instance. The READMEs list the CLI's real commands: `casen profile add`, `casen deploy <file>` and `casen instances list` do not exist.
- `@bpmnkit/api`: the XML endpoints return the XML. `processDefinition.getProcessDefinitionXML(key)` resolves to `string | undefined` (undefined when the definition has no XML), `getDecisionDefinitionXML` and `getDecisionRequirementsXML` to `string`. They were typed `Promise<void>` and parsed the XML as JSON, which threw.
- `@bpmnkit/cli`: a string result (process XML, resource content) prints as is in table output, so `casen pd get-x-m-l <key> > order.bpmn` writes the file.
- `@bpmnkit/proxy`: the timer trigger is removed. Camunda 8 and Reebe fire timer start events themselves, so it started a second instance of each. The file-watch trigger now finds its `watchPath` service tasks: it read process XML by ID and as JSON, so it never found any.
