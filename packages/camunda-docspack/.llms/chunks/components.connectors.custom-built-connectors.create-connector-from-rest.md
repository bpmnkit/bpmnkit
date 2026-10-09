# Create a custom REST connector

Learn how to create a custom connector based on and using the Camunda REST connector as a starting point.

# Create a custom REST connector

Create a custom REST connector based on and using the [Camunda REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest) as a starting point.


## Create a custom connector based on the Camunda REST connector

1. In your Camunda Hub project, add a [task](https://docs.camunda.io/docs/next/components/modeler/bpmn/tasks) element to a new or existing BPMN diagram.
1. Change the task type to [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest).
1. In the Properties panel, configure the connector as required. For example, define the Authentication URL, HTTP method, and any headers or payload needed for the API request.
1. Click **Save as Template**.
1. Enter details for the new connector template, such as a name and description. Save and create the new connector template.
1. Open the new connector template in the template editor and customize it as required. For example, add or remove fields, adjust default values and input parameters, and update the description and other metadata.
1. Save your changes to the new connector template, and use it as required in your processes.

**Caution**
When creating a new template based on the REST connector, you must ensure that any field(s) used to set variables are placed **before** any field(s) that uses these variables. For example, in the following code, as the `url` requires the variables defined by `swid` and `swresource`, it is placed after them. Incorrectly placed variables will be considered as `null`.

```json
{
      "id": "swid",
      "label": "id",
      "description": "Index of the resource",
      "feel": "optional",
      "group": "swapi",
      "binding": {
        "name": "index",
        "type": "zeebe:input"
      },
      "type": "String"
    },
    {
      "id": "swresource",
      "label": "Type",
      "description": "Choose the resource type",
      "value": "Planets",
      "group": "swapi",
      "binding": {
        "name": "resource",
        "type": "zeebe:input"
      },
      "type": "Dropdown",
      "choices": [...]
    },
    {
      "id": "url",
      "label": "URL",
      "optional": false,
      "constraints": {
        "notEmpty": true,
        "pattern": {
          "value": "^(=|(http://|https://|secrets|\\{\\{).*$)",
          "message": "Must be a http(s) URL"
        }
      },
      "group": "endpoint",
      "binding": {
        "name": "url",
        "type": "zeebe:input"
      },
      "type": "Hidden",
      "value": "=\"https://swapi.dev/api/\" + resource + \"/\" + index"
    }
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/create-connector-from-rest
