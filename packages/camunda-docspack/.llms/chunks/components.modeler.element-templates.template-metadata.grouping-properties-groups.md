# Template metadata — Grouping properties: `groups`

- `groups` is an optional key.

You can define `groups` to organize custom fields into. The fields will be shown in their assigned group in the properties panel.
You can also specify whether a group is expanded or collapsed by default. This helps you to highlight important fields and to reduce visual clutter.

Groups can have the following attributes:

- `id : String`: Unique identifier of the group
- `label : String`: Label of the group
- `tooltip : String`: Tooltip for the group (optional)
- `openByDefault : Boolean`: Whether the group will be expanded in the properties panel (optional, default: `false`)

A property can be assigned to a group by setting the [`group` key](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties#grouping-fields-group) to the group's `id` value.

```json
{
  ...,
  "groups": [
    {
      "id": "definition",
      "label": "Task definition",
      "openByDefault": true
    },
    {
      "id": "request",
      "label": "Request payload"
    },
    {
      "id": "result",
      "label": "Result mapping"
    },
    {
      "id": "authentication",
      "label": "Authentication",
      "tooltip": "Optional authentication settings"
    }
  ],
  "properties": [
    ...
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata
