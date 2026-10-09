# Camunda back up and restore — Considerations — jobs

The examples in this guide showcase the backup process in a manual fashion to help you fully understand the process.
You might want to use [Kubernetes Cronjobs](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/) to automate the backup process for your own use case based on your own environment on a regular schedule.

Kubernetes Cronjobs will spawn a [Job](https://kubernetes.io/docs/concepts/workloads/controllers/job/) on a regular basis. The job will run a defined image within a given namespace, allowing you to run commands and interact with the environment.

**Note**

You can see further examples from Camunda consultants in the [Backup and Restore Workshop](https://github.com/camunda-consulting/c8-devops-workshop/tree/main/03%20-%20Lab%203%20-%20Backup%20and%20Restore). You can use these examples to achieve similar automation.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore
