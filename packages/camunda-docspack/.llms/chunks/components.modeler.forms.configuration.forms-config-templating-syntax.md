# Templating syntax

Learn about templated properties configuration, which provides dynamic content creation within forms using a templating language called feelers.

Templated properties configuration allows for dynamic content creation within forms using a templating language called [**feelers**](https://github.com/bpmn-io/feelers).


## Feelers syntax

### Variables/inserts

To insert a variable, use double curly braces `{{variable}}`, and the value of this variable will be inserted. You can use **any valid [FEEL expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction)** within these double braces.

```
Hello {{username}}, you are {{if isAdmin then "an admin" else "a user"}}.
```

### Iterating through arrays

Iterate through arrays using the _loop_ tags. Within the loop, reference each array element with `{{this}}`, or if your array elements are objects, via their properties. To access data outside the scope of the individual items, use the `{{parent}}` accessor.

**Data**

```json
{
  "currency": "$",
  "items": [
    {
      "name": "bananas",
      "price": 2.5
    },
    {
      "name": "mangos",
      "price": 4
    },
    {
      "name": "strawberries",
      "price": 3
    }
  ]
}
```

**Template**

```
{{#loop items}}
Item name: {{name}}
Item price: {{parent.currency}}{{price}}
{{/loop}}
```

### Conditional sections

Conditionally render a section of your template using the `if` tags. This is a quick way to write out large blocks you may or may not want evaluated based on a condition:

```
{{#if user.isCook}}
Ingredients list:
{{#loop ingredients}}
* {{this}}
{{/loop}}
{{/if}}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax
