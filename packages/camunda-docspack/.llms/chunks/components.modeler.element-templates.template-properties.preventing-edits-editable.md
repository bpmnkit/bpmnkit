# Template properties — Preventing edits: `editable`

By default, all properties defined in an element template that do not have type `Hidden` are editable.
You can prevent edits by setting the `editable` property to `false`. The property will be displayed in the properties panel but cannot be changed.

```json
{
  "label": "Task type",
  "type": "String",
  "value": "http-job-type",
  "editable": false,
  "binding": {
    "type": "zeebe:taskDefinition",
    "property": "type"
  }
}
```


## Control visibility of default properties panel entries: `entriesVisible`

By default, an applied element template causes most properties panel sections to be hidden — element template-defined bindings take precedence over standard groups and entries.
This behavior can be customized through the `entriesVisible` property.

### Control specific entry visibility

By passing an object to `entriesVisible`, you can override the default display of certain properties panel sections. The key of that object is the ID of a section, the value is a boolean that defines the visibility status. The table below lists what entries may be customized and their default visibility status:

| Key                  | Description                 | Default visible |
| :------------------- | :-------------------------- | :-------------- |
| `outputs`            | Output mapping section      | `false`         |
| `executionListeners` | Execution listeners section | `true`          |
| `taskListeners`      | Task listeners section      | `false`         |

To show the standard output mapping section, configure your template as shown below:

```json
[
  {
    "name": "Template 1",
    "id": "sometemplate",
    "entriesVisible": {
      "outputs": true
    },
    "appliesTo": [
      "bpmn:ServiceTask"
    ],
    "properties": [
      ...
    ]
  }
]
```

### Displaying all entries

To show all standard properties panel entries, set `entriesVisible=true`:

```json
[
  {
    "name": "Template 1",
    "id": "sometemplate",
    "entriesVisible": true,
    "appliesTo": [
      "bpmn:ServiceTask"
    ],
    "properties": [
      ...
    ]
  }
]
```

**Warning**
As an element template author, you are responsible for ensuring the default sections opened do not conflict with any bindings defined by the element template.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
