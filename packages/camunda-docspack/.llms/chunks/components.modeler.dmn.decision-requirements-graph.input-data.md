# Decision requirements graph — Input data

![Input Data](assets/decision-requirements-graph/input-data.png)

An input data denotes information used as an input by one or more decisions.

It is represented by an `inputData` element inside the `definitions` element.

```xml

<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="dinnerDecisions" name="Dinner Decisions"
             namespace="http://camunda.org/schema/1.0/dmn">
    <inputData id="guestsWithChildren" name="Guests with children?"/>

    <decision id="beverages" name="Beverages">
    <informationRequirement>
        <requiredInput href="#guestsWithChildren"/>
    </informationRequirement>
    <!-- ... -->
</definitions>
```

Note that an input data has no execution semantics and is ignored on the evaluation.


## Knowledge source

![Knowledge Source](assets/decision-requirements-graph/knowledge-source.png)

A knowledge source denotes an authority for a Decision.

It is represented by a `knowledgeSource` element inside the `definitions` element.

```xml

<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="dinnerDecisions" name="Dinner Decisions"
             namespace="http://camunda.org/schema/1.0/dmn">
    <knowledgeSource id="cookbook" name="Men's Cookbook"/>

    <decision id="dish" name="Dish">
    <authorityRequirement>
        <requiredDecision href="#cookbook"/>
    </authorityRequirement>
    <!-- ... -->
</definitions>
```

Note that a knowledge source has no execution semantics and is ignored on the evaluation.

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-requirements-graph
