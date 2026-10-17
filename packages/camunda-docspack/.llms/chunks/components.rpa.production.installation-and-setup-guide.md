# RPA production setup — Installation and setup guide

An RPA worker is a specialized job worker that runs outside the main Camunda Orchestration Cluster.

### Prerequisites

RPA workers are supported on Windows, Linux, macOS, and in Docker for headless automation.

#### Hardware requirements

The RPA worker runs on bare metal, virtualized, or containerized systems. Use hardware suitable for your automated applications.

#### Software requirements

The RPA worker is a standalone binary.

| Operating system | Required software | Optional software |
| ---------------- | ----------------- | ----------------- |
| Windows          | RPA worker        | -                 |
| Linux and macOS  | RPA worker        | Python 3.12 + pip |

#### Network configurations

- Ensure connectivity to your Camunda cluster.
- Allow internet access if downloading external libraries.

### Installation and configuration

This section describes how to set up the RPA host machine.

#### Scaling and operation

Each machine hosts one RPA worker.

For scalable workloads:

- Use VMs to quickly spin up new workers.
- Use [max-concurrent-jobs](https://github.com/camunda/rpa-worker/?tab=readme-ov-file#configuration-reference) if safe for your use case.

#### Setting up a VM

Use virtualization to create scalable and repeatable worker deployments.

##### Create a template VM

1. Start with a clean Windows VM.
2. Install and configure the RPA worker.
3. Install all required third-party applications.
4. Test connectivity by running a process in Camunda.
5. Add the RPA worker to run **automatically on startup**.
6. **Configure Windows autologon**.
7. Disable screen saver, sleep, and lock.
8. Set the VM's time zone to match business requirements.
9. Save the configured VM as a **template**.
10. Keep a separate local administrator account and password in escrow for emergency access, and audit all RDP and console logons.

##### Monitoring and scaling

To scale using your VM template:

1. **Provision new VMs** from the template.
2. Start the VMs to allow them to connect to Zeebe and begin executing tasks.
3. Use **Operate** and **Optimize** to monitor task execution, wait times, and incidents.

If jobs are waiting too long, create additional VMs.

Operational tips:

1. **Script handling and versioning**: RPA workers fetch the latest script version automatically.
2. **Labels**: Use them to route tasks to the right worker types.
3. **Maintenance and monitoring**:
   - Enable OS updates during a maintenance window.
   - Take regular snapshots.
   - Monitor health, disk space, and RPA service status.
   - Surface alerts into your monitoring tools.

---
Source: https://docs.camunda.io/docs/next/components/rpa/production
