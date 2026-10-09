# Decision literal expression

A decision literal expression represents decision logic which can be depicted as an expression in DMN.

![Decision literal expression](assets/decision-literal-expression/decision-literal-expression.png)

A decision literal expression represents decision logic which can be depicted as an expression. It consists of
a [literal expression](#literal-expression) and a [variable](#variable).

A decision literal expression is represented by a `literalExpression` element inside a `decision` XML element.

```xml

<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="definitions" name="definitions"
             namespace="http://camunda.org/schema/1.0/dmn">
    <decision id="season" name="Season">
        <variable name="season" typeRef="string"/>
        <literalExpression>
            <text>calendar.getSeason(date)</text>
        </literalExpression>
    </decision>
</definitions>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-literal-expression
