# Output — Output name

![Output Name](assets/decision-table/output-name.png)

The name of the output is used to reference the value of the output.

It is specified by the `name` attribute on the `output` XML element.

If the decision table has more than one output, then all outputs must have a unique name.

**Caution**

The output name may not contain any special characters or symbols (e.g. whitespace, dashes, etc.).

The output name can be any alphanumeric string including the `_` symbol. For a combination of words, it's recommended to
use the `camelCase` or the `snake_case` format. The `kebab-case` format is not allowed because it contains the
operator `-`.

If the output name contain a special character or symbol then the output can't be accessed in
a [dependent decision](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-requirements-graph#required-decisions) nor in a calling BPMN process.

**Tip**

If the decision table has only one output then it is recommended that the [decision ID](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table#decision-id)
is used as the output name.

The decision result can be accessed in a [dependent decision](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-requirements-graph#required-decisions) by its
decision id. Only if the decision table has more than one output then the output values are grouped under the decision
id and can be accessed by their output names ( e.g. `decisionId.outputName`).

```xml

<output id="output1" label="Dish" name="desiredDish" typeRef="string"/>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-output
