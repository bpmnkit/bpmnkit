# Hit policy — Rule order

Multiple rules can be satisfied. The decision table result contains the output of all satisfied rules in the order of
the rules in the decision table.

![Hit Policy Rule Order](assets/decision-table/hit-policy-rule-order.png)

Again, refer to the advertisement example with the rule order policy. Say we have a user at the age of 19 again. All rules
are satisfied so all outputs are given, ordered by the rule ordering. It can perhaps be used to indicate the priority of
the displayed advertisements.


## Collect

Multiple rules can be satisfied. The decision table result contains the output of all satisfied rules in an arbitrary
order as a list.

![Hit Policy Collect](assets/decision-table/hit-policy-collect.png)

With this hit policy, the output list has no ordering. So the advertisement will be arbitrary if, for example, the age
is 19.

Additionally, an aggregator can be specified for the Collect hit policy. If an aggregator is specified, the decision
table result will only contain a single output entry. The aggregator will generate the output entry from all satisfied
rules.

**Info: If the Collect hit policy is used with an aggregator, the decision table can only have one output.**

The aggregator is set as the `aggregation` attribute of the `decisionTable`
XML element.

```xml

<decisionTable id="decisionTable" hitPolicy="COLLECT" aggregation="SUM">
    <!-- .. -->
</decisionTable>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-hit-policy
