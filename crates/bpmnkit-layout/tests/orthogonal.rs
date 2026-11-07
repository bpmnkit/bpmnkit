//! `route_orthogonal` / `side_ports` against TS `routeOrthogonal` / `sidePorts`
//! (dumped by `fixtures/orthogonal/dump.mjs`).

use bpmnkit_layout::orthogonal::{
    route_orthogonal, side_ports, OrthogonalRequest, Port, Side, SideCost,
};
use bpmnkit_layout::{Bounds, Waypoint};
use serde_json::Value;

fn num(v: &Value) -> f64 {
    match v {
        Value::String(s) if s == "Infinity" => f64::INFINITY,
        Value::String(s) if s == "-Infinity" => f64::NEG_INFINITY,
        Value::Null => f64::NAN,
        _ => v.as_f64().expect("number"),
    }
}

fn opt(v: &Value) -> Option<f64> {
    if v.is_null() {
        None
    } else {
        Some(num(v))
    }
}

fn wp(v: &Value) -> Waypoint {
    Waypoint {
        x: num(&v["x"]),
        y: num(&v["y"]),
    }
}

fn bounds(v: &Value) -> Bounds {
    Bounds {
        x: num(&v["x"]),
        y: num(&v["y"]),
        width: num(&v["width"]),
        height: num(&v["height"]),
    }
}

fn side(v: &Value) -> Side {
    match v.as_str().expect("side") {
        "top" => Side::Top,
        "right" => Side::Right,
        "bottom" => Side::Bottom,
        _ => Side::Left,
    }
}

fn port(v: &Value) -> Port {
    Port {
        point: wp(&v["point"]),
        side: side(&v["side"]),
        cost: v.get("cost").and_then(opt),
    }
}

fn js_sign(v: f64) -> f64 {
    if v > 0.0 {
        1.0
    } else if v < 0.0 {
        -1.0
    } else {
        v
    }
}

/// Same proper-intersection test the dump's crossings callback uses.
fn intersects(p: &Waypoint, q: &Waypoint, r: &Waypoint, t: &Waypoint) -> bool {
    let side = |o: &Waypoint, a: &Waypoint, b: &Waypoint| {
        js_sign((a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x))
    };
    side(p, q, r) != side(p, q, t) && side(r, t, p) != side(r, t, q)
}

fn fixture() -> Value {
    serde_json::from_str(include_str!("fixtures/orthogonal/cases.json")).expect("fixture")
}

#[test]
fn route_orthogonal_matches_ts() {
    let fx = fixture();
    for case in fx["cases"].as_array().expect("cases") {
        let name = case["name"].as_str().expect("name");
        let segments: Option<Vec<(Waypoint, Waypoint)>> = case["segments"]
            .as_array()
            .map(|s| s.iter().map(|pair| (wp(&pair[0]), wp(&pair[1]))).collect());
        let count = |a: &Waypoint, b: &Waypoint| -> f64 {
            segments
                .as_ref()
                .map(|s| s.iter().filter(|(c, d)| intersects(a, b, c, d)).count() as f64)
                .unwrap_or(0.0)
        };
        let request = OrthogonalRequest {
            from: case["from"]
                .as_array()
                .expect("from")
                .iter()
                .map(port)
                .collect(),
            to: case["to"]
                .as_array()
                .expect("to")
                .iter()
                .map(port)
                .collect(),
            obstacles: case["obstacles"]
                .as_array()
                .expect("obstacles")
                .iter()
                .map(bounds)
                .collect(),
            crossings: if segments.is_some() {
                Some(&count)
            } else {
                None
            },
            margin: opt(&case["margin"]),
        };
        let expected: Option<Vec<Waypoint>> = case["out"]
            .as_array()
            .map(|pts| pts.iter().map(wp).collect());
        assert_eq!(route_orthogonal(&request), expected, "case {name}");
    }
}

#[test]
fn side_ports_matches_ts() {
    let fx = fixture();
    for case in fx["sidePorts"].as_array().expect("sidePorts") {
        let c = &case["cost"];
        let get = |k: &str| c.get(k).map(num);
        let cost = SideCost {
            top: get("top"),
            right: get("right"),
            bottom: get("bottom"),
            left: get("left"),
        };
        let expected: Vec<Port> = case["out"]
            .as_array()
            .expect("out")
            .iter()
            .map(port)
            .collect();
        assert_eq!(side_ports(&bounds(&case["b"]), &cost), expected);
    }
}

/// Regression: the end stub was matched exactly against grid points rounded to
/// half units, so a target port at a fractional coordinate made a found route
/// come back as `None`.
#[test]
fn fractional_target_ports_still_route() {
    let b = |x, y, width, height| Bounds {
        x,
        y,
        width,
        height,
    };
    let target = b(333.33, 211.1, 50.0, 50.0);
    let to = side_ports(&target, &SideCost::default());
    let request = OrthogonalRequest {
        from: side_ports(&b(0.3, 0.7, 100.2, 80.1), &SideCost::default()),
        to: to.clone(),
        obstacles: vec![b(150.25, 40.4, 60.6, 120.2)],
        crossings: None,
        margin: None,
    };
    let route = route_orthogonal(&request).expect("a route");
    let last = route.last().expect("points");
    assert!(to.iter().any(|p| p.point == *last));
}
