# Diagram Converter — Use the CLI — windows

```shell
java -jar camunda-7-to-8-diagram-converter-cli-{version}.jar local .\my-processes\
```

Key options for `local` mode:

| Option               | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| `--platform-version` | Semantic version of the target platform (defaults to latest)  |
| `--csv`              | Create a CSV file with analysis results                       |
| `--json`             | Create a JSON file with analysis results                      |
| `--xlsx`             | Create an XLSX file with analysis results                     |
| `--prefix`           | Prefix for the generated file name (default: `converted-c8-`) |
| `-o, --override`     | Override existing files                                       |

To see all available options:

```shell
java -jar camunda-7-to-8-diagram-converter-cli-{version}.jar local --help
```

Local mode parameter reference

| Parameter                                              | Description                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `<file>`                                               | File to convert or directory to scan for diagrams and forms                     |
| `--add-data-migration-execution-listener`              | Add an execution listener on blank start events for the Camunda 7 Data Migrator |
| `--always-use-default-job-type`                        | Always use the configured default job type                                      |
| `--check`                                              | Analyze only, without exporting converted diagrams                              |
| `--csv`                                                | Create a CSV file with analysis results                                         |
| `--json`                                               | Create a JSON file with analysis results                                        |
| `-d, --documentation`                                  | Also append messages to diagram documentation                                   |
| `--data-migration-execution-listener-job-type=<value>` | Override the listener job type from `converter-properties.properties`           |
| `--default-job-type=<value>`                           | Override the default job type from `converter-properties.properties`            |
| `--disable-append-elements`                            | Disable appending conversion messages to BPMN or DMN XML                        |
| `-h, --help`                                           | Show help and exit                                                              |
| `--keep-job-type-blank`                                | Keep job types blank so you can set them manually after conversion              |
| `--md, --markdown`                                     | Create a Markdown results file                                                  |
| `-nr, --not-recursive`                                 | Do not scan subdirectories recursively                                          |
| `-o, --override`                                       | Override existing files                                                         |
| `--platform-version=<platformVersion>`                 | Set target Camunda 8 semantic version                                           |
| `--prefix=<prefix>`                                    | Prefix for generated file names (default: `converted-c8-`)                      |
| `-V, --version`                                        | Print version information and exit                                              |
| `--xlsx`                                               | Create an XLSX file with analysis results                                       |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/diagram-converter
