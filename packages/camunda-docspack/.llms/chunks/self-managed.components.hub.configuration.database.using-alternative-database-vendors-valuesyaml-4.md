# Database — Using alternative database vendors — valuesYaml

```yaml
camundaHub:
  restapi:
    externalDatabase:
      url: "jdbc:mysql://[DB_HOST]:[DB_PORT]/[DB_NAME]"
      username: "[DB_USER]"
      secret:
        inlineSecret: "[DB_PASSWORD]"
    env:
      - name: SPRING_DATASOURCE_DRIVERCLASSNAME # Optional; omit to use default MySQL driver
        value: "[YOUR_CUSTOM_DRIVER]"
    extraVolumeMounts:
      - name: mysql-driver
        mountPath: /driver-lib
    extraVolumes:
      - name: mysql-driver
        emptyDir: {}
    initContainers:
      - name: fetch-jdbc-drivers
        image: alpine:3.22.1
        imagePullPolicy: "Always"
        command:
          [
            "sh",
            "-c",
            "wget https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-j-9.7.0.tar.gz -O /driver-lib/mysql.tar.gz && tar -xzf /driver-lib/mysql.tar.gz -C /driver-lib --strip-components=1",
          ]
        volumeMounts:
          - name: mysql-driver
            mountPath: /driver-lib
        securityContext:
          runAsUser: 1001
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
