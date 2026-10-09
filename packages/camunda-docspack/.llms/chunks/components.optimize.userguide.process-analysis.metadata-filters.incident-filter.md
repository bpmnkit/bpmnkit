# Metadata filters — Incident filter

This filter has a different behavior depending on where it was [defined](https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/filters#filter-behavior):

- As an `instance filter`: This filter will retrieve only those process instances that contain open, resolved, or no incidents (depending on your selection). Here are some examples where this filter can be useful:

  - Creating reports that contain no incidents since the instances that have incidents have very long durations and are influencing your data.

  - To monitor all the instances from multiple engines that have open incidents.

  On the other hand, this filter is not useful for counting the number of incidents because instances with an open or resolved instance filter might still contain instances from the other type.

- As a `Flow Node data filter`: This filter will additionally filter the instance incident states to only include incidents of the same type (open or resolved). As an example, This filter can be used to count the number of open or resolved incidents since it considers the incidents of that type exclusively. This filter is currently only useful if you are in an incident view report.

**Note**
The incident filter does not currently filter flow nodes regardless of where it was defined.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/metadata-filters
