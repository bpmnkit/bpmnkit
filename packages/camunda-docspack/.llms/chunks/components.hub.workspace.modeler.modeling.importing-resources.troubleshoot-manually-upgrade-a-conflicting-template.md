# Import resources into Camunda Hub — Troubleshoot — Manually upgrade a conflicting template

If a project depends on a template that is being ignored or differs from your existing template, you can manually upgrade it following these steps:

1. Copy the desired template contents:
   - Open the template JSON file from the import source.
   - Copy the entire template definition.
2. Navigate to the conflicting template:
   - In Camunda Hub, open the existing template that shares the same ID and version.
   - If you do not have access, ask your organization or workspace admin to open it.
3. Replace the contents of the existing template with the copied JSON.
4. Increase the `version` field to a number higher than the highest published version.
5. Publish the updated template to the relevant project and/or organization.
6. Reopen the BPMN process and click on an element that uses the template.
7. Click **Update available**. Then, click **Update**.
8. The updated fields should now be visible in the properties panel.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/importing-resources
