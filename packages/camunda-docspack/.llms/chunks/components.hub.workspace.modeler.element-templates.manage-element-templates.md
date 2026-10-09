# Manage element templates

Manage your element templates in Camunda Hub.

You can create and manage [element templates](https://docs.camunda.io/docs/next/components/concepts/element-templates) just as any other asset in a Camunda Hub project.


## Create an element template

To create a new element template, follow the steps described in [generate an element template](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/element-template-generator).

You will be taken to the **Element template editor** screen.
In this screen, you can define the element template by writing the template JSON.
The template editor supports you in writing the template by providing autocompletion, error highlighting, and a live preview.

The components of the editor interface are as follows:

- On the left, you find the **template JSON editor**. Here, you define the actual [template descriptor](https://docs.camunda.io/docs/next/components/modeler/element-templates/defining-templates).
  The descriptor follows the [most recent element template schema](https://github.com/camunda/element-templates-json-schema).

**Info**
  Starting with 8.8, you can freely edit the following properties:
  - `name`: Human-friendly name shown when selecting a template and in the properties panel after the template has been applied. The value can be different from the file name.
  - `id`: Identifier of the template. Changing this value creates a new template. We recommend setting a meaningful value (for example, "PaymentConnector", "CreateUserTemplate").
  - `version`: Integer-based version number. Combined with the `id`, it defines a unique template version. When [publishing](#publish-an-element-template) a new version, you are prompted to update the version number if you haven't already done so.

  The value of the `$schema` property is still fixed; manual changes will not be saved.

- On the right, you observe the live **Visual Preview**. The live preview shows how the properties panel will look when you apply the template to an element. It automatically updates on every valid change, and reflects the latest valid state of the template. The preview allows you to interactively check your template before publishing it.
  You can also use the **Update JSON** button to update the template's JSON properties with the current input values from the visual preview.

- In the upper right, you can add an icon to your template. You can upload an image file with a maximum size of 8 KB. We recommend using squared SVG graphics. Icons appear as 18x18 pixels in the element on the modeling canvas, and as 32x32 pixels in the properties panel.

On every valid change, the template is saved automatically. If there are errors in the JSON file, the template will not be saved. Ensure all [errors are resolved](#fixing-template-problems) for the template to save successfully.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates
