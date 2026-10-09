# Rule — Input entry

![Input Entry](assets/decision-table/input-entry.png)

A rule can have one or more input entries, which are the conditions of the rule. Each input entry contains an expression
in a `text` element as child of an
`inputEntry` XML element.

The expression language of the input entry is [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-unary-tests) (unary-tests).

The input entry is satisfied when the evaluated expression returns `true`.

```xml

<inputEntry id="inputEntry41">
    <text>"Spring"</text>
</inputEntry>
```

### Empty input entry

In case an input entry is irrelevant for a rule, the expression is empty, which is always satisfied. In FEEL, an empty
input entry is represented by a `-`.

```xml

<inputEntry id="inputEntry41">
    <text/>
</inputEntry>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-rule
