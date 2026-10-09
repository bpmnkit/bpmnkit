# Best practices for custom-built element templates — Properties panel UI — Variable naming

Variables are not displayed in the properties panel but are referenced inside the template code.

**General rule:** Use lower camel case (start lowercase, capitalize subsequent words). Avoid starting variables with underscores ("\_").

Example:

- ❌ \_MyTestVariable
- ✅ myTestVariable

**Exception for method-specific properties:** Underscores may separate the method indication from the property name.

Example:

- ✅ chatCompletion_apiVersion
- ✅ completion_apiVersion

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/best-practices
