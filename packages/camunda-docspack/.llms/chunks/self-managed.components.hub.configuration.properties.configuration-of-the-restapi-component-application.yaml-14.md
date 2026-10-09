# Property reference — Configuration of the `restapi` component — application.yaml

```yaml
camunda.hub:
  git-sync:
    max-files: 100 # default
    max-in-memory-size: 4MB # default
    github:
      base-url: https://api.github.com # default
    gitlab:
      base-url: https://gitlab.com/api/v4 # default
    azure:
      base-url: https://dev.azure.com # default
      api-version: "7.1" # default
      authority-base-path: https://login.microsoftonline.com # default
      scope: https://app.vssps.visualstudio.com/.default # default
    bitbucket:
      base-url: https://api.bitbucket.org/2.0/repositories # default
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
