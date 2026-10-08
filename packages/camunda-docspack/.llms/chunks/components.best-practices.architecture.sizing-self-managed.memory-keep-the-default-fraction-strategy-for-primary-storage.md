# Self-Managed resource planning — Memory — Keep the default `FRACTION` strategy for primary storage

As of 8.10, `FRACTION` is the shipped default for primary storage: no action is required to benefit from it on a new deployment.

`FRACTION` scales with the broker's actual memory automatically, unlike `PARTITION` and `BROKER`, which are absolute limits: if you resize a broker's memory or change its partition count, you have to remember to retune the limit too, or RocksDB's share of memory silently stays where it was. This also mirrors the direction Camunda SaaS already takes for primary storage.

If you're upgrading from a version before 8.10 and previously relied on the `PARTITION` default, your effective RocksDB memory allocation changes on upgrade unless you set the strategy explicitly. See the [8.10 release notes](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/8100-release-notes#default-rocksdb-memory-allocation-strategy-changed-to-fraction) for details.

```yaml
camunda:
  data:
    primary-storage:
      rocks-db:
        memory-allocation-strategy: fraction
        memory-fraction: 0.1
```

**Caution**
`FRACTION` splits its budget across **all** partitions on a broker, the same way `BROKER` does. Unlike `PARTITION`, it does not scale up with partition count. On a broker with many partitions but modest total memory, a flat 10% fraction can allocate less RocksDB memory than a previously tuned fixed limit would have. An optional minimum-floor setting for `FRACTION` is proposed in [camunda/camunda#57768](https://github.com/camunda/camunda/issues/57768) (open) to address exactly this; until it ships, verify the resulting absolute memory is enough for your partition count, and fall back to an explicit `..._MEMORYLIMIT` if it isn't.

If you run multiple Physical Tenants, every tenant's partitions count toward the partitions on a broker, and each partition needs a minimum share of RocksDB memory. See [size clusters with Physical Tenants](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-physical-tenants#size-rocksdb-memory) for the minimum and the other budgets that grow with tenant count.

---
Source: https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed
