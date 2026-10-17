# Diagram Converter — Use the CLI — Engine mode

Use engine mode to process diagrams directly from a running Camunda 7 engine via its REST API:

```shell
java -jar camunda-7-to-8-diagram-converter-cli-{version}.jar engine http://localhost:8080/engine-rest --json --xlsx
```

Key options for `engine` mode:

| Option                   | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| `--platform-version`     | Semantic version of the target platform (defaults to latest)   |
| `-u, --username`         | Username for Basic authentication                              |
| `-p, --password`         | Password for Basic authentication                              |
| `-t, --target-directory` | Directory to save the .bpmn files (default: current directory) |
| `--csv`                  | Create a CSV file with analysis results                        |
| `--json`                 | Create a JSON file with analysis results                       |
| `--xlsx`                 | Create an XLSX file with analysis results                      |

To see all available options:

```shell
java -jar camunda-7-to-8-diagram-converter-cli-{version}.jar engine --help
```

Engine mode parameter reference

| Parameter                                              | Description                                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `<url>`                                                | Fully qualified Camunda 7 REST API URL (default: `http://localhost:8080/engine-rest`) |
| `--add-data-migration-execution-listener`              | Add an execution listener on blank start events for the Camunda 7 Data Migrator       |
| `--always-use-default-job-type`                        | Always use the configured default job type                                            |
| `--check`                                              | Analyze only, without exporting converted diagrams                                    |
| `--csv`                                                | Create a CSV file with analysis results                                               |
| `--json`                                               | Create a JSON file with analysis results                                              |
| `-d, --documentation`                                  | Also append messages to diagram documentation                                         |
| `--data-migration-execution-listener-job-type=<value>` | Override the listener job type from `converter-properties.properties`                 |
| `--default-job-type=<value>`                           | Override the default job type from `converter-properties.properties`                  |
| `--disable-append-elements`                            | Disable appending conversion messages to BPMN or DMN XML                              |
| `-h, --help`                                           | Show help and exit                                                                    |
| `--keep-job-type-blank`                                | Keep job types blank so you can set them manually after conversion                    |
| `--md, --markdown`                                     | Create a Markdown results file                                                        |
| `-o, --override`                                       | Override existing files                                                               |
| `-p, --password`                                       | Password for Basic authentication                                                     |
| `--platform-version=<platformVersion>`                 | Set target Camunda 8 semantic version                                                 |
| `--prefix=<prefix>`                                    | Prefix for generated file names (default: `converted-c8-`)                            |
| `-t, --target-directory=<targetDirectory>`             | Directory to save converted `.bpmn` files                                             |
| `-u, --username=<username>`                            | Username for Basic authentication                                                     |
| `-V, --version`                                        | Print version information and exit                                                    |
| `--xlsx`                                               | Create an XLSX file with analysis results                                             |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/diagram-converter
