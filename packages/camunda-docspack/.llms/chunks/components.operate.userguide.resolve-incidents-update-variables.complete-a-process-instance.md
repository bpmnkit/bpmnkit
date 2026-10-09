# Resolve incidents and update variables — Complete a process instance

If you’d like to complete the process instance, create a worker for the `Ship Without Insurance` task:

```
./bin/zbctl --insecure create worker ship-without-insurance --handler cat
```

```
./bin/zbctl.darwin --insecure create worker ship-without-insurance --handler cat
```

```
./bin/zbctl.exe --insecure create worker ship-without-insurance --handler "findstr .*"
```

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/resolve-incidents-update-variables
