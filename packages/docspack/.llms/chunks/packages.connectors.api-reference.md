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
| `CAMUNDA_CONNECTOR_TEMPLATES` | The 133 bundled templates, raw |
| `findConnectorCards(query, { limit })` | Operation cards matching a request, best first |
| `connectorCards(id)` / `listConnectorCards()` | The cards of one template / of all |
| `formatConnectorCard(card, { advanced })` | A card as one prompt line |
| `connectorAlias(id)` / `templateIdForAlias(alias)` | Template id ↔ short alias |
| `CONNECTOR_ALIASES` | Alias and operation dropdowns of every bundled template |
| `applyConnectorLines(definitions, lines)` | Apply `with` lines → `{ definitions, problems, fixes, questions }` |
| `resolveConnectorLine(line)` | One `with` line → template, card, values, problems, fixes |
| `connectorLineFor(element, definitions)` | An element's connector as a `with` line |
| `CONNECT_GUIDE` | System prompt teaching `with` lines |
| `selectConnectors({ text, tasks }, { perTask, total })` | The cards to show a model for each task of a diagram |
| `formatConnectorSelection(selection)` | Picked cards as a prompt block |

From `@bpmnkit/connectors/node`: `discoverElementTemplates`, `collectElementTemplates`,
`DEFAULT_CONFIG_FOLDER`, `TEMPLATES_SUBFOLDER`.

---
Source: https://bpmnkit.com/docs/packages/connectors
