# Template properties — Showing properties conditionally: `condition`

Properties may have a condition which determines when they should be active, depending on the value of another property.
For example for a HTTP request template, you might not want to show the `Request Body` property when the HTTP method is `GET`.

When a property is **active**, it is displayed in the properties panel, and its value is serialized in the XML.
If a property is **not active**, it is not displayed, and its value is removed from the XML.

For a property value to be used in a condition, the property needs to have an `id` that can be referenced by the conditional property.

A property can depend on one or more conditions. If there are multiple conditions, they can be defined using `allMatch`.
All the conditions must be met for the property to be active.

There are four possible comparison operators:

- `equals`: Checks if the value is equal to the value defined in the condition.
- `oneOf`: Checks if the value is in the list of values defined in the condition.
- `isActive`: Checks if the referenced property is currently active and not hidden by other conditions.
- `isEmpty`: Checks if the referenced property's value is empty (empty value or unconfigured).

```json
[
  {
    "id": "httpMethod",
    "label": "HTTP Method",
    "type": "Dropdown",
    "choices": [
      {
        "name": "get",
        "value": "GET"
      },
      {
        "name": "patch",
        "value": "PATCH"
      },
      {
        "name": "post",
        "value": "POST"
      }
    ],
    "binding": {
      ...
    }
  },
  {
    "label": "Request Body",
    "type": "String",
    "binding": {
      ...
    },
    "condition": {
      "allMatch": [
        {
          "property": "httpMethod",
          "oneOf": [
            "patch",
            "post"
          ]
        },
        {
          "property": "...",
          "isActive": "true"
        },
        {
          "property": "...",
          "equals": "someValue"
        },
        {
          "property": "...",
          "isEmpty": true
        }
      ]
    }
  },
  ...
]
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
