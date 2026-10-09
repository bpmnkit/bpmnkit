# Get started with the catalog — Organize your assets

Within your Git repository, each asset is grouped in its own directory. For example:

```
your-repo/
├── payment-connector/
│   ├── README.md
│   └── payment-connector.json
├── approval-task/
│   ├── README.md
│   └── approval-task.json
└── order-template/
    ├── README.md
    └── order-template.json
```

The asset directories don't have to be at the repository root. The [sync script](https://github.com/camunda/catalog-template/blob/main/scripts/sync-catalog.sh) discovers them wherever they are, so you can nest them under a subfolder alongside other content.

Each asset directory contains exactly two files:

- **README.md**: A Markdown file with metadata in the frontmatter and a description in the body. The frontmatter references the element template file and provides optional attributes like category and tags.
- **Element template file**: The [element template descriptor](https://docs.camunda.io/docs/next/components/modeler/element-templates/defining-templates). The `id` and `version` fields in this file are authoritative for the asset's identity and version in the catalog. The asset name, short description, and icon are also read from this file.

The sync script only looks at these two files; any other files in the repository are ignored.

**Note**
Only the README and element template file are published to the catalog. The asset's implementation—such as job workers, BPMN files, or linked forms—stays in your repository as the source of truth and is deployed to your cluster through your own deployment pipeline. The catalog holds the element template and its description; it does not run or deploy the underlying implementation.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started
