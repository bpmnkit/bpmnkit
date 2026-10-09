# End-to-end RDBMS setup guide — Step 6: Validation

### Orchestration Cluster checklist

1. Confirm the RDBMS exporter is enabled.
2. Check logs for Liquibase initialization:  
   `[INFO] io.camunda.application.commons.rdbms.MyBatisConfiguration - Initializing Liquibase for RDBMS`
3. Verify database schema was initialized. See [access SQL and Liquibase scripts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts) for the complete table list for your database platform.
4. Run [RDBMS validation tests](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms).

### Camunda Hub checklist

1. Confirm the database connection is configured.
2. Check logs for Flyway schema initialization.
3. Verify database contains tables (Flyway creates these automatically on startup).
4. Test the health endpoint: `/health`.

### Common issues

| Issue              | Resolution                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Schema not created | Grant `CREATE TABLE`, `ALTER TABLE` permissions to the database user.                                                    |
| Connection timeout | Check firewall rules, security groups, and VPC peering. Verify network connectivity.                                     |
| TLS/SSL error      | Verify database certificate and adjust JDBC SSL mode parameters. See component-specific configuration pages for details. |
| Driver not found   | Load user-supplied drivers via init container, custom image, or volume mount.                                            |

For detailed troubleshooting, see:

- [RDBMS troubleshooting](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-troubleshooting)
- [Camunda Hub database troubleshooting](https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-database-connection)

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-setup-guide
