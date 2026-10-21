# On-device generation in Chrome — Manual test checklist

- Generate three different descriptions; each opens a new tab with a valid diagram.
- Press Stop mid-run; the partial diagram stays and the status reads "Stopped".
- Switch tabs mid-run; the run stops and no frame lands in the other tab.
- Close the generated tab mid-run; nothing breaks.
- Paste a 2,000-character description; it is accepted or gives the "too long" message.

---
Source: https://bpmnkit.com/docs/guides/ai-on-device
