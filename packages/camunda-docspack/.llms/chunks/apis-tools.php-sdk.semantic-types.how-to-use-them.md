# Semantic Types — How to use them

```php
function readme_semantic_types(): void
{
    // Identifiers are distinct value objects — you cannot accidentally pass a
    // process-definition id where a tenant id is expected.
    $instruction = (new ProcessInstanceCreationInstructionById())
        ->setProcessDefinitionId(ProcessDefinitionId::of('order-process'))
        ->setVariables(['orderId' => 'ORD-42']);

    // Value objects validate their format on construction and stringify cleanly.
    $definitionId = new ProcessDefinitionId('order-process');
    echo (string) $definitionId, "\n";
}
```

When you construct a model from an array, raw strings are automatically lifted into their semantic value objects, so you can stay ergonomic where you want to.

---
Source: https://docs.camunda.io/docs/next/apis-tools/php-sdk/semantic-types
