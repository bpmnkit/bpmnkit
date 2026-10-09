# Variable filters — Date variables

This filters all instances where the selected date variable has a value within a specified date range. All the options that are available to configure [date filters](https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/metadata-filters#date-filters) are also available for date variables.

Similar to the other variables, there are two input switches that allow you to exclude or include process instances where a particular date variable is either `null` or `undefined`.


## List variable filters

To filter based on the value of a [list variable](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/object-variables#list-variables), the applied filter will depend on the primitive type of items within the list. For example, you will be creating a numeric variable filter for a variable which is a list of numbers, a string variable filter for a list of strings, and so on. It is important to note here that filters are applied on each individual item within the list variable and not the list itself.

For example, an "is" filter on a list of string values filters for those instances where any individual list item is equal to the given term. For example, instances whose list variable "contains" the selected value.

Similarly, the "contains" filter matches process instances whose list variable contains at least one value which in turn contains the given substring.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/variable-filters
