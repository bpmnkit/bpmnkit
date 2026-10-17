# Cluster inspection and process management — Jobs

### List jobs

```bash
c8 list jobs

# Filter by type
c8 list jobs --type=email-service

# Filter by state
c8 list jobs --state=ACTIVATABLE
```

### Activate jobs

```bash
c8 activate jobs email-service

# With options
c8 activate jobs email-service --maxJobsToActivate=20 --timeout=120000 --worker=my-worker

# Include custom headers and fetch specific variables in the output
c8 activate jobs email-service --customHeaders --fetchVariable=orderId,amount
```

Use `--customHeaders` to include each job's custom headers in the output, and `--fetchVariable` to fetch a comma-separated list of variable names from the server and include them.

### Complete a job

```bash
c8 complete job 2251799813685252

# With variables
c8 complete job 2251799813685252 --variables='{"emailSent":true}'
```

### Fail a job

```bash
c8 fail job 2251799813685252

# With retries and error message
c8 fail job 2251799813685252 --retries=3 --errorMessage="Email service unavailable"
```

### Update a job

Update a job's retries or timeout. At least one of `--retries` or `--timeout` is required:

```bash
# Reset the retry count (for example, to make a failed job activatable again)
c8 update job 2251799813685252 --retries=3

# Extend the job timeout to 60 seconds
c8 update job 2251799813685252 --timeout=60000
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
