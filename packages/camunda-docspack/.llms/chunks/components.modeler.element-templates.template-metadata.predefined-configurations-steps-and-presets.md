# Template metadata — Predefined configurations: `steps` and `presets`

- `steps` is an optional key.
- `presets` is an optional key.

Use `steps` and `presets` to offer several predefined configurations within a single template. A preset is a named set of property values, and `steps` define the menu users navigate to choose one. This is useful for templates that bundle multiple operations, such as a connector that can create an issue, list issues, or create a branch.

When a template defines `steps`, applying the template opens a nested menu built from those steps instead of applying the template directly. Choosing a final step applies the template together with the property values of its referenced preset. While searching, the final steps surface directly so users can pick an operation without navigating the menu.

Search matches a step by its `name`, `description`, and `keywords`, combined with those of its parent steps and of the template itself. Use `keywords` on a step to add the terms users search for when they think of the action rather than the product, such as `upload object` for a file storage operation.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata
