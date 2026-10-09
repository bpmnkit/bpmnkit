# Template metadata — Predefined configurations: `steps` and `presets` — Defining the menu with `steps`

`steps` define a hierarchical menu shown when the template is applied. A step is either a category or a final choice:

- A category step has nested `steps` and groups other steps. Selecting it navigates into its child steps.
- A leaf step references a preset through `presetId` and applies that preset when selected.

A step must define either `steps` or `presetId`, but not both.

- `steps : Array<Object>` defines the menu. Each step has the following attributes:
  - `name : String` is a required key that defines the step's label in the menu.
  - `description : String` is an optional key shown alongside the name.
  - `keywords : Array<String>` is an optional key listing extra terms used to match the step in search.
  - `steps : Array<Object>` is the list of nested child steps. Defining this key marks the step as a category.
  - `presetId : String` references a preset by its `id`. Defining this key marks the step as a leaf.

The following example defines a connector template with two categories, each containing two operations that map to a preset:

```json
{
  ...,
  "steps": [
    {
      "name": "Issues",
      "description": "Manage GitHub issues",
      "steps": [
        {
          "name": "Create Issue",
          "description": "Create a new issue",
          "keywords": ["create issue", "open ticket"],
          "presetId": "createIssue"
        },
        {
          "name": "List Issues",
          "description": "List issues in a repository",
          "keywords": ["list issues", "get issues"],
          "presetId": "listIssues"
        }
      ]
    },
    {
      "name": "Branches",
      "description": "Manage GitHub branches",
      "steps": [
        {
          "name": "List Branches",
          "keywords": ["list branches", "get branches"],
          "presetId": "listBranches"
        }
      ]
    }
  ],
  "presets": [
    {
      "id": "createIssue",
      "properties": {
        "operationGroup": "issues",
        "issueOperationType": "createIssue"
      }
    },
    {
      "id": "listIssues",
      "properties": {
        "operationGroup": "issues",
        "issueOperationType": "listIssues"
      }
    },
    {
      "id": "listBranches",
      "properties": {
        "operationGroup": "branches",
        "branchOperationType": "listBranches"
      }
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata
