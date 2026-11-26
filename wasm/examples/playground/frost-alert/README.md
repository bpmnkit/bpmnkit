# frost-alert: REST connector only

Asks [Open-Meteo](https://open-meteo.com) (no key) for tomorrow's minimum temperature and warns
below 0 °C. No Wasm and no worker code: one `io.camunda:http-json:1` task, served by the published
CLI's local REST connector runner (`bpmnkit connector run`).

```
Check requested → Get forecast → Frost tomorrow? ─ below 0 °C → Issue frost warning → Warning issued
                    ╰ BAD_LOCATION                 ╰ otherwise → All clear → No frost
                      → Record rejection → Location rejected
```

| Task | Does |
|---|---|
| `forecast` (Get forecast) | `GET https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&daily=temperature_2m_min&forecast_days=2&timezone=auto`. `resultExpression` keeps `tomorrowMin` (`daily.temperature_2m_min[2]`) and `forecastDate`. `errorExpression` turns a 400 (bad coordinates) into the BPMN error `BAD_LOCATION`. Other errors fail the job and retry after `retryBackoff` (`PT20S`). |
| `frost` | `=tomorrowMin < 0` → warning, else all clear |
| `warn` / `ok` / `reject` | script tasks that write `alert` |

Start variables: `location` (a label), `latitude`, `longitude`. `meteoBase` is optional and
overrides `https://api.open-meteo.com` (the offline test uses it to point at a stub).

## Offline test

```sh
./run.sh      # bpmnkit lint + connector samples
```

`samples.json` holds one HTTP stub per case. `../connector-test.py` turns the task's own input
mappings and headers into a one-off element template, serves the stub on `127.0.0.1` and runs
`bpmnkit connector test` (published 0.9.0). It checks the request path and the resulting command:

```
ok   frost tomorrow (/v1/forecast?latitude=52.52&longitude=13.41&daily=temperature_2m_min&forecast_days=2&timezone=auto)
ok   mild tomorrow (/v1/forecast?latitude=1.29&longitude=103.85&daily=temperature_2m_min&forecast_days=2&timezone=auto)
ok   400 is the BPMN error BAD_LOCATION (/v1/forecast?latitude=999&longitude=0&daily=temperature_2m_min&forecast_days=2&timezone=auto)
ok   429 fails the job (retried after retryBackoff) (/v1/forecast?latitude=52.52&longitude=13.41&daily=temperature_2m_min&forecast_days=2&timezone=auto)
4/4 connector samples passed
```

## Live run (reebe + the real API)

```sh
# shell 1: engine (embedded SQLite), from the repository root
cargo run --release --manifest-path apps/reebe/Cargo.toml -p reebe-server \
  --no-default-features --features embedded -- --port 8080

# shell 2: REST connector runner (published CLI)
cargo install bpmnkit-cli --version 0.9.0 --locked
CAMUNDA_REST_ADDRESS=http://localhost:8080 bpmnkit connector run

# shell 3: deploy, then one instance per path
curl -sS -X POST http://localhost:8080/v2/deployments -F resources=@frost.bpmn
../live.sh frost-alert '{"location":"Berlin","latitude":52.52,"longitude":13.41}' tomorrowMin forecastDate alert
../live.sh frost-alert '{"location":"Singapore","latitude":1.29,"longitude":103.85}' tomorrowMin forecastDate alert
../live.sh frost-alert '{"location":"Nowhere","latitude":999,"longitude":0}' alert
```

`../live.sh` starts the instance, waits for it to end and prints the end event and variables.
Recorded on 2026-11-26:

```
instance 2251799813685504: COMPLETED at warned
  tomorrowMin = -1.7
  forecastDate = "2026-11-27"
  alert = "FROST WARNING Berlin 2026-11-27: min -1.7 °C"
instance 2251799813685529: COMPLETED at clear
  tomorrowMin = 24.1
  forecastDate = "2026-11-27"
  alert = "ok Singapore 2026-11-27: min 24.1 °C"
instance 2251799813685482: COMPLETED at rejected
  alert = "rejected Nowhere: forecast API refused the coordinates"
```

Open-Meteo's free tier allows 10 000 calls a day per IP. From a shared egress IP it can answer
429; each retry then waits `retryBackoff`, and after three attempts the job raises an incident.
