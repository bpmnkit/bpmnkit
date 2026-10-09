# Migrate from Web Modeler to the Camunda Hub API — General changes — Pagination

Offset pagination in Camunda Hub API v2 is different from Web Modeler API v1.

In Web Modeler API v1, you use two fields to paginate items:

- `page` specifies the page to return, starting with page 0.
- `size` specifies the number of items per page.

For example:

```json title="Web Modeler API v1"
{
  "page": 3,
  "size": 20
}
```

This request skips the first three _pages_ of 20 items (pages 0–2 and item indexes 0–59, inclusive) and returns the fourth page of 20 items (indexes 60–79). If there aren't enough items to fill the fourth page, you receive all remaining items.

The response includes two fields, `items` and `total`:

```json title="Web Modeler API v1"
{
    "items": [
        ...
    ],
    "total": 141
}
```

In Camunda Hub API v2, you use a `page` object with two fields:

- `page.from` specifies the offset, the item index to start from, starting with index 0.
- `page.limit` limits the number of items returned.

For example:

```json title="Camunda Hub API v2"
{
  "page": {
    "from": 60,
    "limit": 20
  }
}
```

Instead of specifying the number of pages to skip, you specify the index to start _from_ (60) and the maximum number, or _limit_, of items to return (20). This request returns the items at indexes 60–79. As in v1, if there are fewer items than the limit, you receive all remaining items.

The new response replaces `total` with a new `page` object that includes two fields, `totalItems` and `hasMoreTotalItems`:

```json title="Camunda Hub API v2"
{
    "items": [
        ...
    ],
    "page": {
        "totalItems": 360,
        "hasMoreTotalItems": false
    }
}
```

In addition to the different pagination model, the default page size has changed. In v1, the default page size is 10. In v2, the default limit is 100.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
