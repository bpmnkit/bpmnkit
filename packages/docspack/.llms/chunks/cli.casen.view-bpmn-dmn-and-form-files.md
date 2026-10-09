# casen CLI — View BPMN, DMN, and Form files

`casen view` opens a local browser-based viewer. Accepts individual files, folders, or a mix.

```sh
casen view bpmn ./processes/     # all .bpmn files in a folder
casen view dmn routing.dmn       # DMN decision table
casen view open ./project/       # any mix of .bpmn/.dmn/.form
```

See [casen view](/docs/cli/view) for full documentation.


## Connection Profiles

A profile stores the connection details for a Camunda cluster. For Camunda SaaS, import the
credentials file Hub offers when you create an API client for a cluster:

```sh
casen profile import my-saas-cluster ./camunda-credentials.sh
casen profile use my-saas-cluster
```

Or give every value yourself. The base URL is the cluster's REST address ending in `/v2`:

```sh
casen profile create local --base-url http://localhost:8080/v2 --auth-type none
casen profile create my-saas-cluster \
  --base-url https://bru-2.zeebe.camunda.io/<cluster-id>/v2 \
  --auth-type oauth2 --client-id <id> --client-secret <secret> \
  --token-url https://login.cloud.camunda.io/oauth/token
```

Profiles are saved to `config.json` in the OS config directory (`~/.config/casen` on Linux,
`~/Library/Application Support/casen` on macOS, `%APPDATA%\casen` on Windows), readable by your
user only.

---
Source: https://bpmnkit.com/docs/cli/casen
