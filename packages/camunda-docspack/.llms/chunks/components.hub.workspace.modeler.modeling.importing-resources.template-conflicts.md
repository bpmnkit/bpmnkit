# Import resources into Camunda Hub — Template conflicts

Element templates, including connector templates, have an associated ID, which is used to find the template when a BPMN process references it.

When importing templates, Camunda Hub checks for potential conflicts with existing templates already available in your project, workspace, or organization. A conflict occurs when an imported template has the same ID as an existing one.

You can resolve template conflicts using one of these two options:

1. Save as copy: It creates a new file with a new, auto-generated ID. This option is not available when importing projects.
2. [Replace an existing template](#replace-a-template).

### Replace a template

You can replace an existing template when:

- The template belongs to the project you are importing into.
- The imported template has a higher version than the existing one.

If an imported template **replaces** an existing template:

- The **file contents** of the existing template are overwritten by the imported template.
- Due to Camunda Hub safeguards, you can only publish **higher versions** of that template in the future. Older or equal versions are blocked from publication to prevent accidentally overwriting already published versions.

This behavior ensures consistency for processes that already use the template, but note that historical versions cannot be republished under the same ID and version.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/importing-resources
