# zeebe-check

Runs Zeebe's own deploy-time validation (`io.camunda.zeebe.engine.processing.deployment.transform.BpmnValidator`) on BPMN files. It covers XML parse, XSD, and the design-time, runtime/FEEL and length validators. It does not cover the straight-through-loop check or the checks that need other deployed resources; those need a real broker.

The Zeebe version is pinned in `pom.xml` (`zeebe-workflow-engine`). It needs Java 21 and Maven. Background and results are in `doc/deployability/`.

## CI oracle

```sh
pnpm zeebe:check                  # build if needed, validate the whole corpus
pnpm zeebe:check --base origin/main
```

It validates `conformance/{builder,text,compact,bpmn}` outputs and `doc/deployability/repro/*.bpmn` (about 600 files, a few seconds) and exits 1 on any failure.

- `case.json` may hold `"deployable": false` plus a required `"deployableReason"`; absent means the output must deploy. Text and bpmn cases may carry a `case.json` with only these keys (the runners ignore unknown keys).
- `doc/deployability/known-undeployable.json` lists outputs Zeebe rejects today, with the first error. It may only shrink. Failures: a rejected, unlisted case; a listed case Zeebe now accepts (delete the entry); a listed key with no case or marked `deployable: false`; a different `zeebeVersion` than `pom.xml`; with `--base <ref>`, any key that is not in the list at that ref.
- `doc/deployability/repro/expected-verdicts.json` pins the verdict and errors of each repro. Refresh with `--update-repros`.
- `--seed-allowlist` rewrites the allowlist from every currently rejected case. Use it only to create the list or after re-recording the corpus.
- `--json` prints the summary as JSON.

The pure logic is in `scripts/zeebe-check-lib.mjs` (tested by `pnpm test:scripts`).

## Direct use

```sh
cd tools/zeebe-check
mvn -q -B dependency:copy-dependencies -DoutputDirectory=lib   # ~110 MB, git-ignored
javac -cp "lib/*" -d out src/ZCheck.java
java -cp "out:lib/*" ZCheck ../../conformance/builder/*/expected/output.bpmn
java -cp "out:lib/*" ZCheck --json @files.txt   # one JSON object per file; @file = one path per line
```

Text mode prints `OK <file>` or `FAIL <file>` plus Zeebe's errors and exits 1 if any file is rejected.
