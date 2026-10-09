# Decision requirements graph — Decision

![Decision](assets/decision-requirements-graph/decision.png)

A decision requirements graph can have one or more decisions. A decision has a [name](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table#decision-name)
which is shown in the DRD and an [ID](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table#decision-id). The decision logic inside the decision must be
either a [decision table](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table) or a [decision literal expression](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-literal-expression).

A decision is represented by a `decision` element inside the `definitions` XML element.

```xml

<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="dish" name="Desired Dish" namespace="party">
    <decision id="beverages" name="Beverages">
        <decisionTable id="decisionTable">
            <!-- ... -->
        </decisionTable>
    </decision>
</definitions>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-requirements-graph
