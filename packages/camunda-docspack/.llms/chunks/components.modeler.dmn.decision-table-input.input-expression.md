# Input — Input expression

![Input Expression](assets/decision-table/input-expression.png)

An input expression specifies how the value of the input clause is generated. It is usually simple and references a
variable which is available during the evaluation.

The expression language of the input expression
is [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction).

The expression is set inside a `text` element that is a child of the
`inputExpression` XML element.

```xml

<input id="input1" label="Season">
    <inputExpression id="inputExpression1" typeRef="string">
        <text>season</text>
    </inputExpression>
</input>
```


## Input type definition

![Input Type Definition](assets/decision-table/input-type-definition.png)

The type of the input clause can be specified by the `typeRef` attribute on the
`inputExpression` XML element.

After the input expression is evaluated, it checks if the result converts to the specified type. The type should be one
of the supported [data types](https://docs.camunda.io/docs/next/components/modeler/dmn/dmn-data-types).

```xml

<input id="input1" label="Season">
    <inputExpression id="inputExpression1" typeRef="string">
        <text>season</text>
    </inputExpression>
</input>
```

Note that the type is not required but recommended, since it helps to understand the possible input values and provides
a type safety to be aware of unexpected input values.

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-input
