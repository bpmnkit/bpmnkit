# Decision requirements graph

A Decision Requirements Graph (DRG) models a domain of decision-making, showing the most important elements involved in it and the dependencies between them.

![Decision Requirements Graph](assets/decision-requirements-graph/drd.png)

A Decision Requirements Graph (DRG) models a domain of decision-making, showing the most important elements involved in
it and the dependencies between them. The elements modeled are [decisions](#decision), [input data](#input-data),
and [knowledge sources](#knowledge-source).

The visual representation of a DRG is called Decision Requirements Diagram (DRD).

In the XML a DRG is represented by the `definitions` element.

```xml

<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="dinnerDecisions" name="Dinner Decisions"
             namespace="http://camunda.org/schema/1.0/dmn">
    <decision id="dish" name="Dish">
        <!-- ... -->
    </decision>
    <decision id="beverages" name="Beverages">
        <!-- ... -->
    </decision>
</definitions>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-requirements-graph
