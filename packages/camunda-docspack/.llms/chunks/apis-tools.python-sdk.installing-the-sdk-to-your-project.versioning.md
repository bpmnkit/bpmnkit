# Installing the SDK to your project — Versioning

This SDK has a different release cadence from the Camunda server. Features and fixes land in the SDK during a server release.

The major version of the SDK signals a 1:1 type coherence with the server API for a Camunda minor release.

SDK version `n.y.z` -> server version `8.n`, so the type surface of SDK version 9.y.z matches the API surface of Camunda 8.9.

Using a later SDK version, for example: SDK version 10.y.z with Camunda 8.9, means that the SDK contains additive surfaces that are not guaranteed at runtime, and the compiler cannot warn of unsupported operations.

Using an earlier SDK version, for example: SDK version 9.y.z with Camunda 8.10, results in slightly degraded compiler reasoning: exhaustiveness checks cannot be guaranteed by the compiler for any extended surfaces (principally, enums with added members).

In the vast majority of use-cases, this will not be an issue; but you should be aware that using the matching SDK major version for the server minor version provides the strongest compiler guarantees about runtime reliability.

**Recommended approach**:

- Check the [CHANGELOG](https://github.com/camunda/orchestration-cluster-api-python/releases).
- As a sanity check during server version upgrade, rebuild applications with the matching SDK major version to identify any affected runtime surfaces.

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/installing-the-sdk-to-your-project
