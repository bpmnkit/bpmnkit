# Manage file versions — Files with a version history

The version history page is the same for every file type that uses it:

| File type           | Version history URL          |
| ------------------- | ---------------------------- |
| BPMN or DMN diagram | `/diagrams/<id>/versions`    |
| Form                | `/forms/<id>/versions`       |
| RPA script          | `/rpa-scripts/<id>/versions` |
| README file         | `/readmes/<id>/versions`     |
| Test file           | `/tests/<id>/versions`       |

Element templates and connector templates do not use this page or version history. They use numbered template versions that you publish to your project or organization. Restoring an element template version publishes its content as a new numbered version; there's no autosave step, since the previous published version remains available in the versions list. See [versioning element templates](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates#versioning-element-templates).

**Note**
Links that use the older `/milestones/<slug>` path redirect to the equivalent `/versions/<slug>` path, so existing bookmarks and shared links keep working.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/versions
