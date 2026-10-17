# Rule

Specify conditions and conclusions.

![Rule](assets/decision-table/rule.png)

A decision table can have one or more rules. Each rule contains input and output entries. The input entries are the
condition and the output entries the conclusion of the rule. If each input entry (condition) is satisfied, then the rule
is satisfied and the decision result contains the output entries
(conclusion) of this rule.

A rule is represented by a `rule` element inside a `decisionTable` XML element.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="definitions" name="definitions"
             namespace="http://camunda.org/schema/1.0/dmn">
    <decision id="dish" name="Dish">
        <decisionTable id="decisionTable">
            <!-- ... -->
            <rule id="rule2-950612891-2">
                <inputEntry id="inputEntry21">
                    <text>"Winter"</text>
                </inputEntry>
                <inputEntry id="inputEntry22">
                    <text><![CDATA[<= 8]]></text>
                </inputEntry>
                <outputEntry id="outputEntry2">
                    <text>"Roastbeef"</text>
                </outputEntry>
            </rule>
            <!-- ... -->
        </decisionTable>
    </decision>
</definitions>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-rule
