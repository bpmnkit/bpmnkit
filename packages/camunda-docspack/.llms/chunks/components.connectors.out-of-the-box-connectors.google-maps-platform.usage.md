# Google Maps Platform connector — Usage

### Address validation, formatting, getting postal address

1. Select **Validate Address** from the **Operation type** dropdown in the **Operation** section.
2. Populate the **Authentication** section as described in the [respective section](#authentication).
3. (Optional) In the **Input** section, set **Region Code** (i.e `US`). You can find supported region codes [here](https://developers.google.com/maps/documentation/address-validation/coverage).
4. (Optional) In the **Input** section, set **Locality**, an incorporated city or town political entity (i.e `Mountain View`).
5. In the **Input** section, set **Address**, an incorporated city or town political entity (i.e `1600 Amphitheatre Pkwy`).
6. In the **Output** section set **Result Variable** or **Result Expression**. Refer to the [response mapping documentation](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#response-mapping) to learn more.
7. Find a full example of the **Google Maps Platform connector** response [here](https://developers.google.com/maps/documentation/address-validation/requests-validate-address#address_validation_response). To get postal address and formatted address, set to **Result Expression** in the FEEL expression:

```
{
 formattedAddress: response.body.result.address.formattedAddress,
 postalAddress: response.body.result.address.postalAddress
}
```

### Get place ID

1. Select **Get Place ID** from the **Operation type** dropdown in the **Operation** section.
2. Populate the **Authentication** section as described in the [respective section](#authentication).
3. In the **Input** section, set **Address**. This address can be `formatedAddress`, which you can get using [this example](#address-validation-formatting-getting-postal-address).
4. In the **Output** section in the **Result Expression** property, the following expression is preset:

```
{
   placeId: response.body.candidates[1].place_id
}
```

In this way, the response of this method will contain a mapping from the variable 'placeId' and the ID of the place:

```json
{
  "placeId": "place....."
}
```

### Calculate distance

1. Select **Calculate Distance** from the **Operation type** dropdown in the **Operation** section.
2. Populate the **Authentication** section as described in the [respective section](#authentication).
3. In the **Input** section, set **Destination**, the place ID value that you want to use as the destination for calculating distance.
4. In the **Input** section, set **Origin**, the place ID value that you want to use as the starting point for calculating distance.
5. Select the unit system to use when displaying results from the **Units** dropdown in the **Input** section.
6. Select the transportation mode to use when calculating distances and directions from the **Mode** dropdown in the **Input** section.
7. In the **Output** section, set **Result Variable** or **Result Expression**. Refer to the [response mapping documentation](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#response-mapping) to learn more.
8. Find a full example of the **Google Maps Platform connector** response [here](https://developers.google.com/maps/documentation/directions/start#getting-directions). To get a distance, set **Result Expression** in the FEEL expression:

```
{
 distance: response.body.routes[1].legs[1].distance.text
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-maps-platform
