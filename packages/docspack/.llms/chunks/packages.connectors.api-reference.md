# @bpmnkit/connectors — API Reference

| Export | Description |
|---|---|
| `listConnectors()` | Every connector in the catalog, as summaries |
| `searchConnectors(query)` | Summaries matching name, description or keywords |
| `getTemplate(id)` | The full `ElementTemplate` for an id |
| `summarizeTemplate(template)` | `ConnectorSummary` from a template you hold |
| `propertyKey(property)` | The variable name a template property binds to |
| `applyConnectorTemplate(id, values)` | Catalog template → builder options + problems |
| `applyElementTemplate(template, values)` | Template object → builder options + problems |
| `applyTemplateToElement(definitions, elementId, template, values)` | Template written onto an element of a parsed model → `{ definitions, problems }` |
| `validateElementTemplate(template)` | `{ valid, problems, warnings }` |
| `readTemplateDocument(text)` | Parse a file holding one template or many |
| `registerElementTemplates(templates)` | Merge templates into the catalog |
| `clearRegisteredTemplates()` | Drop everything registered |
| `CAMUNDA_CONNECTOR_TEMPLATES` | The 133 bundled Camunda templates, raw |
| `BPMNKIT_CONNECTOR_TEMPLATES` | The templates BPMN Kit maintains, raw |
| `findConnectorCards(query, { limit })` | Operation cards matching a request, best first |
| `connectorCards(id)` / `listConnectorCards()` | The cards of one template / of all |
| `formatConnectorCard(card, { advanced })` | A card as one prompt line |
| `connectorAlias(id)` / `templateIdForAlias(alias)` | Template id ↔ short alias |
| `CONNECTOR_ALIASES` | Alias and operation dropdowns of every bundled template |
| `applyConnectorLines(definitions, lines, { apis })` | Apply `with` lines → `{ definitions, problems, fixes, questions }` |
| `resolveConnectorLine(line, { apis })` | One `with` line → template, card, values, problems, fixes, questions |
| `connectorLineFor(element, definitions)` | An element's connector as a `with` line |
| `CONNECT_GUIDE` | System prompt teaching `with` lines |
| `selectConnectors({ text, tasks }, { perTask, total, apis })` | The cards, and API cards, to show a model for each task of a diagram |
| `formatConnectorSelection(selection)` | Picked cards as a prompt block |
| `apiServicesIn(text, summaries)` | Ids of the API-index services a text names |
| `findApiOperations(service, text, { limit })` / `rankApiOperations` | A service's endpoints that fit a task, best first |
| `formatApiCard({ service, operations })` | An API card for a prompt |
| `findApiOperation(service, method, path)` | The indexed endpoint a call names |
| `apiUrl(baseUrl, path)` / `apiAuthValues(service)` / `apiSecretNames(service)` | REST connector inputs for an indexed call |

From `@bpmnkit/connectors/node`: `discoverElementTemplates`, `collectElementTemplates`,
`DEFAULT_CONFIG_FOLDER`, `TEMPLATES_SUBFOLDER`.

---
Source: https://bpmnkit.com/docs/packages/connectors
