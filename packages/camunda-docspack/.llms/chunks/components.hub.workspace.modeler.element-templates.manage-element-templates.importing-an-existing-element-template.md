# Manage element templates — Importing an existing element template

If you have created templates for Desktop Modeler and want to reuse them in Camunda Hub, you need to make some adjustments to the template files:

1. **Split the files**. Camunda Hub maintains a 1:1 relation between element templates and files. Since Desktop Modeler allows you to keep multiple template definitions in a single file, you must split the file in advance to one file per template before uploading.
2. **Remove the brackets**. Remove the list brackets from the element template file before uploading. Even if a template file for Desktop Modeler contains only a single template, it is always wrapped in a list.

Once your file follows the requirements, you can upload it. There are two ways to do so:

1. Upload it as a new element template via the  **Upload files** action in the project view.
   

2. Update an existing template via the **Replace via upload** action in the breadcrumbs of the editor view.
   

**Info: Desktop Modeler support**
The element template editor is currently only available in Camunda Hub. Refer to the [Desktop Modeler documentation](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/configuring-templates) for instructions on configuring element templates in Desktop Modeler.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates
