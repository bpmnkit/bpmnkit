# @bpmnkit/connectors — Applying to an element — inbound connectors and linked resources — What Zeebe would refuse

`applyTemplateToElement`, `applyTemplates` and `applyConnectorLines` check the elements they
wrote with Zeebe's deploy rules and report each error as a problem, after the template's own
problems (a missing required value is still `missing-required`):

```
Not deployable on Camunda 8.10: call: Must have exactly one 'zeebe:taskDefinition' extension element (zeebe/service-task-definition)
```

`applyTemplateToElement` gives it `kind: "not-deployable"`; `applyTemplates` names the element;
`applyConnectorLines` puts it on the line that configured the element. The model is still
returned, as for any other problem. Only the applied elements (and the message an inbound
template writes) are checked, so applying a template to an unfinished diagram does not report
the rest of it. The version is `camundaVersion`, else the model's `executionPlatformVersion`,
else the newest. Pass `{ validate: false }` to skip the check. `applyElementTemplate` and
`applyConnectorTemplate` return builder options, not a model; `build()` checks those.

---
Source: https://bpmnkit.com/docs/packages/connectors
