# Integrate API data — Load data on runtime with a custom component

A convenient way to provide realtime data fetching capabilities to your form designers is to design a custom component. For example, you can create a searcheable select that allows users to search and select a record from a CRM system. With custom components, you can create any logic for data retrieval without limitations. You could consider writing your own backend (micro-)services coupled to your components, and let the components communicate with these services to fetch domain-specifc or internal data in a secure fashion.

Learn how to develop a custom component in the [custom component guide](https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/03-customize-and-extend/02-custom-components).

**Note**
Custom components currently cannot be imported into [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index) or [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index). If you use custom components, you need to host the form editor yourself.

<!-- TODO
Learn more in the build your own form editor guide.
-->

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/03-customize-and-extend/03-integrate-api-data
