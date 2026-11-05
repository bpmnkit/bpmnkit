---
"@bpmnkit/core": minor
---

Element templates can bind `zeebe:calledElement`, `zeebe:calledDecision`, `zeebe:userTask`, `zeebe:formDefinition`, `zeebe:assignmentDefinition`, `zeebe:taskSchedule`, `zeebe:priorityDefinition` and `zeebe:script`; they were hard validation errors before. `applyTemplateToElement` writes them, and re-applying the same template removes any the new version no longer binds.
