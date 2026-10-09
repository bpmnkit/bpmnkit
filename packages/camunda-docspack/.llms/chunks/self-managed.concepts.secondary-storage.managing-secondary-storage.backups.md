# Manage secondary storage — Backups

Regular backups of your secondary storage are critical for disaster recovery and business continuity.

- Follow the official Camunda backup procedure step by step.
- Schedule backups regularly based on data volume and business requirements.
- Periodically test restore operations to confirm that your backups are valid and usable.


## Index templates

If you use [Elasticsearch/OpenSearch](https://docs.camunda.io/docs/next/reference/glossary#elasticsearchopensearch), Camunda uses index templates to define settings and mappings for indices.

To prevent issues:

- Avoid using custom index templates that conflict with Camunda’s defaults. Templates with higher priority may override Camunda mappings and cause incorrect index creation.
- Do not delete or modify existing Camunda index templates without explicit guidance from Camunda Support.

If your provider includes predefined wildcard index templates, set a higher priority for the Camunda templates to prevent conflicts.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/managing-secondary-storage
