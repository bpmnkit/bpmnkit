# Embed forms in JavaScript

Learn how to embed the form viewer in JavaScript

Learn how to embed the form viewer in your own applications and web pages using JavaScript.


## Set up form-js

Set up the [form viewer](https://github.com/bpmn-io/form-js/tree/develop/packages/form-js-viewer)  in your own JavaScript projects by importing the library from NPM or a CDN. Alternatively, you can fork the code and [build it yourself](https://github.com/bpmn-io/form-js?tab=readme-ov-file#build-and-run) .

### NPM

If you use [NPM](https://docs.npmjs.com/getting-started/what-is-npm), install the form viewer as follows:

```sh
npm install @bpmn-io/form-js-viewer
```

### CDN

You can import the form viewer from a content delivery network (CDN), for example when you want to use the form viewer directly in a browser environment without bundling it with your application. Form-js is served via unpkg. Specify the version you want to reference in the URL.

```js
<script src="https://unpkg.com/@bpmn-io/form-js@<VERSION>/dist/form-viewer.umd.js"></script>
```

If you want to automatically use the latest version of the form viewer, you can specify only the major version.

```js
<script src="https://unpkg.com/@bpmn-io/form-js@1/dist/form-viewer.umd.js"></script>
```

Make sure to import the stylesheets as well, and ensure that the version matches:

```js
<link rel="stylesheet" href="https://unpkg.com/@bpmn-io/form-js@1/dist/assets/form-js.css">
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/02-embed-forms/02-embed-in-javascript
