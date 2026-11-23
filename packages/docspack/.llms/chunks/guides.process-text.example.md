# BPMN Kit Text — the line format — Example

```text
# Expense approval
start[start Expense submitted] > check[xor Amount over 1000?]
check >(Yes: amount > 1000) review[user Review expense | form=expense_review] > pay[service Pay expense | job=pay-expense] > done[end Expense paid]
check >(No: default) auto[service Approve automatically] > pay
failed[boundary:error Payment failed | on=pay | error=PAYMENT_FAILED] > notify[send Notify submitter] > notice[end Payment failed]
```

This parses with no `problems` and one `fix`: `joined 2 flows into "pay" with xor gateway "pay_join"`.
The example runs as a test (`packages/core/tests/process-text-guide-page.test.ts`), including the
stream and the write-back round trip.

---
Source: https://bpmnkit.com/docs/guides/process-text
