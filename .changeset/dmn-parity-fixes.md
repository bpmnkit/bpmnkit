---
"@bpmnkit/core": minor
"@bpmnkit/engine": minor
---

DMN fixes. `@bpmnkit/core`: `Dmn.export` is idempotent (kept foreign content no longer gains a blank line per export); a requirement that parsed to nothing is written without a reference instead of `href="#undefined"`; a decision's `<literalExpression>` is modelled as `DmnDecision.literalExpression` and survives next to the decision's own `<extensionElements>` (an empty `<extensionElements/>` now counts as absent); `<outputValues>` is modelled as `DmnOutput.outputValues`.

`@bpmnkit/engine`: `evaluateDecision` throws when a UNIQUE table matches several rules; PRIORITY returns the match that ranks first in the output clause's `outputValues` and OUTPUT ORDER sorts by them (rule order without `outputValues`); a value that does not conform to its input or output `typeRef` fails the decision as in Zeebe (null, `Any` and unknown types are not checked; strings convert to temporal types). `literalExpressionText` reads `decision.literalExpression`.
