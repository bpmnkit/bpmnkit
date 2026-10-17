# Example template

A complete example showing how to create an element template.

This page provides a complete example of an element template that demonstrates how to define user-editable fields and their mapping to BPMN 2.0 XML and Camunda extension elements.


## REST connector template

Let us consider the following example that defines a template for invoking a REST API via a service task:

```json
{
  "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
  "name": "REST connector",
  "id": "io.camunda.examples.RestConnector",
  "description": "A REST API invocation task.",
  "appliesTo": ["bpmn:ServiceTask"],
  "properties": [
    {
      "type": "Hidden",
      "value": "http",
      "binding": {
        "type": "zeebe:taskDefinition",
        "property": "type"
      }
    },
    {
      "label": "REST Credential",
      "description": "Choose a credential to use for the connection",
      "type": "Configuration",
      "configurationTemplate": "io.camunda.examples:connection:1",
      "binding": {
        "type": "zeebe:input",
        "name": "connection"
      }
    },
    {
      "label": "REST Endpoint URL",
      "tooltip": "The url of the REST API to talk to.",
      "type": "String",
      "binding": {
        "type": "zeebe:taskHeader",
        "key": "url"
      },
      "constraints": {
        "notEmpty": true,
        "pattern": {
          "value": "^https?://.*",
          "message": "Must be http(s) URL."
        }
      }
    },
    {
      "id": "httpMethod",
      "label": "REST Method",
      "tooltip": "The HTTP method to use for the request.",
      "type": "Dropdown",
      "value": "get",
      "choices": [
        { "name": "GET", "value": "get" },
        { "name": "POST", "value": "post" },
        { "name": "PATCH", "value": "patch" },
        { "name": "DELETE", "value": "delete" }
      ],
      "binding": {
        "type": "zeebe:taskHeader",
        "key": "method"
      }
    },
    {
      "label": "Request Body",
      "tooltip": "Data to send to the endpoint.",
      "value": "",
      "type": "String",
      "binding": {
        "type": "zeebe:input",
        "name": "body"
      },
      "condition": {
        "oneOf": ["post", "patch", "delete"],
        "property": "httpMethod"
      }
    },
    {
      "label": "Result Variable",
      "tooltip": "Name of variable to store the response data in.",
      "value": "response",
      "type": "String",
      "optional": true,
      "binding": {
        "type": "zeebe:output",
        "source": "= body"
      }
    }
  ],
  "configurationTemplates": [
    {
      "id": "io.camunda.examples:connection:1",
      "name": "Connection",
      "version": 1,
      "kind": "CREDENTIAL",
      "properties": [
        {
          "id": "connectionProperty",
          "label": "Connection property",
          "description": "A single connection value, for example an endpoint or token.",
          "type": "String",
          "binding": { "type": "property", "name": "connectionProperty" },
          "constraints": { "notEmpty": true }
        }
      ]
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-example
