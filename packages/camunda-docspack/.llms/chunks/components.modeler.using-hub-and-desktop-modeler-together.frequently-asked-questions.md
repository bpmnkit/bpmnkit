# Using Camunda Hub and Desktop Modeler together — Frequently asked questions

### Do I really need a `.process-application` file if I’m only using Camunda Hub?

No. A `.process-application` file is only required if you plan to open the project in Desktop Modeler. Camunda Hub does not require it, but adding the file makes the project compatible across both tools.

### Can I use the same element template repository for both modelers?

Yes. Camunda recommends maintaining a dedicated version control repository for element templates. Desktop Modeler users can copy templates into their global directory, while Camunda Hub users can stay in sync through a CI/CD pipeline and the [Camunda Hub API](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/overview).

### How should I manage multiple versions of the same element template?

In Desktop Modeler, each version of the element template must be present. Versions can be stored in a single file as a list of element templates or in separate files (for example, `element-template-v1.json` and `element-template-v2.json`). Otherwise, the template will appear as [missing](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/using-templates#missing-templates). Camunda Hub, however, supports [versioning](https://docs.camunda.io/docs/next/components/modeler/element-templates/defining-templates#template-versioning) in a single file and allows you to [publish](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates#publish-an-element-template) new versions directly.

When referencing a dependency such as a form we recommend using a `versionTag` as your [binding type](https://docs.camunda.io/docs/next/components/best-practices/modeling/choosing-the-resource-binding-type#supported-binding-types), as this option ensures that the right version of the target resource is always used.

---
Source: https://docs.camunda.io/docs/next/components/modeler/using-hub-and-desktop-modeler-together
