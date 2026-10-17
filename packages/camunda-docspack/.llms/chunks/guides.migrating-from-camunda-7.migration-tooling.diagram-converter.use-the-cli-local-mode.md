# Diagram Converter — Use the CLI — Local mode

The local CLI accepts a file or directory. When you provide a directory, it scans the directory and its subdirectories for `.bpmn`, `.bpmn20.xml`, `.dmn`, `.dmn11.xml`, and `.form` files by default, then processes every supported file it finds (use `-nr, --not-recursive` to disable recursion).

```shell
java -jar camunda-7-to-8-diagram-converter-cli-{version}.jar local myDiagram.bpmn --json --xlsx
```

To process all BPMN, DMN, and form files in a directory and its subdirectories:

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/diagram-converter
