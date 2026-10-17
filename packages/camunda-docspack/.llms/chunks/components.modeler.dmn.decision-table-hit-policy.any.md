# Hit policy — Any

Multiple rules can be satisfied. However, all satisfied rules must generate the same output. The decision table result
contains only the output of one of the satisfied rules.

If multiple rules are satisfied which generate different outputs, the hit policy is violated.

Refer to the following example:

![Hit Policy Any](assets/decision-table/hit-policy-any.png)

This is a decision table for the leave application. If the applier has no vacation days left or is currently in the
probation period, the application will be refused. Otherwise the application is applied.


## First

Multiple rules can be satisfied. The decision table result contains only the output of the first satisfied rule.

![Hit Policy First](assets/decision-table/hit-policy-first.png)

Refer to the decision table above for advertisement. Regarding the current age of the user, which advertisement should be
shown is decided. For example, the user is 19 years old. All the rules will match, but since the hit policy is set to
first only, the advertisement for Cars is used.

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-hit-policy
