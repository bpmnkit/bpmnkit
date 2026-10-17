# Troubleshooting — I cannot connect to a local orchestration cluster {#i-cannot-connect-to-local-zeebe}

You try to connect (i.e., to deploy) to a local orchestration cluster, and Desktop Modeler tells you it "Cannot connect to Camunda 8."

Ensure your local orchestration cluster is running. If you don't have one installed, consider [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run), a lightweight all-in-one distribution.


## Cannot connect to an orchestration cluster in a local network

Use this guidance when Desktop Modeler cannot connect to an orchestration cluster running in your local network and shows a "Cannot connect to Camunda 8" error.

Verify that your operating system allows Desktop Modeler to access the local network.

### windows

Ensure your network is set to **Private** and that apps are allowed to communicate on private networks.  
See [make a network public or private](https://support.microsoft.com/en-us/windows/essential-network-settings-and-tasks-in-windows-f21a9bbc-c582-55cd-35e0-73431160a1b9#ID0EFF).

### macos

Ensure **Privacy & Security** settings allow Desktop Modeler to access your local network.  
See [control access to your local network](https://support.apple.com/en-gb/guide/mac-help/mchla4f49138/mac).

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/troubleshooting
