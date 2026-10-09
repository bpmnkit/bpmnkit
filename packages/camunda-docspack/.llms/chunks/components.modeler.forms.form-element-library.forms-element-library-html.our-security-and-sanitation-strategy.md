# HTML view — Our security and sanitation strategy

We prevent all usages of JavaScript inside the HTML, this means that this component is solely meant to be used for presentation of information. Additionally, any text rendered through templating will be escaped. This means that you cannot pass HTML and CSS dynamically, by design, as certain attack vectors could make use of it. You may however inject individual style properties in your CSS.

We automatically scope all CSS, templated or otherwise, to the root of the component. This ensures the component does not affect and potentially break the entire structure of the form.

**Note**
While these are all strong security mechanisms, we still advise you to ensure the data coming into your form is trusted, and to use templating only where you really need it.

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-html
