# Using templates in Camunda Hub

Learn how to apply, remove, update, and replace templates.


## Applying templates

To create, append, or change an element with a reusable asset, use **Browse all**. See the [resource discovery guide](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/browse-all-resources) for the complete flow. The following steps apply a template to an existing element through the properties panel:

If you have already published an [element template](https://docs.camunda.io/docs/next/components/modeler/element-templates/about-templates) to your project or organization:

1. Open a BPMN diagram.
2. Make sure you're in [**Implementation** mode](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/collaboration/implement-your-process#switch-to-implement-mode).
3. Select an element in the diagram that matches the element template's type. For example, if you've published a **Task** template, select a **Task** element in your diagram.
4. On the right side of the modeling interface, under **Details > Properties > Template**, click **Select**. This opens the **Choose element template** modal.
5. Select the element template.
6. (Optional) Instead of selecting a published template, click the blue shop icon in the top right of the modal to open the [Camunda Marketplace](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/camunda-marketplace).

The Marketplace icon in **Choose element template** is a separate template-selection path. **Browse all** applies to the create, append, and change-element modeling menus.

Applying a template stores it via the `modelerTemplate` property and the optional `modelerTemplateVersion` property
on the selected element:

```xml
<bpmn:serviceTask id="MailTask"
                  zeebe:modelerTemplate="com.mycompany.MailTask"
                  zeebe:modelerTemplateVersion="1"/>
```

It also sets up custom fields on the diagram element and makes these available for inspection and editing.
Properties which were not configured in the element template using custom fields will not be available for editing.

### Applying a template that defines operations

Templates that define [operations](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#predefined-configurations-steps-and-presets) — for example, a connector template for a service with several operations — show their operations in the popup menu instead of applying the template directly. Select an operation to apply the template with that operation preselected, then complete the remaining fields in the properties panel.

Operations are also matched by search, so you can search for the action you want to perform, such as `upload object`, without knowing which template provides it. Search matches an operation's name, description, and keywords together with those of its parent operations and its template.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/using-templates
