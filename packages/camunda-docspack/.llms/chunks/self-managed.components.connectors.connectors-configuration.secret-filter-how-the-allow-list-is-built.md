# Configuration — Secret filter — How the allow-list is built

Every field you configure in a connector's properties panel is implemented as a Zeebe input mapping under the hood, whether it's an authentication field or a functional field like an email body, an HTTP header, or a query parameter. If a field contains a literal `{{secrets.NAME}}` reference, the filter allow-lists `NAME` for that specific field, identified by its field path — not for the connector element as a whole.

The allow-list is built once per element, from the deployed BPMN model, by scanning the literal text of that element's own fields for `{{secrets.NAME}}` references and recording which field each reference belongs to:

- **It's static, not dynamic.** The filter looks at what's literally written in the model, not at what a process variable resolves to at runtime. If a secret value already resolved by one connector task later flows into a different task's field as a plain process variable (for example, `= myVariable`), that's just data at that point. There's no `{{secrets.*}}` placeholder left for the filter to check, so the filter has no say over it either way.
- **It's scoped to the field, not just the element.** A secret declared on one field (for example, `authentication.password = {{secrets.AUTH}}`) doesn't become resolvable on a _different_ field of the same task, such as an email body. If that other field's runtime value happens to contain the literal text `{{secrets.AUTH}}` — for example, because it evaluates a process variable crafted to contain that string — the filter checks it against that field's own allow-list entry, not `authentication.password`'s, and leaves it unresolved.
- **One exception: fields the model itself chains together.** If one field's FEEL expression assigns from a name that another field's expression also references (for example, `url = baseUrl + "/path"`, where `baseUrl` is itself another input on the same element), the secret declared on the first field is also allowed on the second — the model author's own expressions connect them. This is still resolved statically, from the deployed model's FEEL expressions, not from arbitrary runtime process-variable content.
- **It's still per element, not per process.** A secret referenced only on task A never becomes available to task B: task B's allow-list is built only from task B's own fields.

This closes the gap an element-wide allow-list would leave open: declaring a secret anywhere on a task no longer makes it resolvable from every field on that task — only from the field it was declared on (and fields the model explicitly chains to it).

**Note**
For inbound connectors, the allow-list comes from data already held in memory on the deployed element, so there's no remote lookup that can fail. As a result, `LAX` and `STRICT` behave identically for inbound connectors: both enforce the allow-list unconditionally. The distinction between `LAX` and `STRICT` described below only affects outbound connectors, where building the allow-list requires a lookup against the process definition.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
