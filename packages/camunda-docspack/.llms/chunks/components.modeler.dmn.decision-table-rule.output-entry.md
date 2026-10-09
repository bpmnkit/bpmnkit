# Rule — Output entry

![Output Entry](assets/decision-table/output-entry.png)

A rule can have one or more output entries, which are the conclusions of the rule. Each output entry contains an
expression in a `text` element as child of an `outputEntry` XML element.

The expression language of the output entry is [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction).

```xml

<outputEntry id="outputEntry4">
    <text>"Steak"</text>
</outputEntry>
```


## Description

![Description](assets/decision-table/description.png)

A rule can be annotated with a description that provides additional information. The description text is set inside
the `description` XML element.

```xml

<rule id="rule4">
    <description>Save money</description>
    <!-- ... -->
</rule>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-rule
