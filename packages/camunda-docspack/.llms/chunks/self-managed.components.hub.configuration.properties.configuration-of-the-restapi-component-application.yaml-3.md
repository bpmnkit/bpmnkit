# Property reference — Configuration of the `restapi` component — application.yaml

| Property                                                     | Description                           |
| :----------------------------------------------------------- | :------------------------------------ |
| `camunda.hub.clusters[0].custom-properties[0].description`   | A description of the custom property. |
| `camunda.hub.clusters[0].custom-properties[0].links`         | A list of links.                      |
| `camunda.hub.clusters[0].custom-properties[0].links[0].name` | A name for the link.                  |
| `camunda.hub.clusters[0].custom-properties[0].links[0].url`  | The link's URL.                       |

Example configuration:

```yaml
camunda:
  hub:
    clusters:
      - id: camunda-platform
        # other fields...
        custom-properties:
          - description: This is the integration environment for the Camunda platform.
            links:
              - name: Camunda
                url: https://camunda.com/
              - name: Documentation
                url: https://docs.camunda.io/
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
