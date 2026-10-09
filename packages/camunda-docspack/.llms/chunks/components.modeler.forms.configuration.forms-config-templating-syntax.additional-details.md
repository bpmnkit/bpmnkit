# Templating syntax — Additional details

### Nest loops

If you have an array of users, each with an array of purchases, you may loop over both in a nested manner:

**Data**

```json
{
  "users": [
    {
      "name": "jane1995",
      "purchases": ["mango", "strawberry"]
    },
    {
      "name": "rob1992",
      "purchases": ["pineapple", "guava"]
    }
  ]
}
```

**Template**

```
{{#loop users}}
The user '{{name}}' purchased:
{{#loop purchases}}
* {{this}}
{{/loop}}
{{/loop}}
```

In this situation, you may need to use the `parent` accessor several times to access data outside the scope.

### More on the `parent` and `this` accessors

If the data you are using somehow already makes use of those keywords, there is an alternative syntax which surrounds it with an underscore: `_this_` and `_parent_`.

**Data**

```json
{
  "root": "nodes",
  "nodes": [
    {
      "id": "021321321",
      "parent": "228321321"
    },
    {
      "id": "021321321",
      "parent": "228321321"
    }
  ]
}
```

**Template**

```
Listing out all node paths:
{{#loop nodes}}
* http://www.myNodeWebsite/{{_parent_.root}}/{{id}}
{{/loop}}
```

In the example above, if you are not surrounding the parent accessor with underscores, you access the parent property of the node, which is not what we're looking for. This also applies to the `this` accessor.

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax
