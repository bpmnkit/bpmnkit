# Output — Output ID

The output ID is a unique identifier of the decision table output. It is used by Camunda to reference the
output clause. Therefore, it is required. It is set as the `id` attribute of the `output` XML element.

```xml

<output id="output1" label="Dish" name="desiredDish" typeRef="string"/>
```


## Output label

![Output Label](assets/decision-table/output-label.png)

An output label is a short description of the output. It is set on the `output`
XML element in the `label` attribute. Note that the label is not required but recommended, since it helps to understand
the decision.

```xml

<output id="output1" label="Dish" name="desiredDish" typeRef="string"/>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-output
