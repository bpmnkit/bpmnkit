# Use an alternative database for Management Identity — Troubleshooting

The following troubleshooting tips are provided to help you with common issues:

| Tip                      | Description                                                                                                                                                                                  |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Check Keystore path      | Access (or "exec into") the running container where the application is deployed and confirm that the Java process running inside the container is configured with the correct keystore path. |
| Check certificates       | Confirm that any SSL/TLS certificate required for secure communication with the database exists in the mounted location on the filesystem.                                                   |
| Test database connection | Test and verify the connection from the pod to the database using simple tools and utilities, such as JDBC tool, ping, curl, and so on.                                                      |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/alternative-db
