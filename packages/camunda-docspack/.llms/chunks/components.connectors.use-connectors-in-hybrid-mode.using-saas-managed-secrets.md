# Use connectors in hybrid mode — Using SaaS-managed secrets

If you add the `Secrets` scope to your API client, you can access [SaaS-managed secrets](https://docs.camunda.io/docs/next/reference/glossary#saas-managed-secret) as [legacy secret references](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#using-secrets) in a hybrid setup.

Enable the SaaS secret provider via an environment variable or in your application config file:

**Environment variable:**

```
CAMUNDA_CONNECTOR_SECRETPROVIDER_CONSOLE_ENABLED = true
```

**Properties file:**

```
camunda.connector.secretprovider.console.enabled = true
```

After enabling Camunda Hub, secret provider secrets used in an external connector's runtime will be resolved by fetching them from Camunda Hub.


## Preparing element template for hybrid mode

As mentioned, to relate connector element templates with connector runtime, you must modify the task definition type.

To do this, take the following steps:

1. Obtain a copy of the element template you wish to override. All latest versions of the official element
   templates can be found in the [official connectors repository](https://github.com/camunda/connectors) at path `connectors/<desired connector>/element-templates/`.
2. Modify the `value` to the desired new type of the property. Use `zeebe:taskDefinition:type` for outbound connectors, or `inbound.type` for inbound ones.
3. Publish the new element template, and use it in your BPMN diagram.

There are several options to deliver element templates to the target user:

### Option 1: Hide task definition type value

Use this option when you plan to clearly indicate that a specific connector will only be used in a specific use-case.
Otherwise, users might be confused between two of the same connector types.

For example, if you defined `CONNECTOR_HTTP_REST_TYPE='io.camunda:http-json:local'` argument variable when running connectors
runtime, you must implement the following in the element template for it to function properly:

```json
{
  "type": "Hidden",
  "value": "io.camunda:http-json:local",
  "binding": {
    "type": "zeebe:taskDefinition:type"
  }
}
```

### Option 2: Expose task definition type as plain text

Use this option when the target user building a BPMN process is deciding which connector to use, or you have
more than one dedicated Self-Managed connector instance.

Be mindful that the user will be dealing with different
task definition types and has to know which is what. For example, if you defined `CONNECTOR_HTTP_REST_TYPE='io.camunda:http-json:local'` in runtime, you must implement the following in the
element template for it to function properly:

```json
{
  "type": "String",
  "label": "Task definition type",
  "value": "io.camunda:http-json:local",
  "binding": {
    "type": "zeebe:taskDefinition:type"
  }
}
```

However, the target user can change the value back to the original `"value": "io.camunda:http-json:1",` to execute the process in a SaaS
environment. You can also add this field to a group for UX purposes.

### Option 3: Expose task definition type as dropdown

Use this option if you would like to achieve the most user-friendly experience. However, this approach may take a larger time investment in modifying element templates, plus additional time to support whenever you launch a new
Connector runtime or disable an old one.

The following example demonstrates this approach:

```json
{
  "label": "Task definition type",
  "type": "Dropdown",
  "value": "io.camunda:http-json:1",
  "choices": [
    {
      "name": "SaaS environment",
      "value": "io.camunda:http-json:1"
    },
    {
      "name": "SM environment 1",
      "value": "io.camunda:http-json:local1"
    },
    {
      "name": "SM environment 2",
      "value": "io.camunda:http-json:local2"
    }
  ],
  "binding": {
    "type": "zeebe:taskDefinition:type"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors-in-hybrid-mode
