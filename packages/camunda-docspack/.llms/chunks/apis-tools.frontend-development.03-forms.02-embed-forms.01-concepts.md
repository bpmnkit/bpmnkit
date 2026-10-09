# Concepts

Understand the basic concepts of form-js

Use form-js, the open-source library that powers Camunda Forms, to embed forms anywhere from vanilla JavaScript to low-code application platforms. With form-js, you can view, visually edit, and simulate forms that are based on pure JSON.


## form-js basics

The form-js project is made of three core libraries: the [form editor](https://github.com/bpmn-io/form-js/tree/develop/packages/form-js-editor) , the [form viewer](https://github.com/bpmn-io/form-js/tree/develop/packages/form-js-viewer) , and the [form playground](https://github.com/bpmn-io/form-js/tree/develop/packages/form-js-playground) .

### Form editor

You can use the [form editor](https://github.com/bpmn-io/form-js/tree/develop/packages/form-js-editor)  to design forms with a drag-and-drop interface. It uses [FEEL expressions](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel) to execute form logic in realtime, such as visibility conditions. Learn more about using the form editor in the [getting started guide](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/utilize-forms).

**Note**
The Camunda 8 form editor uses the [form playground](#form-playground) as it provides real-time preview and validation functionality.

### Form viewer

The [form viewer](https://github.com/bpmn-io/form-js/tree/develop/packages/form-js-viewer)  renders a form built using the form editor. It is versatile and can be embedded in any JavaScript application to render a form and capture user interactions. Learn more about embedding the form viewer on the following pages.

See the following example form using the form viewer, and interact with it:

### Form playground

The [form playground](https://github.com/bpmn-io/form-js/tree/develop/packages/form-js-playground)  is a tool to preview forms, simulate their behavior, and explore form-js in a playful manner. It combines the [editor](#form-editor) and the [viewer](#form-viewer) with mock data input and output panels to test a form and form editor features instantly.

There is also a [Camunda-flavored version of the form playground](https://github.com/camunda/form-playground) , which closely resembles the form editor experience in [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index) and [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index), and supports rapid development.

The form playground mainly comprises the following areas:

- The **component palette** to search and add components.
- The **editor canvas**, allowing to compose a form by dragging components.
- The **preview pane**, which shows an interactive preview of the form. The preview updates in real-time when a change happens in the editor, properties panel, or mock input data.
- The **properties panel**, which is used to configure the properties of a component.
- The **data input panel**, which allows to simulate the form preview using mock input data.
- The **output panel**, which calculates and shows the current form output in real-time, based on the interactions with the preview.

The input and output panel, together with the preview, come in handy to simulate the behavior of a form, and to validate or debug the configuration of one or multiple components, especially when using expressions extensively. Use the input data panel to simulate process variables, business objects, or static data used in your form.

   
      Try form playground
   

Try the form playground yourself directly on the web, no log in needed.

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/02-embed-forms/01-concepts
