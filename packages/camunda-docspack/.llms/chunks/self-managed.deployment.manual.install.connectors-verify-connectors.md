# Camunda manual installation — Connectors — Verify Connectors

Check the logs for a successful startup message, such as:

```bash
2025-08-05T14:49:58.641+02:00  INFO 99856 --- [           main] o.s.b.a.e.web.EndpointLinksResolver      : Exposing 3 endpoints beneath base path '/actuator'
2025-08-05T14:49:58.666+02:00  INFO 99856 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 9090 (http) with context path '/'
2025-08-05T14:49:58.702+02:00  INFO 99856 --- [           main] i.c.c.r.app.ConnectorRuntimeApplication  : Started ConnectorRuntimeApplication in 1.286 seconds (process running for 1.386)
```

Check the health status of Connectors with the actuator endpoint:

```bash
curl localhost:9090/actuator/health
```

  Example output
  

```json
{
  "status": "UP",
  "groups": ["readiness"],
  "components": {
    "camundaClient": {
      "status": "UP"
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": -1,
        "free": -1,
        "threshold": -1,
        "path": "/home/user/connectors/.",
        "exists": true
      }
    },
    "ping": {
      "status": "UP"
    },
    "processDefinitionImport": {
      "status": "UP",
      "details": {
        "operateEnabled": true
      }
    },
    "ssl": {
      "status": "UP",
      "details": {
        "validChains": [],
        "invalidChains": []
      }
    },
    "zeebeClient": {
      "status": "UP",
      "details": {
        "numBrokers": 1,
        "anyPartitionHealthy": true
      }
    }
  }
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
