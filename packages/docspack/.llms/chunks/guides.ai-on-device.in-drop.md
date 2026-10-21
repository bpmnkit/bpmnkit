# On-device generation in Chrome — In Drop

Add `?ai=on-device` to Drop's page (`/drop?ai=on-device`) and "Describe a process" drafts on the
device: no access code, no challenge, no request to Drop's server. The follow-up steps that call
the server stay off in this mode: the check for missing elements, connector configuration,
drafting from an image and change requests. Share still works. Where the model isn't available,
the page says so and keeps using Drop's server as usual.


## Manual test checklist

- Generate three different descriptions; each opens a new tab with a valid diagram.
- Press Stop mid-run; the partial diagram stays and the status reads "Stopped".
- Switch tabs mid-run; the run stops and no frame lands in the other tab.
- Close the generated tab mid-run; nothing breaks.
- Paste a 2,000-character description; it is accepted or gives the "too long" message.

---
Source: https://bpmnkit.com/docs/guides/ai-on-device
