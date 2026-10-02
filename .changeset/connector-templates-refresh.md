---
"@bpmnkit/core": minor
"@bpmnkit/connectors": minor
---

The connector templates are refreshed from the Camunda marketplace: 133 templates, each at its newest version.

- **Newest versions, not oldest.** The update script used to take the last entry of each template's version list, which the registry orders newest first, so every template was bundled at its oldest version (the HTTP connector at 1 instead of 18). It now takes the highest version. `Bpmn.restConnector()` stamps `zeebe:modelerTemplateVersion` `18` to match.
- **20 new templates**, among them AI Agent Task and AI Agent Sub-process v2, the MCP start event, Databricks, App Integrations, AWS Bedrock AgentCore, and O365 email inbound events. The three IDP extraction templates are no longer in the registry and are gone.
- **`zeebe:agentDefinition`** (Camunda 8.10) is a supported binding. It is applied by `applyConnectorTemplate`, `applyElementTemplate` and `applyTemplateToElement`. `ServiceTaskOptions` and `AdHocSubProcessOptions` take `agentDefinition: { agentType }`, `ZeebeExtensions` has `agentDefinition`, and `getZeebeExtensions()` reads it.
- **`Configuration` properties** (Camunda 8.10 reusable connection credentials) validate. They bind like any input, and `TemplateProperty.configurationTemplate` names the credential kind.
- **Renamed input keys.** Newer inbound templates give their properties explicit ids, so their input keys changed, e.g. `message.correlationKey` → `correlationKeyProcess`, `correlationKeyExpression` → `correlationKeyPayload`, `message.name` → `messageNameUuid`. The bindings are unchanged.
