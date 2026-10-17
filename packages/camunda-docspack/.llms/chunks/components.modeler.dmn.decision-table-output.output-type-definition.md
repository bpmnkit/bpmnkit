# Output — Output type definition

![Output Type Definition](assets/decision-table/output-type-definition.png)

The type of the output clause can be specified by the `typeRef` attribute on the
`output` XML element.

After an output entry is evaluated, it checks if the result converts to the specified type. The type should be one of
the supported [data types](https://docs.camunda.io/docs/next/components/modeler/dmn/dmn-data-types).

```xml

<output id="output1" label="Dish" name="desiredDish" typeRef="string"/>
```

Note that the type is not required but recommended, since it provides a type safety of the output values.

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-output
