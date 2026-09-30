---
"@bpmnkit/drop": minor
---

Describe-to-diagram hedges against Workers AI queueing. If `AI_GENERATE_MODEL` has written nothing after `AI_GENERATE_HEDGE_MS` (1500 ms), or fails first, the request also goes to `AI_GENERATE_FALLBACK_MODEL`, which is gemma-4 by default. Whichever model writes first is streamed and the other is cancelled.

Both calls are charged to the daily budget. The winner's answer is cached under the request. Each generation logs `drop.generate` with the winning model and whether it hedged.
