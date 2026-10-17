# Decision requirements graph — Required decisions

![Required Decision](assets/decision-requirements-graph/required-decision.png)

A decision can have one or more required decisions which it depends on.

A required decision is represented by a `requiredDecision` element inside an `informationRequirement` XML element. It
has a `href` attribute and the value starts with `#` followed by the [decision ID](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table#decision-id) of the
required decision.

**Tip**

The result of a required decision can be accessed in the dependent decision by its decision ID.

If the required decision is a decision table and has more than one output then the output values are grouped under the
decision ID and can be accessed by their [output names](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-output#output-name) (
e.g. `decisionId.outputName`). The structure of the result depends on the decision
table [hit policy](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-hit-policy).

```xml

<decision id="beverages" name="Beverages">
    <informationRequirement>
        <requiredDecision href="#dish"/>
    </informationRequirement>
    <!-- ... -->
</decision>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-requirements-graph
