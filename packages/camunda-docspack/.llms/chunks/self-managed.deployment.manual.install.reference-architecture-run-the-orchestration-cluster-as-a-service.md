# Camunda manual installation — Reference architecture — Run the Orchestration Cluster as a service

This example shows how to run the Orchestration Cluster as a [`systemd`](https://systemd.io/) service on Ubuntu. Adjust the paths, user, and group as needed for your environment. The example uses a file with environment variables, but you can adapt it to use an `application.yaml` instead.

1. Create a `systemd` service file named `camunda.service` and adjust it fit your own paths, user and group in `/etc/systemd/system/camunda.service`.

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/compute/debian/configs/camunda.service
   ```

2. Change the permissions on `/etc/systemd/system/camunda.service` to `644`:

   ```bash
   sudo chmod 644 /etc/systemd/system/camunda.service
   ```

3. Reload `systemd` and start the new service:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start camunda.service
   ```

4. Verify that the service is running:

   ```bash
   systemctl status camunda.service
   ```

View logs with:

```bash
journalctl -e -u camunda
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
