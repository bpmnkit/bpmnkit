# History cleanup — Diagnosing stalled cleanup

If history cleanup runs on schedule but consistently completes in zero seconds, this is expected when all process instances are either still running or have not yet exceeded the configured TTL. No action is needed in that case.

If you know that completed instances are past their TTL but cleanup still finishes in zero seconds, orphaned ACTIVE documents are likely accumulating. Cleanup only deletes process instances that have an `endDate` set. If Optimize never received the completion event for an instance, it has no `endDate` and cleanup cannot remove it regardless of how old it is.

This happens when the Zeebe exporter's ILM retention window is shorter than Optimize's import lag: the exporter deletes Zeebe records before Optimize imports them, so Optimize writes an ACTIVE entry for the creation event but never sets an endDate. These orphaned documents grow the Optimize process instance index without a cleanup path.

To prevent this, set the Zeebe exporter `retention.minimum-age` to at least 3-7 days when running Optimize. See [Zeebe record ILM retention](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment#zeebe-record-ilm-retention) in the sizing guide for details.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/history-cleanup
