# Instance state filters — Canceled instances only filter

If the **Canceled Instances Only Filter** is applied, the report will only consider those instances which were terminated before completion, either
internally or externally. Be aware that adding this filter along with the **Running Instances Only** will show a warning message since these filters are incompatible and will not show any data.


## Non canceled instances only filter

As opposed to the **Canceled Instances Only Filter**, applying the **Non Canceled Instances Only** filter will make Optimize query only those instances which were _not_ canceled during
their execution. This means only active and completed instances are considered. Externally or internally terminated instances are not included in the report.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/instance-state-filters
