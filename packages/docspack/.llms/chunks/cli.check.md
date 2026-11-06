# casen check

`casen check` is the gate to run before you deploy, or after every edit in an agent loop.
It takes any mix of BPMN, DMN and form files and checks each one, then the references
between them. It exits non-zero when there is an error.

```sh
casen check order.bpmn review.form discount.dmn
```

```
order.bpmn
  ⚠ check/unresolved-form [ReviewOrder] "ReviewOrder" links formId "review", which none of the checked forms has.
      fix: Set formId to one of "review-form", or check the form that has id "review" too.
discount.dmn
  ✖ dmn/feel-syntax [InputEntry_3] Input entry of rule "Rule_2" is not valid FEEL unary tests: Unexpected token '<' (at 9) in `>= 10 and < 20`.
      fix: Write unary tests: a value ("gold", 42), a comparison (> 10), a range ([1..5]), a list ("a","b"), not(...), or - for any.

2 findings: 1 error, 1 warning
```

---
Source: https://bpmnkit.com/docs/cli/check
