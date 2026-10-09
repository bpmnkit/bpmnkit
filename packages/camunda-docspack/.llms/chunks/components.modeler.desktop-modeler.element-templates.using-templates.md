# Using templates

Learn how to apply, remove, update, and replace templates.


## Applying templates

If an [element template](https://docs.camunda.io/docs/next/components/modeler/element-templates/about-templates) matches a selected diagram element, the template catalog button is shown in the properties panel on the right side of the screen.

![Template Chooser](./img/chooser.png)

Clicking **Select** opens a popup menu, allowing you to browse and search available templates for the
selected element.

![Popup menu](./img/modal.png)

Applying a template stores it via the `modelerTemplate` property and the optional `modelerTemplateVersion` property
on the selected element:

```xml

<bpmn:serviceTask id="MailTask"
                  zeebe:modelerTemplate="com.mycompany.MailTask"
                  zeebe:modelerTemplateVesion="1"/>
```

It also sets up custom fields on the diagram element and makes these available for inspection and editing.
Properties which were not configured in the element template using custom fields will not be available for editing.

### Applying a template that defines operations

Templates that define [operations](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#predefined-configurations-steps-and-presets) — for example, a connector template for a service with several operations — show their operations in the popup menu instead of applying the template directly. Select an operation to apply the template with that operation preselected, then complete the remaining fields in the properties panel.

Operations are also matched by search, so you can search for the action you want to perform, such as `upload object`, without knowing which template provides it. Search matches an operation's name, description, and keywords together with those of its parent operations and its template.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/using-templates
