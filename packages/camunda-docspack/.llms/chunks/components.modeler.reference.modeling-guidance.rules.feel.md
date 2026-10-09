# FEEL

Reference for the `feel` rule.

When using the [FEEL expression language](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel), you must specify a valid expression.


## (guideline) Invalid FEEL expression

A common cause of this warning is using single quotes for a string literal. FEEL requires double quotes for strings, so an expression like `'type'` is unparsable.

![Invalid FEEL expression](./img/feel/wrong.png)


## (guideline) Valid FEEL expression

Use double quotes for string literals, for example `"type"`, to make the expression valid.

![Valid FEEL expression](./img/feel/right.png)


## References

- [FEEL expressions](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel)
- [FEEL Scala Playground](https://camunda.github.io/feel-scala/docs/playground/) to try out expressions
- [Rule source](https://github.com/camunda/bpmnlint-plugin-camunda-compat/blob/main/rules/camunda-cloud/feel.js)

---
Source: https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/feel
