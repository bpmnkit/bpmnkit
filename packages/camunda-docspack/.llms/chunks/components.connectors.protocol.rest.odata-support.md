# REST connector — OData support

The **REST connector** supports JSON-based [OData protocol](https://www.odata.org/).

### Requesting resources

Requesting resources works the same way regular REST requests work:

1. Under the **HTTP Endpoint** section, select the desired **Method**.
2. Fill in the **URL** with your desired REST API.
3. Depending on your provider, you may also need to set `OData-Version` and `OData-MaxVersion` headers.

### Requesting an individual resource

Similar to requesting resources, to request an individual resource you need to have a process variable. Use a FEEL string concatenation function
when building **URL**, e.g. `="https://my.odata.service/v4/Service/Resource('" + resourceId + "')"`.

### Queries

Additionally, if your provider supports OData queries, such as `$top`, you can use these when defined in the **Query parameters** field, e.g. `={"$top": 3, "$select": "FirstName, LastName"}`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/rest
