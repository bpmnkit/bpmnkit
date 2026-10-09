# Hit policy — The role of a hit policy

A hit policy specifies how many rules of a decision table can be satisfied and which of the satisfied rules are included
in the decision result.

The hit policies [Unique](#unique), [Any](#any) and [First](#first) will always return a maximum of one satisfied rule.
The hit policies [Rule Order](#rule-order) and [Collect](#collect) can return multiple satisfied rules.


## Unique

Only a single rule can be satisfied or no rule at all. The decision table result contains the output entries of the
satisfied rule.

If more than one rule is satisfied, the Unique hit policy is violated.

Refer to the following decision table.

![Hit Policy Unique](assets/decision-table/hit-policy-unique.png)

Depending on the current season the dish should be chosen. Only one dish can be chosen, since only one season can exist
at the same time.

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-hit-policy
