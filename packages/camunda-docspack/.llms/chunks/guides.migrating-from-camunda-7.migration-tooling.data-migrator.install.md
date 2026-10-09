# Install and quick start

Install the Data Migrator and run your first migration.

Install the Data Migrator and run your first data migration.


## Prerequisites

- Java 21+
- Running Camunda 8 (self-managed, or SaaS for runtime migration only)
- Camunda 7 has been stopped
- Access to Camunda 7 database
- Models migrated and deployed to C8


## Installation

1. Download the latest release from the GitHub releases page:
   - https://github.com/camunda/camunda-7-to-8-migration-tooling/releases
2. Extract the archive to your preferred directory.
3. Navigate to the extracted directory.


## Quick start

The Data Migrator supports three main modes of operation:

- [Runtime migration](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/runtime): Migrate running process instances
- [History migration](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history): Copy audit trail data
- [Identity migration](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/identity): Copy authorizations and tenants

Below is a quick start guide to get you started. For detailed information on each mode, see their respective documentation pages.

### Quick start steps

1. Make sure Camunda 8 is up and running, all process models to migrate are deployed, and Camunda 7 has been stopped.

   For runtime migration, every process model requires:
   - A blank start event (you must add one if the process model doesn't have one already).
   - An execution listener at the end of your blank start event with the job type `migrator`. You have to add this manually or let the [Diagram Converter](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/diagram-converter) add it.

   ```xml
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:extensionElements>
        <zeebe:executionListeners>
          <zeebe:executionListener eventType="end" type="migrator" />
        </zeebe:executionListeners>
      </bpmn:extensionElements>
    </bpmn:startEvent>
   ```

**Note**
   For automatic resource deployment, you can also drop your BPMN files into the `configuration/resources` folder.

2. Drop your JDBC driver into the `configuration/userlib` folder (for example, `postgresql-$VERSION.jar` for PostgreSQL).

3. Prepare your configuration file (`configuration/application.yml`):

   ```yaml
   camunda.client:
     mode: self-managed
     grpc-address: http://localhost:26500
     rest-address: http://localhost:8080

   camunda.migrator:
     auto-ddl: true # Automatically create migration tracking schema

   camunda.migrator.c7.data-source:
     jdbc-url: jdbc:postgresql://localhost:5432/camunda7
     username: your-username
     password: your-password

   camunda.migrator.c8.data-source:
     jdbc-url: jdbc:postgresql://localhost:5432/camunda8
     username: your-username
     password: your-password
   ```

4. Run the Data Migrator:

   

   
### maclinux

   ```bash
   # Runtime migration (default mode)
   ./start.sh --runtime

   # History migration
   ./start.sh --history

   # Identity migration
   ./start.sh --identity

   # View all available options
   ./start.sh --help
   ```

   

   
### windows

   ```bash
   # Runtime migration (default mode)
   start.bat --runtime

   # History migration
   start.bat --history

   # Identity migration
   start.bat --identity

   # View all available options
   start.bat --help
   ```

   

   

5. Monitor the migration progress in the console output and log files.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/install
