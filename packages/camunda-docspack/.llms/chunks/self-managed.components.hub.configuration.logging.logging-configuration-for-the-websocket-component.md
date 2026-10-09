# Logging — Logging configuration for the `websocket` component

By default, the `websocket` component logs to the Docker container's standard output.

### Logging to a file

To enable additional log output to a file, follow these steps:

1. Mount a volume to the directory `/var/www/html/storage/logs`. The logs will be written to a file named `laravel.log` located inside this directory.
2. Adjust the following environment variable:
   ```properties
   LOG_CHANNEL=single
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/logging
