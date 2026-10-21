# On-device generation in Chrome — Requirements

- Desktop Chrome: Windows 10/11, macOS 13+, Linux, or a ChromeOS Chromebook Plus.
- More than 4 GB of VRAM, 16 GB of RAM and at least 22 GB of free disk space.
- A one-time model download, which needs an unmetered network.
- Web pages need the Prompt API origin trial (Chrome 148). Extensions and local flags do not.


## Enable it locally

1. Open `chrome://flags` and set **Prompt API for Gemini Nano** (`#prompt-api-for-gemini-nano`) to Enabled.
2. Restart Chrome.
3. Optional: open `chrome://on-device-internals` to check whether the model is available on this device.
4. Open the editor at `/editor?ai=on-device`.

The first Generate downloads the model once; the panel shows the progress. If Chrome cannot prepare
the model (for example, no disk space), the panel says why.

---
Source: https://bpmnkit.com/docs/guides/ai-on-device
