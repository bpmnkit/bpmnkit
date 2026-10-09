# Object and list variable support — List variables

Optimize also supports object variables that are JSON-serialized lists of primitive types, such as a list of strings or numbers. For Camunda 7 and external variables, the `type` of list variables must still be set to `Object`. During import, Optimize evaluates the number of entries in each list and persists it in an additional `_listSize` variable.

For example, a list variable with the name `users` and the values `["John Smith", "Jane Smith"]` will result in two imported variables: one `users` variable with the two given values, and one variable called `users._listSize` with value `2`. Both can be used in reports and filters.

However, filters are not yet fully optimized for list support, and some filter terms may be initially misleading. This is because filters currently apply to each list item individually rather than the entire list. For example, an "is" filter on a list of string values filters for those instances where any individual list item is equal to the given term, for example, instances whose list variable "contains" the selected value.

Similarly, the "contains" filter matches process instances whose list variable contains at least one value which in turn contains the given substring.

The value of list properties within objects as well as variables which are lists of objects rather than primitives can be inspected in the raw object variable value column accessible in raw data reports.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/object-variables
