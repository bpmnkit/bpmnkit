---
"@bpmnkit/profiles": minor
---

The profile store moves to the `bpmnkit` config directory. A store that only exists under `casen` is copied (not moved) on first use and marked `migrated_from`; if the copy fails, the old directory is used.
