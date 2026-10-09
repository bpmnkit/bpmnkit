# Hit policy — Rule order — Aggregators for collect

In the visual representation of the decision table an aggregator can be selected in addition to the `COLLECT` hit
policy. The following aggregators are supported:

  
    Visual representation
    XML representation
    Result of the aggregation
  
  
    Collect (Sum)
    SUM
    the sum of all output values
  
  
    Collect (Min)
    MIN
    the smallest value of all output values
  
  
    Collect (Max)
    MAX
    the largest value of all output values
  
  
    Collect (Count)
    COUNT
    the number of output values
  

#### SUM aggregator

The SUM aggregator sums up all outputs from the satisfied rules.

![Hit Policy Collect SUM](assets/decision-table/hit-policy-collect-sum.png)

The showed decision table can be used to sum up the salary bonus for an employee. For example, the employee has been
working in the company for 3.5 years. So the first, second and third rule will match and the result of the decision
table is 600, since the output is summed up.

#### MIN aggregator

The MIN aggregator can be used to return the smallest output value of all satisfied rules. Refer to the following example of
a car insurance. After years without a car crash the insurance fee will be reduced.

![Hit Policy Collect MIN](assets/decision-table/hit-policy-collect-min.png)

For example, if the input for the decision table is 3.5 years, the result will be 98.83, since the first three rules
match but the third rule has the minimal output.

#### MAX aggregator

The MAX aggregator can be used to return the largest output value of all satisfied rules.

![Hit Policy Collect MAX](assets/decision-table/hit-policy-collect-max.png)

This decision table represents the decision for the amount of pocket money for a child. Depending of the age, the amount
grows. For example, an input of 9 will satisfy the first and second rules. The output of the second rule is larger then
the output of the first rule, so the output will be 5. A child at the age of 9 will get 5 as pocket money.

#### COUNT aggregator

The COUNT aggregator can be use to return the count of satisfied rules.

![Hit Policy Collect COUNT](assets/decision-table/hit-policy-collect-count.png)

For example, refer to the salary bonus decision table again, this time with the COUNT aggregator. With an input of 4, the
first three rules will be satisfied. Therefore, the result from the decision table will be 3, which means that after 4
years the result of the decision table is 3 salary bonuses.

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-hit-policy
