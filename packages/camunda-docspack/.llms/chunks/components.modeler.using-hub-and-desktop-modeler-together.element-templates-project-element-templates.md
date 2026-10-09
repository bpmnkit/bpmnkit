# Using Camunda Hub and Desktop Modeler together — Element templates — Project element templates

| Desktop Modeler                                                                                                                                                                               | Camunda Hub                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| [Local element templates](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/configuring-templates#local-templates) are loaded from the `.camunda/element-templates` folder if present. | Loads templates from a single folder. |

**Note**

- If starting in **Desktop Modeler**, use a single folder for your process application. This makes project templates available in both modelers without extra work.
- If starting in **Camunda Hub**, after cloning the repository manually create an empty JSON object `{}` in a file named `.process-application` in the root directory of your project/repository so Desktop Modeler can correctly recognize the project.

---
Source: https://docs.camunda.io/docs/next/components/modeler/using-hub-and-desktop-modeler-together
