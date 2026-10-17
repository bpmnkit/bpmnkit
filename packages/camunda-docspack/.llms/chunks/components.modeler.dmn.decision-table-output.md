# Output

Specify the outputs of decision tables.

![Output](assets/decision-table/output.png)

A decision table can have one or more outputs, also called output clauses. An output clause defines the id, label, name
and type of a decision table output.

An output clause is represented by an `output` element inside a `decisionTable`
XML element.

```xml

<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="definitions" name="definitions"
             namespace="http://camunda.org/schema/1.0/dmn">
    <decision id="dish" name="Dish">
        <decisionTable id="decisionTable">
            <!-- ... -->
            <output id="output1" label="Dish" name="desiredDish" typeRef="string"/>
            <!-- ... -->
        </decisionTable>
    </decision>
</definitions>

```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-output
