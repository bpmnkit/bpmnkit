---
"@bpmnkit/core": patch
---

Auto-layout fixes found while porting it to Rust: a pool whose process holds only text annotations now draws them inside the pool instead of dropping them and showing an empty 60 px pool; the orthogonal router no longer gives up on a route whose target port sits at a fractional coordinate; re-laying out a diagram whose source DI gives two elements the same id `X_di` no longer writes that id twice; an association inside a sub-process that cuts through a shape is now re-routed around it, like a top-level one.
