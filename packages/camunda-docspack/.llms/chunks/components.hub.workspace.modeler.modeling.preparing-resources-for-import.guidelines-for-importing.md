# Prepare resources for import into Camunda Hub — Guidelines for importing

### Hosting requirements

Each individual resource (or `.zip` file package) must:

- Be hosted at a **publicly accessible URL** that does not redirect to another page.
- Not require authentication, VPN, or non‑public network dependencies.

### Template naming

- Use stable, distinct template IDs to ensure BPMN files can reference them consistently and to avoid conflicts with other templates users might download.
- Increment the version number whenever you introduce changes that could affect existing processes.
- Element template IDs must be unique within the set of imported files.
- BPMN process IDs must be unique within the set of imported files.

**Important**

- If the imported resources include at least one BPMN, Camunda Hub treats them as a **project** and groups them accordingly.
- If no BPMN file is present, the resources are imported as **independent files** into the chosen project or folder.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/preparing-resources-for-import
