# Camunda components troubleshooting — Anomaly detection scripts — Usage

Each script in the `c8-sm-checks` project can be executed independently, allowing you to target specific areas for troubleshooting and verification.

To utilize these scripts effectively, ensure you have the necessary permissions and access to your Kubernetes cluster. Additionally, make sure you have the required dependencies installed on your system, such as `kubectl`, `helm`, `curl`, and `grpcurl`.

For detailed documentation and usage instructions for each script, refer to the [c8-sm-checks GitHub repository](https://github.com/camunda/c8-sm-checks).
Additionally, you can use the `-h` option with each script to display help information directly from the command line.

Before using it, clone the `c8-sm-checks` repository to your local environment by running the following command:

<!-- TODO: [release-duty]:  -- Update version tag once a new version is released -->

```bash
git clone https://github.com/camunda/c8-sm-checks.git
cd c8-sm-checks
git checkout v1.4.0
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
