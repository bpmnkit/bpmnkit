# Import resources into Camunda Hub — Troubleshoot — Properties panel fields are missing or show “template not found”

You may experience this issue when:

- A user task or connector task in BPMN shows a warning such as “template not found”.
- Some fields you expect to see in the properties panel are missing.
- Some templates could not be imported.

#### Why this happens

- The process expects a **template version** that was not imported:
  - A higher version already exists and the imported version was ignored.
  - An intermediate version (for example, version 2) does not exist, while version 1 and 3 do.
- An existing template with the **same ID and version** has different contents.

#### How you can solve it

- Manually upgrade the template to match the process. See the [manual upgrade steps](#manually-upgrade-a-conflicting-template) section for more details.
- If a higher version already exists, you may need to:
  1. Unlink the older template version in the BPMN editor.
  2. Link the task to the newer template.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/importing-resources
