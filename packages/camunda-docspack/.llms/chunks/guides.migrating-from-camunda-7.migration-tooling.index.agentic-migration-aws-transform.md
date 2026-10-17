# Migration tools — Agentic migration — aws-transform

[AWS Transform](https://docs.aws.amazon.com/transform/latest/userguide/custom.html), Amazon's agentic modernization service, runs the same skill as a custom transformation. Instead of installing the skill per developer, you publish it once to your organization's registry and run it with the [`atx` CLI](https://docs.aws.amazon.com/transform/latest/userguide/custom-get-started.html) (Node.js 22 or later, with configured AWS credentials). The source and test projects must be Git repositories with at least one commit.

Check out the tooling and create the transformation from the skill:

```bash
git clone https://github.com/camunda/camunda-7-to-8-migration-tooling.git
cd camunda-7-to-8-migration-tooling/agentic-migration-skills

# Save a private draft to validate first (drafts expire after 30 days)
atx custom def save-draft -n "camunda-7-to-camunda-8-migration" \
  --description "Migrate your Camunda 7 project to Camunda 8" \
  --sd skills/migrate-c7-to-c8-code/

# Run the draft against a test project using the version ID returned above.
cd /path/to/test-camunda-7-project
atx custom def exec -n "camunda-7-to-camunda-8-migration" \
  --tv <draft-version-id> \
  -p . \
  -c "<build-command>"

# Publish the tested draft to your organization for anyone with the required IAM permissions
cd /path/to/camunda-7-to-8-migration-tooling/agentic-migration-skills
atx custom def publish -n "camunda-7-to-camunda-8-migration" \
  --tv <draft-version-id>
```

Replace `<build-command>` with the command for your project, such as `mvn verify` for Maven or `./gradlew build` for Gradle. After you validate the draft, run the published transformation from the project directory. Running by name uses the latest published version, so you don't pass a version ID:

```bash
atx custom def exec -n "camunda-7-to-camunda-8-migration" -p . -c "<build-command>"
```

The skill asks for your migration scope:

| Scope                                      | What the agent does                                                                                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Code + models** _(recommended, default)_ | Uses the Diagram Converter CLI as the default for BPMN, DMN, and Camunda 7 forms, then lets you select a Java migration path after inventory. |
| **Code only**                              | Inventories Java code, then lets you select an AI-first or recipe-assisted path.                                                              |
| **Models only**                            | Uses the Diagram Converter CLI as the default for BPMN, DMN, and Camunda 7 forms.                                                             |
| **Assessment only**                        | Inventories files and estimates effort without changes.                                                                                       |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/index
