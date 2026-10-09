# Create a custom REST connector — Example: Custom Star Wars API connector — Step 2: Edit the new connector template

Once the new connector template is created, edit and configure it to retrieve data from the Star Wars API.

1. Open the new connector template in the Template Editor.
1. Hide Unwanted Properties: For properties that are not required in your connector, set the `type` to `Hidden`. For example, since authentication is not required in this example, it is set to `Hidden`.
   ```json
   {
     "id": "authentication.type",
     "label": "Type",
     "description": "Choose the authentication type. Select 'None' if no authentication is necessary",
     "value": "noAuth",
     "group": "authentication",
     "binding": {
       "name": "authentication.type",
       "type": "zeebe:input"
     },
     "type": "Hidden",
     "choices": [
       {
         "name": "API key",
         "value": "apiKey"
       },
       {
         "name": "Basic",
         "value": "basic"
       },
       {
         "name": "Bearer token",
         "value": "bearer"
       },
       {
         "name": "None",
         "value": "noAuth"
       },
       {
         "name": "OAuth 2.0",
         "value": "oauth-client-credentials-flow"
       }
     ]
   }
   ```
   Similarly, hide other fields such as `url`, `method`, `headers`, and `queryParameters`. If the `hidden` type does not apply, ensure that you remove the `feel` property.
   ```json
   {
     "id": "url",
     "label": "URL",
     "optional": false,
     "constraints": {
       "notEmpty": true,
       "pattern": {
         "value": "^(=|(http://|https://|secrets|\\{\\{).*$)",
         "message": "Must be a http(s) URL"
       }
     },
     "group": "endpoint",
     "binding": {
       "name": "url",
       "type": "zeebe:input"
     },
     "type": "Hidden",
     "value": "=\"https://swapi.dev/api/\" + resource + \"/\" + index"
   }
   ```
1. Create a Custom Group for the Star Wars API: Add a customized group named `swapi` for organizing your Star Wars-related properties.
   ```json
   {
     "id": "swapi",
     "label": "Star Wars Payload"
   }
   ```
1. Define the Properties in the SWAPI Group: Map the properties within the new group to the previously defined `resource` and `index` variables.
   - Set `resource` as a `Dropdown`.
   - Set `index` as a `String`.
   ```json
   [
     {
       "id": "swid",
       "label": "id",
       "description": "Index of the resource",
       "feel": "optional",
       "group": "swapi",
       "binding": {
         "name": "index",
         "type": "zeebe:input"
       },
       "type": "String"
     },
     {
       "id": "swresource",
       "label": "Type",
       "description": "Choose the resource type",
       "value": "Planets",
       "group": "swapi",
       "binding": {
         "name": "resource",
         "type": "zeebe:input"
       },
       "type": "Dropdown",
       "choices": [
         {
           "name": "Planets",
           "value": "planets"
         },
         {
           "name": "Spaceships",
           "value": "spaceships"
         },
         {
           "name": "Vehicles",
           "value": "vehicles"
         },
         {
           "name": "People",
           "value": "people"
         },
         {
           "name": "Films",
           "value": "films"
         },
         {
           "name": "species",
           "value": "Species"
         }
       ]
     }
   ]
   ```
1. Add an appropriate icon if required to enhance your connector's visual appeal.
1. Once configuration is complete, click **Publish** to publish the connector template and make it available for use.
1. Use your newly published SWAPI connector in your BPMN workflows.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/create-connector-from-rest
