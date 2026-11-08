# zeebe-check

Runs Zeebe's own deploy-time validation (`io.camunda.zeebe.engine.processing.deployment.transform.BpmnValidator`) on BPMN files. It covers XML parse, XSD, and the design-time, runtime/FEEL and length validators. It does not cover the straight-through-loop check or the checks that need other deployed resources; those need a real broker.

It prints `OK <file>` or `FAIL <file>` followed by Zeebe's errors. It exits with 1 if any file is rejected.

```sh
cd tools/zeebe-check
mvn -q -B dependency:copy-dependencies -DoutputDirectory=lib   # ~110 MB, not committed
javac -cp "lib/*" -d out src/ZCheck.java
java -cp "out:lib/*" ZCheck ../../conformance/builder/*/expected/output.bpmn
```

The Zeebe version is pinned in `pom.xml` (`zeebe-workflow-engine`). It needs Java 21. A full check of the repo's ~1,200 BPMN files takes about 6 s. Background and results are in `doc/deployability/`.
