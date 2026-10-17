# Hit policy

Specifies what the results of the evaluation of a decision table consist of.

![Hit Policy](assets/decision-table/hit-policy.png)

A decision table has a hit policy that specifies what the results of the evaluation of a decision table consist of.

The hit policy is set in the `hitPolicy` attribute on the `decisionTable` XML element. If no hit policy is set, then the
default hit policy `UNIQUE` is used.

```xml

<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="definitions" name="definitions"
             namespace="http://camunda.org/schema/1.0/dmn">
    <decision id="dish" name="Dish">
        <decisionTable id="decisionTable" hitPolicy="RULE ORDER">
            <!-- .. -->
        </decisionTable>
    </decision>
</definitions>
```

The following hit policies are supported:

  
    Hit Policy
    XML representation
  
  
    Unique
    UNIQUE
  
  
    Any
    ANY
  
  
    First
    FIRST
  
  
    Rule order
    RULE ORDER
  
  
    Collect
    COLLECT

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-hit-policy
