# Input

Specify the inputs of decision tables.

![Input](assets/decision-table/input.png)

A decision table can have one or more inputs, also called input clauses. An input clause defines the id, label,
expression and type of a decision table input.

An input can be edited by double-clicking on the respective colum header in the decision table.

An input clause is represented by an `input` element inside a `decisionTable`
XML element.

```xml

<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="definitions" name="definitions"
             namespace="http://camunda.org/schema/1.0/dmn">
    <decision id="dish" name="Dish">
        <decisionTable id="decisionTable">
            <input id="input1" label="Season">
                <inputExpression id="inputExpression1" typeRef="string">
                    <text>season</text>
                </inputExpression>
            </input>
            <!-- ... -->
        </decisionTable>
    </decision>
</definitions>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-input
