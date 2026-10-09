# Input — Input ID

The input ID is a unique identifier of the decision table input. It is used by Camunda to reference the
input clause. Therefore, it is required. It is set as the `id` attribute of the `input` XML element.

```xml

<input id="input1" label="Season">
    <inputExpression id="inputExpression1" typeRef="string">
        <text>season</text>
    </inputExpression>
</input>
```


## Input label

![Input Label](assets/decision-table/input-label.png)

An input label is a short description of the input. It is set on the `input`
XML element in the `label` attribute. Note that the label is not required but recommended, since it helps to understand
the decision.

```xml

<input id="input1" label="Season">
    <inputExpression id="inputExpression1" typeRef="string">
        <text>season</text>
    </inputExpression>
</input>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-input
