# Key state behavior — Key state summary

The table below provides a high-level overview of how different KMS key states affect cluster startup, operation, and data availability.

| Key state                  | Cluster startup   | Cluster runtime                               | Data accessible? | Recovery possible?            |
| -------------------------- | ----------------- | --------------------------------------------- | ---------------- | ----------------------------- |
| **Enabled**                | ✔ Starts normally | ✔ Operates normally                           | Yes              | Not needed                    |
| **Disabled**               | ❌ Cannot start   | ❌ Freezes: no reads/writes, operations hang  | No               | ✔ Re-enable key               |
| **Scheduled for deletion** | ❌ Cannot start   | ❌ Same as disabled                           | No               | ✔ Cancel deletion + re-enable |
| **Permanently deleted**    | ❌ Cannot start   | ❌ Cluster remains non-functional permanently | No               | ❌ No — encrypted data lost   |
| **Incorrect key policy**   | ❌ Cannot start   | ❌ Behaves like disabled key                  | No               | ✔ Fix policy                  |

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/key-state-behavior
