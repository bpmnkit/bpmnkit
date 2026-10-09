# Object and list variable support

Learn how Optimize imports and handles object and list variables.


## Object variables

Complex object variables can be imported into Optimize and thereafter be used in reports and filters. During import, Optimize flattens the given object variable to create individual variables for each property of the object, resulting in multiple "sub variables" for each imported object variable.

For example, an object variable called `user` with the properties `firstName` and `lastName` will result in two flattened variables: `user.firstName` and `user.lastName`. These variables can be used within reports and filters.

In addition to the flattened properties, Optimize also imports the entire raw value of the object variable. In the example above, this creates a variable called `user` with the value `{"firstName": "John", "lastName": "Smith"}`. You can inspect this raw object variable in Raw Data Reports, but other report types and filters do not support it.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/object-variables
