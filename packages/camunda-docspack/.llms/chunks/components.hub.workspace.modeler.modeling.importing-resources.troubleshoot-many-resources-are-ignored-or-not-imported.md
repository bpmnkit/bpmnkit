# Import resources into Camunda Hub — Troubleshoot — Many resources are ignored or not imported

If you see many resources that cannot be imported, check the following:

- Confirm that the URLs (for single-file imports) or the `.zip` URL are:
  - Publicly reachable.
  - Pointing to the correct files.
- For `.zip` imports:
  - Check that the archive size is at most **10 MB**.
  - Ensure there are no more than **100** meaningful entries; extra files might be ignored.
- For templates:
  - Verify that IDs and versions are what you expect.
  - Consider whether equal or higher versions already exist.

If the issue persists, try importing a small subset of files or a simpler `.zip` to isolate problematic resources.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/importing-resources
