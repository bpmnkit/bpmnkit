# Custom components

Extend form-js with custom components for your domain-specific use cases.

Form-js comes with an extension point to hook in custom components. You can define the renderer, the configuration options of the component in the properties panel, and the palette entry.

Custom components are built and distributed separately from the form viewer and renderer, and can be plugged in on demand by registering them as `additionalModules`.

```js
import { Form } from "@bpmn-io/form-js-viewer";
import MyCustomComponent from "...";

new Form({
  container,
  schema,
  data,
  additionalModules: [MyCustomComponent],
});
```

Read the [step-by-step guide](https://github.com/bpmn-io/form-js-examples/tree/master/custom-components)  and inspect the example component to learn how to write your own custom components.

**Note**
Custom components currently cannot be imported into [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index) or [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index). If you use custom components, you need to host the form editor yourself.

<!-- TODO
Learn more in the build your own form editor guide.
-->

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/03-customize-and-extend/02-custom-components
