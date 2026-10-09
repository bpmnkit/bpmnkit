# Text view — Example text configurations

Note that these configurations work in combination with one another. You may use templating syntax to leverage Markdown and HTML. You may also mix Markdown and HTML in a single definition.

**Markdown**:

```
# This is a heading

This shows an image:
![alternative image text](https://someurl.com/image.png)

## This is a sub-heading

Text can be shown for example using
**bold**, or *italic* font.

* This is an unordered list...
* ...with two list items

1. This is an ordered list...
2. ...with two list items
```

**HTML**:

```
<h1>This is a heading</h1>

This shows an image:
<img src="https://someurl.com/image.png"
alt="alternative image text">

<h2>This is a sub-heading</h2>

Text can be shown for example
using <b>bold</b>, or <i>italic</i> font.

<ul>
  <li>This is an unordered list...</li>
  <li>...with two list items</li>
</ul>

<ol>
  <li>This is an ordered list...</li>
  <li>...with two list items</li>
</ol>
```

**Note**
The text component supports a small subset of HTML configurations, and cannot be styled. Please use our [dedicated HTML component](https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-html) for presentation use-cases relying on HTML heavily.

**Template syntax**:

```
{{#if usingTemplating}}

Hello {{user.name}}, we are inside a conditional template block.

Your hobbies are:
{{#loop user.hobbies}}
* {{this}}
{{/loop}}

{{/if}}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-text
