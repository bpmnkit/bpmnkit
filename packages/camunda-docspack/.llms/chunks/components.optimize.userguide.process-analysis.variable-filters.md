# Variable filters

Learn more about variable filters with booleans, strings, and more.

**Note**
Exporter-level data filters may exclude variables or process definitions from Optimize before they are imported. If a variable or process definition is missing from Optimize, check whether an export filter is active. On SaaS, configure filters in [cluster settings](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/settings#data-filters). On Self-Managed, see [Optimize export filtering](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/optimize-export-filtering).

Use the `Variable Filter` to retrieve only those process instances which hold the specified variable value for the selected variable.

**Note**
Variable filters can only filter for the final value of the variable.

For instance, assume you want to analyze only those process instances which have the variable `department` with the value `marketing`. Say you also have some instances where this variable had the value `marketing` at the start of the execution, yet this was later reassigned to the value `sales`. These instances will not be included in the filter.

To use complex types like object, use the **Variable Import Customization** feature to transform your object variables into primitive type variables.

Start creating a variable filter by searching for and selecting a variable from the suggested list of variable names.

![Searching through the variables in variable filter](./img/variable-filter.png)

There are four types of variables that you can filter for:

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/variable-filters
