//! Looks a country up in the World Bank API (no key) and maps region, income level and capital.
//! The API answers an unknown code with HTTP 200 and an error body, so that, a 404 and an
//! aggregate (such as `EUU`) all become the BPMN error `UNKNOWN_COUNTRY`.
use bpmnkit_wasm_sdk::prelude::*;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Input {
    country_code: String,
}

#[derive(Deserialize)]
struct Named {
    value: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Country {
    id: String,
    name: String,
    region: Named,
    income_level: Named,
    capital_city: String,
}

fn unknown(msg: String) -> Outcome {
    Outcome::throw_error("UNKNOWN_COUNTRY", msg)
}

struct CheckCountry;

impl Worker for CheckCountry {
    fn handle(job: Job) -> Outcome {
        let input: Input = match job.variables() {
            Ok(v) => v,
            Err(e) => return Outcome::fail(format!("bad input: {e}")).no_retry(),
        };
        let code = input.country_code.trim().to_ascii_uppercase();
        // Checked before it goes into the URL path.
        if !(2..=3).contains(&code.len()) || !code.bytes().all(|b| b.is_ascii_alphabetic()) {
            return unknown(format!(
                "not an ISO 3166 alpha-2 or alpha-3 code: {}",
                input.country_code
            ));
        }
        let url = format!("https://api.worldbank.org/v2/country/{code}?format=json");
        let res = match http::get(&url).send() {
            Ok(r) => r,
            Err(e) => return Outcome::fail(e.to_string()).backoff_ms(5_000),
        };
        if res.status() == 404 {
            return unknown(format!("World Bank does not know {code}"));
        }
        if !res.is_success() {
            return Outcome::fail(format!("World Bank API returned {}", res.status()))
                .backoff_ms(5_000);
        }
        // A hit is `[page, [country]]`; an unknown code is `[{"message": [...]}]`.
        let body = match res.json::<Value>() {
            Ok(v) => v,
            Err(e) => return Outcome::fail(format!("unexpected World Bank answer: {e}")),
        };
        let Some(first) = body.get(1).and_then(|l| l.get(0)) else {
            return unknown(format!("World Bank does not know {code}"));
        };
        let country: Country = match serde_json::from_value(first.clone()) {
            Ok(c) => c,
            Err(e) => return Outcome::fail(format!("unexpected World Bank country: {e}")),
        };
        if country.region.value == "Aggregates" {
            return unknown(format!(
                "{code} is an aggregate ({}), not a country",
                country.name
            ));
        }
        // Some values carry trailing spaces ("Latin America & Caribbean ").
        Outcome::complete(json!({
            "countryName": country.name.trim(),
            "iso3": country.id.trim(),
            "region": country.region.value.trim(),
            "incomeLevel": country.income_level.value.trim(),
            "capital": country.capital_city.trim(),
        }))
    }
}

bpmnkit_wasm_sdk::export!(CheckCountry);
