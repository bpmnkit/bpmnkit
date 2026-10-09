# Code Conversion — API mapping guide

The Camunda 7 and Camunda 8 Orchestration Cluster APIs share many similarities, but several aspects have been modernized in Camunda 8.

### Key structural changes

Streamlined search endpoints:

- **Camunda 7**: Separate endpoints like `GET /resource` and `GET /resource/count`
- **Camunda 8**: Single `POST /search` endpoint with filtering capabilities

Tenant handling:

- **Camunda 7**: `tenantId` passed as path parameter with multiple endpoint variants
- **Camunda 8**: `tenantId` passed in request body, simplifying the API surface

History data:

- **Camunda 7**: Separate endpoints for historic data (for example, HistoryService)
- **Camunda 8**: No separate historic endpoints; history is managed through Operate

### Using the interactive mapping tool

To help you understand the differences between the two APIs, we provide an interactive web application that maps the complete Camunda 7 REST API to its Camunda 8 counterparts. The tool shows:

- Direct mappings: Camunda 7 endpoints that map one-to-one to Camunda 8
- Conceptual mappings: Functionality that exists in Camunda 8 but works differently
- Roadmap items: Features planned for future Camunda 8 releases
- Discontinued features: Camunda 7 endpoints that are no longer available and why

[Open the API Mapping Guide](https://camunda.github.io/camunda-7-to-8-migration-tooling/).

**Tip: When to use this tool**
Use the API mapping guide to:

- Quickly find Camunda 8 equivalents for Camunda 7 API calls
- Understand why certain parameters or endpoints changed
- Check if a planned feature is on the roadmap
- Plan your migration strategy based on API availability

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion
