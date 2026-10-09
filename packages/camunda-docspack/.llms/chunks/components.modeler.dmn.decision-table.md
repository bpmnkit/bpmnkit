# Overview

This document outlines an overview of decision tables and their general properties.

![Decision Table](assets/decision-table/dish-table.png)

A decision table represents decision logic which can be depicted as a table. It consists
of [inputs](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-input), [outputs](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-output) and [rules](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-rule).

A decision table is represented by a `decisionTable` element inside a
`decision` XML element.

```xml

<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="definitions" name="definitions"
             namespace="http://camunda.org/schema/1.0/dmn">
    <decision id="dish" name="Dish">
        <decisionTable id="decisionTable">
            <!-- ... -->
        </decisionTable>
    </decision>
</definitions>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table
