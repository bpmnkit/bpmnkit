# Vendored Camunda 8.8 REST API spec

`rest-api.yaml` is copied byte for byte from
https://github.com/camunda/camunda/blob/bdfc18408ec235ed4748c93e82ff5c41eb3cd297/zeebe/gateway-protocol/src/main/proto/rest-api.yaml
(branch `stable/8.8`, fetched 2026-11-21). It is the runtime contract of `bpmnkit-worker`; the request
bodies the client sends are validated against it in `tests/rest_client.rs`. Do not edit it; to move
to a new pin, replace the file and update the commit here.
