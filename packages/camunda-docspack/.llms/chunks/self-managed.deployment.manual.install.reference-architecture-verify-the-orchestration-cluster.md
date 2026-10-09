# Camunda manual installation — Reference architecture — Verify the Orchestration Cluster

Check the logs for a successful startup message, such as:

```bash
[2025-08-05 13:34:51.964] [main] INFO
	org.springframework.boot.web.embedded.tomcat.TomcatWebServer - Tomcat started on port 8080 (http) with context path '/'
  ...
[2025-08-05 13:34:52.006] [main] INFO
	org.springframework.boot.web.embedded.tomcat.TomcatWebServer - Tomcat initialized with port 9600 (http)
[2025-08-05 13:34:52.048] [main] INFO
	org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext - Root WebApplicationContext: initialization completed in 79 ms
[2025-08-05 13:34:52.054] [main] INFO
	org.springframework.boot.actuate.endpoint.web.EndpointLinksResolver - Exposing 17 endpoints beneath base path '/actuator'
[2025-08-05 13:34:52.078] [main] INFO
	org.springframework.boot.web.embedded.tomcat.TomcatWebServer - Tomcat started on port 9600 (http) with context path '/'
[2025-08-05 13:34:52.088] [main] INFO
	io.camunda.application.StandaloneCamunda - Started StandaloneCamunda in 9.376 seconds (process running for 9.817)
```

Check the cluster topology with the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview):

```bash
# replace username and password with the details of the admin user you created on first startup
curl -u username:password -L 'http://localhost:8080/v2/topology' \
  -H 'Accept: application/json'
```

  Example output
  

```json
// amount of brokers, size, partitions etc. depends on your configuration
// Example: 1 broker, 3 partitions
{
  "brokers": [
    {
      "nodeId": 0,
      "host": "HOST_0",
      "port": 26501,
      "partitions": [
        {
          "partitionId": 1,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 2,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 3,
          "role": "leader",
          "health": "healthy"
        }
      ],
      "version": "8.8.0"
    }
  ],
  "clusterSize": 1,
  "partitionsCount": 3,
  "replicationFactor": 1,
  "gatewayVersion": "8.8.0",
  "lastCompletedChangeId": "-1"
}
```

  

Check the health status of the Orchestration Cluster with the actuator endpoint:

```bash
curl localhost:9600/actuator/health
```

  Example output
  

```json
{
  "status": "UP",
  "groups": ["liveness", "readiness", "startup", "status"],
  "components": {
    "brokerReady": {
      "status": "UP"
    },
    "brokerStartup": {
      "status": "UP"
    },
    "brokerStatus": {
      "status": "UP"
    },
    "livenessState": {
      "status": "UP"
    },
    "readinessState": {
      "status": "UP"
    },
    "schemaReadinessCheck": {
      "status": "UP"
    },
    "searchEngineStatus": {
      "status": "UP"
    }
  }
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
