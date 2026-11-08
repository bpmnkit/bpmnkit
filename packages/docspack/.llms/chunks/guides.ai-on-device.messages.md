# On-device generation in Chrome — Messages

| Case | Message |
|---|---|
| Description too long | "Description too long for the on-device model — shorten it." Nothing is sent. |
| Model could not be prepared | "Chrome couldn't prepare the on-device model: reason" |
| Context overflow mid-run | "The diagram outgrew the model's context — try a smaller process." The partial tab is kept. |
| Stream error | "Generation failed: reason". The partial tab is kept. |
| Prose instead of a diagram | "The model didn't return a diagram — try rephrasing." No tab opens. |

---
Source: https://bpmnkit.com/docs/guides/ai-on-device
