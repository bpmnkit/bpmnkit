# Export report result data

The REST API to export report result data from Optimize.

The data export API allows users to export large amounts of data in a machine-readable format (JSON) from Optimize.


## Functionality

Users can export all report types (except combined process reports) from `Optimize` using the Data Export API. Moreover, raw data reports will include additional data relating to the executed flow nodes and can be exported in a paginated fashion, so that large amounts of data can be consumed in chunks by the client.

### Pagination

The simplest way to paginate through the results is to perform a search request with all the `REQUIRED` header/query parameters as described in the sections below (but without `searchRequestId`), then pass the `searchRequestId` returned in each response to the next request, until no more documents are returned. Note that it's often the case, but not guaranteed, that the `searchRequestId` remains stable through the entire pagination, so always use the `searchRequestId` from the most current response to make your next request.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/report/get-data-export
