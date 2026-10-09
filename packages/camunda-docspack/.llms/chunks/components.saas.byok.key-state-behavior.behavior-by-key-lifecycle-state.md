# Key state behavior — Behavior by key lifecycle state

### Disabled key

- Cluster cannot start.
- If cluster was running:
  - All operations freeze.
  - Suspend/resume does not complete.
  - Backup operations get stuck.
- Camunda Hub eventually shows: **External encryption key is not ready**

**Recovery:**  
Re-enable the KMS key. Cluster resumes automatically, but recovery time increases the longer the key was disabled.

### Key scheduled for deletion

Scheduling deletion automatically **disables** the key.

Behavior is identical to a disabled key.

**Recovery:**  
Cancel deletion → Re-enable the key.

### Permanently deleted key

Once the AWS deletion waiting period passes:

- The key is irrecoverable.
- The cluster becomes permanently unusable.
- No encrypted data can be recovered.

**Recovery:**  
Not possible. Create a new cluster.

### Incorrect or missing key policy

If the KMS policy does not grant Camunda's AWS Role the required permissions:

- Cluster cannot start or becomes frozen.
- Behavior mirrors a disabled key.

**Recovery:**  
Update the KMS key policy using the Tenant Role ARN displayed in Hub.

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/key-state-behavior
