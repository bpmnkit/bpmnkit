# @bpmnkit/core — Installation — `reconcileCompact(definitions, compact, options?)`

Applies a `CompactDiagram` to an existing model as a set of changes. Elements that already
exist are patched in place and keep their extensions, new ones are inserted, and ones the input
no longer mentions are removed — where `expand(compact)` would rebuild the whole document and
discard everything the compact form cannot describe.

Processes are only added, never removed: sending one process of a multi-process document means
"this is how that process should look", not "delete the others".

The `lanes`, `participants` and `messageFlows` keys are checked on the result. A message whose
end is neither a pool nor a node in one, a pool naming a missing process, a message inside one
pool, or an id that two elements, lanes or pools share throws, with `strict: false` too, unless
the input document already had that problem.

---
Source: https://bpmnkit.com/docs/packages/core
