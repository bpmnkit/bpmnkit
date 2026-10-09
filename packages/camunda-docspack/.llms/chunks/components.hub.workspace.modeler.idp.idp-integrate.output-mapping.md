# Integrate IDP into your processes — Output mapping

Specify the process variables that you want to map and export the IDP extraction connector response into.

**Info**
To learn more about output mapping, see [variable/response mapping](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#variableresponse-mapping).

### Result variable

You can export the complete IDP extraction connector response (for example, the key value pairs extracted from the document) into a dedicated variable that you can then access anywhere in a process. To do this, enter a unique dedicated variable name in the **Result variable** field.

Example: `IDPResult`

### Result expression

In addition, you can choose to unpack the content of the response into multiple process variables using the **Result expression** field, as a [FEEL Context Expression](https://docs.camunda.io/docs/next/components/concepts/expressions).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-integrate
