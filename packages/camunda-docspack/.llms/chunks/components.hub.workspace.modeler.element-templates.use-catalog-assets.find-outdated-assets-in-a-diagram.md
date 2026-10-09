# Use catalog assets in Hub — Find outdated assets in a diagram

When an element references a template version that isn't the latest one, Camunda Hub flags it in two places in the modeler:

- The problems panel reports `Element has updated template available.` as an information-level hint. Select the hint to focus the affected element on the canvas.
- The properties panel of the focused element shows an **Update available** dropdown. It reports the version you can move to, for example `A new version of the template is available: 3`, and offers the **Update** and **Unlink** actions.

Select **Update** to apply the latest version of the template to the element. The hint is reported once per affected element, and an element that already uses the latest version produces no hint.

This signal covers every element template available to your diagram, whether it comes from the catalog or from your project.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/use-catalog-assets
