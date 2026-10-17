# Overview — Decision name

![Decision Name](assets/decision-table/decision-name.png)

The name describes the decision for which the decision table provides the decision logic. It is set as the `name`
attribute on the `decision` element. It can be changed via the properties panel on the right side of the screen after selecting the respective
"Decision" in the Decision Requirements Diagram view.

```xml

<decision id="dish" name="Dish">
    <decisionTable id="decisionTable">
        <!-- ... -->
    </decisionTable>
</decision>
```


## Decision ID

![Decision ID](assets/decision-table/decision-id.png)

The ID is the technical identifier of the decision. It is set in the `id`
attribute on the `decision` element. Just as the `name`, the `id` can be changed via the Properties Panel after
selecting the respective "Decision" in the Decision Requirements Diagram view.

Each decision should have an unique ID when it is deployed to Camunda.

**Caution**

The decision ID may not contain any special characters or symbols (e.g. whitespace, dashes, etc.).

The decision ID can be any alphanumeric string including the `_` symbol. For a combination of words, it's recommended to
use the `camelCase` or the `snake_case` format. The `kebab-case` format is not allowed because it contains the
operator `-`.

If the decision ID contains a special character or symbol then the decision result can't be accessed in
a [dependent decision](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-requirements-graph#required-decisions).

```xml

<decision id="dish" name="Dish">
    <decisionTable id="decisionTable">
        <!-- ... -->
    </decisionTable>
</decision>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table
