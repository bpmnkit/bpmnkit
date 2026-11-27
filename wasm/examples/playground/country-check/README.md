# country-check: Wasm worker with HTTP

A Wasm worker in the `worker-http` world calls the [World Bank country API](https://datahelpdesk.worldbank.org/knowledgebase/articles/898590)
(no key) itself and maps a country code to name, region, income level and capital. Its manifest
allows exactly one host: `api.worldbank.org:443`.

```
Customer address entered → Look up country → Build country profile → Country checked
                             ╰ UNKNOWN_COUNTRY → Ask for a valid country → Address rejected
```

| Task | Does |
|---|---|
| `lookup` (`check-country/`, Wasm) | `GET https://api.worldbank.org/v2/country/{CODE}?format=json`; completes `{ countryName, iso3, region, incomeLevel, capital }` (values trimmed). Throws `UNKNOWN_COUNTRY` for a malformed code (checked before it goes into the URL), the API's error body (it answers an unknown code with HTTP 200 and `[{"message": …}]`), a 404, or an aggregate such as `EUU`. Other HTTP errors and transport errors fail with a 5 s backoff. |
| `profile` / `reject` | script tasks that write `countryProfile` |

Start variable: `countryCode` (ISO 3166 alpha-2 or alpha-3, any case).

This case was planned against restcountries.com, but that API now needs a key (v3.1 redirects
to a deprecation notice), so it uses the World Bank API. That API has no currency data.

## Offline test

```sh
./run.sh      # bpmnkit lint, bpmnkit worker wasm test, compare with check-country/expected.json
```

`check-country/samples.json` has 7 samples with HTTP stubs. The smoke test answers the worker's
request from the stub, still checks the `[network] allow` list, and fails on an unmatched URL.

```
ok   known country
ok   unknown code: error body on 200
ok   unknown code: 404
ok   aggregate is not a country
ok   malformed code is rejected without a request
ok   api down
ok   bad input
outputs match expected.json
```

## Live run (reebe + the real API)

Build the Wasm tools and start reebe as in `../fx-invoice/README.md` and
`../frost-alert/README.md`. This case needs no connector runner.

```sh
cd wasm/examples/playground/country-check
bpmnkit worker wasm build check-country --out dist/check-country
CAMUNDA_REST_ADDRESS=http://localhost:8080 bpmnkit worker wasm run --dir dist   # leave running
curl -sS -X POST http://localhost:8080/v2/deployments -F resources=@country.bpmn
for c in de BRA xx EUU; do
  ../live.sh country-check "{\"countryCode\":\"$c\"}" countryName iso3 region incomeLevel capital countryProfile
done
```

Behind a TLS-intercepting egress proxy, set `SSL_CERT_FILE` to the proxy's CA bundle before
starting the host (it adds those roots to the built-in ones).

Recorded on 2026-11-26 (host: `loaded check-country 0.1.0 (WorkerHttp, 0aa33f03…)`; unset variables omitted):

```
instance 2251799813685728: COMPLETED at checked
  countryName = "Germany"
  iso3 = "DEU"
  region = "Europe & Central Asia"
  incomeLevel = "High income"
  capital = "Berlin"
  countryProfile = "Germany (DEU), Europe & Central Asia, High income, capital Berlin"
instance 2251799813685747: COMPLETED at checked
  countryName = "Brazil"
  iso3 = "BRA"
  region = "Latin America & Caribbean"
  incomeLevel = "Upper middle income"
  capital = "Brasilia"
  countryProfile = "Brazil (BRA), Latin America & Caribbean, Upper middle income, capital Brasilia"
instance 2251799813685766: COMPLETED at rejected
  countryProfile = "unknown country code: xx"
instance 2251799813685781: COMPLETED at rejected
  countryProfile = "unknown country code: EUU"
```
