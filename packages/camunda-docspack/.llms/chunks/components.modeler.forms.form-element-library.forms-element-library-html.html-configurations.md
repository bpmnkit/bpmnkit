# HTML view — HTML configurations

Below are various ways of configuring your HTML component, depending on your use case and configuration needs.

**Basic HTML**:

```
<div>
  <h1>Welcome to Our Site</h1>
  <p>This is a paragraph with some <strong>bold text</strong> and <em>italic text</em>.</p>
  <a href="https://example.com">Click here</a> to visit our page.
</div>
```

**HTML with inline styling**:

```
<div style="background-color: lightblue; padding: 10px;">
  <h2 style="color: navy;">Styling Example</h2>
  <p style="font-size: 14px;">This paragraph is styled with inline CSS.</p>
</div>
```

**HTML with style tags**:

```
<style>
  .example-container {
    background-color: lightblue;
    padding: 10px;
  }

  .example-container h2 {
    color: navy;
  }

  .example-container p {
    font-size: 14px;
  }
</style>

<div class="example-container">
  <h2>Styling Example</h2>
  <p>This paragraph is styled with CSS in a style tag.</p>
</div>
```

**List and images**:

```
<ul>
  <li>First Item</li>
  <li>Second Item</li>
</ul>

<img src="https://someurl.com/image.png" alt="Descriptive Image Text">
```

**Templating notation**

```
<div>
  <h1>{{pageTitle}}</h1>
  <p>Welcome, {{user.name}}!</p>
  <p>Your selected color is: <span style="color: {{user.favoriteColor}};">{{user.favoriteColor}}</span></p>
  <p>Your tasks for today are:</p>
  <ul>
    {{#loop user.tasks}}
      <li>{{this}}</li>
    {{/loop}}
  </ul>
</div>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-html
