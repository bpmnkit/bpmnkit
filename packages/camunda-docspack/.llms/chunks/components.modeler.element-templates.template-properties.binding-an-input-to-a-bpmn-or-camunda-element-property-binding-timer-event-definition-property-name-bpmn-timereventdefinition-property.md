# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Timer event definition property name: `bpmn:TimerEventDefinition#property`

| **Binding `type`**         | `bpmn:TimerEventDefinition#property`                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Valid property `type`s** | `String``Text``Hidden``Dropdown`                                                       |
| **Binding parameters**     | `name`: The name of the property.Supported properties: `timeDate`, `timeCycle`, and `timeDuration`. |
| **Mapping result**         | `<bpmn:timerEventDefinition><bpmn:[name]>[userInput]</bpmn:[name]></bpmn:timerEventDefinition>`          |

The `bpmn:TimerEventDefinition#property` binding allows you to configure [timer event definitions](https://docs.camunda.io/docs/next/components/modeler/bpmn/timer-events) for timer events.
This binding is only valid for templates of events with `bpmn:TimerEventDefinition` set via `elementType.eventDefinition`.

Only one of `timeDate`, `timeCycle`, or `timeDuration` can be defined per template.

```json
{
  ...,
  "value": "0 0 9-17 * * MON-FRI",
  "binding": {
    "type": "bpmn:TimerEventDefinition#property",
    "name": "timeCycle"
  }
}
```

**Note**

**Property-specific constraints:**

- **`timeDuration`**: Cannot be used on process-level start events. Valid on event subprocess start events, intermediate catch events, and boundary events.
- **`timeCycle`**: Can only be used on start events and boundary events. When a template with `timeCycle` is applied:
  - Boundary events are automatically marked as non-interrupting.
  - Start events in event subprocesses are also marked as non-interrupting.
- **`timeDate`**: Can be used on process-level and event subprocess start events, intermediate catch events, and boundary events.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
