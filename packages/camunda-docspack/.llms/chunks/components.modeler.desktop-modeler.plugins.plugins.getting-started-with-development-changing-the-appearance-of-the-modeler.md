# Plugins — Getting started with development — Changing the appearance of the modeler

You can change the appearance of the modeler using CSS.

Your stylesheet might look like this:

```css
body {
  background: linear-gradient(0deg, #52b415, #eee);
}
```

Plug it into the modeler like this:

```javascript
module.exports = {
  style: "./style.css",
};
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/plugins/plugins
