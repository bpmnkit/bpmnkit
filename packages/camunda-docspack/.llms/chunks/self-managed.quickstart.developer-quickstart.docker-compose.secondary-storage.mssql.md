# Configure secondary storage with Docker Compose — mssql

Set the JDBC URL in the application configuration to `jdbc:sqlserver://mssql-secondary:1433;databaseName=camunda_secondary;encrypt=false`.

```yaml
services:
  orchestration:
    depends_on:
      - mssql-secondary
    networks:
      - secondary-storage

  mssql-secondary:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: Camunda123!
      MSSQL_PID: Developer
    volumes:
      - mssql-secondary-data:/var/opt/mssql
    networks:
      - secondary-storage

volumes:
  mssql-secondary-data:

networks:
  secondary-storage:
```

```shell
# Lightweight setup
docker compose -f docker-compose.yaml -f docker-compose.override.yaml up -d mssql-secondary
docker compose -f docker-compose.yaml -f docker-compose.override.yaml exec mssql-secondary /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'Camunda123!' -Q "IF DB_ID('camunda_secondary') IS NULL CREATE DATABASE camunda_secondary"
docker compose -f docker-compose.yaml -f docker-compose.override.yaml exec mssql-secondary /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'Camunda123!' -Q "IF SUSER_ID('camunda') IS NULL CREATE LOGIN camunda WITH PASSWORD='Camunda123!', CHECK_POLICY=OFF; USE camunda_secondary; IF USER_ID('camunda') IS NULL CREATE USER camunda FOR LOGIN camunda; ALTER ROLE db_owner ADD MEMBER camunda"
ORCHESTRATION_CONFIG_FILE=application-mssql.yaml docker compose -f docker-compose.yaml -f docker-compose.override.yaml up -d

# Full setup
docker compose -f docker-compose-full.yaml -f docker-compose.override.yaml up -d mssql-secondary
docker compose -f docker-compose-full.yaml -f docker-compose.override.yaml exec mssql-secondary /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'Camunda123!' -Q "IF DB_ID('camunda_secondary') IS NULL CREATE DATABASE camunda_secondary"
docker compose -f docker-compose-full.yaml -f docker-compose.override.yaml exec mssql-secondary /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'Camunda123!' -Q "IF SUSER_ID('camunda') IS NULL CREATE LOGIN camunda WITH PASSWORD='Camunda123!', CHECK_POLICY=OFF; USE camunda_secondary; IF USER_ID('camunda') IS NULL CREATE USER camunda FOR LOGIN camunda; ALTER ROLE db_owner ADD MEMBER camunda"
docker compose -f docker-compose-full.yaml -f docker-compose.override.yaml up -d
```

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/secondary-storage
