# Camunda for Microsoft Teams — Use pop-up dialogs

The bot opens forms in a pop-up dialog when they:

- Contain unsupported element types
- Use FEEL expressions (values starting with `=`) in supported properties

#### Unsupported element types

Adaptive Cards support only a subset of Camunda form elements. Forms that include any of the following elements open in a pop-up dialog:

- Group
- Table
- Dynamic list
- iframe
- HTML viewer
- Button
- Expression field
- Document preview

#### FEEL expressions

Forms also open in a pop-up dialog if any field uses a FEEL expression in one of the following properties:

- **Label**
- **Date label**
- **Read only**
- **Default value**
- **Text**
- **Source**
- **Alt text**
- **Accept**
- **Multiple**

**Note**
Static values and process variables are supported in Adaptive Cards. Dynamic FEEL expressions are not.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/microsoft-teams
