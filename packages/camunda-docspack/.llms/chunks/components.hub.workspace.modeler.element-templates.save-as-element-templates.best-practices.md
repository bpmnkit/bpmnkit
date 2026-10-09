# Save activity and event properties as reusable element templates — Best practices

When creating templates from elements:

- **Create focused templates**: Each template should serve a clear purpose.
- **Hide details**: Expose only the necessary properties.
- **Validate input**: Use [constraints](https://docs.camunda.io/docs/next/components/modeler/element-templates/defining-templates#constraints) to enforce valid input and provide meaningful errors.
- **Manage dependencies**: Ensure referenced decisions or variables exist in the runtime environment. Use `versionTag` bindings for dependencies to avoid version conflicts.
- **Use meaningful parameter names**: Give configurable fields descriptive names.
- **Test your templates**: Apply them to an element to confirm they work as expected.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/save-as-element-templates
