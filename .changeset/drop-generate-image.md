---
"@bpmnkit/drop": minor
---

Describe-to-diagram drafts from an image: pick or paste a whiteboard photo, sketch or screenshot, with an optional description. The page scales it down and re-encodes it as JPEG. `POST /drop/api/generate` accepts `{ image, description? }` and sends it to the vision model `AI_GENERATE_IMAGE_MODEL` (default `@cf/google/gemma-4-26b-a4b-it`). The answer streams, is cached and can be changed like a typed draft. Leave the var unset to refuse images.
