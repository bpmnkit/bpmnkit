# Decision literal expression — Decision name

![Decision Name](assets/decision-literal-expression/decision-name.png)

The name describes the decision for which the literal expression provides the decision logic. It is set as the `name`
attribute on the `decision` element.

```xml

<decision id="season" name="Season">
    <!-- ... -->
</decision>
```


## Decision id

![Decision Id](assets/decision-literal-expression/decision-id.png)

The ID is the technical identifier of the decision. It is set in the `id`
attribute on the `decision` element.

Each decision should have an unique ID when it is deployed to Camunda.

**Caution**

The decision ID may not contain any special characters or symbols (e.g. whitespace, dashes, etc.).

The decision ID can be any alphanumeric string including the `_` symbol. For a combination of words, it's recommended to
use the `camelCase` or the `snake_case` format. The `kebab-case` format is not allowed because it contains the
operator `-`.

If the decision ID contain a special character or symbol then the decision result can't be accessed in
a [dependent decision](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-requirements-graph#required-decisions).

```xml

<decision id="season" name="Season">
    <!-- ... -->
</decision>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-literal-expression
