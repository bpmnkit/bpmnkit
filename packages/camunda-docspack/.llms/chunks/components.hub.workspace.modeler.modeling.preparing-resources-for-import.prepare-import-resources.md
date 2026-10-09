# Prepare resources for import into Camunda Hub — Prepare import resources

### Prepare individual resources

Use this approach when:

- You have a small set of resources.
- You don't expect to add or remove files often.

Keep each file within Camunda Hub’s per‑resource size limit of **three MB**.

### Prepare packaged resources

Use this approach when:

- Your solution includes many resources (up to 100), such as multiple BPMN and DMN models, forms, element templates, and documentation.
- You want to minimize the risk of missing dependencies during import.

#### File and archive limits

When preparing the packaged resources into a `.zip` file:

- Keep the total `.zip` file size at or below **10 MB**.
- Include **at most 100 files** that Camunda Hub can support.
- Keep each packaged file within Camunda Hub’s per‑resource size limit of **three MB**.
- Include at most one README file.
- Note that the folder structure **will not** be imported into Camunda Hub.

#### Content and security rules

To minimize issues during import:

- Do not include files with `..` or leading slashes in their name.
- Exclude executables, scripts, and any other files not supported by Camunda Hub.
- Ensure each resource file is within Camunda Hub’s per‑resource size limit.
- Use clear, stable file names.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/preparing-resources-for-import
