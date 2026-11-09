//! SVG path literals copied verbatim from `packages/core/src/bpmn/svg.ts`.

/// Task-type icon, 14×14 with origin at 0,0 (TS `taskIcon`).
pub(crate) fn task_icon(type_name: &str) -> &'static str {
    match type_name {
        "manualTask" => {
            r#"<path d="M3 8V4.5a1 1 0 012 0V8M5 7V3a1 1 0 012 0v4M7 6a1 1 0 012 0v1.5M9 7.5a1 1 0 012 0V9c0 2.5-1.5 4-4.5 4H5c-2.5 0-4-1.5-4-4V8" class="bi"/>"#
        }
        "serviceTask" => {
            r#"<circle cx="7" cy="7" r="5.5" class="bi"/><circle cx="7" cy="7" r="2" class="bi"/><path d="M7 1v2.5M7 10.5v2.5M1 7h2.5M10.5 7h2.5M2.8 2.8l1.7 1.7M9.5 9.5l1.7 1.7M11.2 2.8l-1.7 1.7M4.5 9.5l-1.7 1.7" class="bi"/>"#
        }
        "userTask" => {
            r#"<circle cx="7" cy="4.5" r="2.5" class="bi"/><path d="M1.5 14Q1.5 9 7 9Q12.5 9 12.5 14" class="bi"/>"#
        }
        "scriptTask" => {
            r#"<rect x="2" y="0.5" width="10" height="13" rx="1" class="bi"/><path d="M4 4h6M4 7h6M4 10h4" class="bi"/>"#
        }
        "sendTask" => {
            r#"<path d="M1.5 3.5h11v8h-11z" class="bis"/><path d="M1.5 3.5l5.5 4.5 5.5-4.5M1.5 11.5l4-3.5M12.5 11.5l-4-3.5" fill="none" stroke="var(--_sf)" stroke-width="1.5"/>"#
        }
        "receiveTask" => {
            r#"<rect x="1.5" y="3.5" width="11" height="8" class="bi"/><path d="M1.5 3.5l5.5 4.5 5.5-4.5" class="bi"/>"#
        }
        "businessRuleTask" => {
            r#"<rect x="1" y="1" width="12" height="12" class="bi"/><path d="M1 4.5h12M4 1v12" class="bi"/>"#
        }
        _ => "",
    }
}

/// Event-definition marker centred at 0,0 (TS `eventMarker`).
pub(crate) fn event_marker(def_type: &str, filled: bool) -> String {
    let c = if filled { "bis" } else { "bi" };
    match def_type {
        "timer" => format!(
            r#"<circle cx="0" cy="0" r="5" class="{c}"/><path d="M0 -3.5v3.5l2 2" class="bi"/>"#
        ),
        "message" => format!(
            r#"<rect x="-5" y="-3.5" width="10" height="7" class="{c}"/><path d="M-5 -3.5l5 4 5-4" class="{c}" {}/>"#,
            if filled {
                r#"fill="none" stroke="var(--_sf)""#
            } else {
                ""
            }
        ),
        "signal" => format!(r#"<path d="M0 -5.5l5.5 10h-11z" class="{c}"/>"#),
        "error" => {
            format!(r#"<path d="M-2 -5l2.5 4.5-3.5 0.5L2 5l-2.5-4.5 3.5-0.5z" class="{c}"/>"#)
        }
        "escalation" => format!(r#"<path d="M0 -5.5l3.5 9.5-3.5-3.5-3.5 3.5z" class="{c}"/>"#),
        "compensate" => {
            format!(r#"<path d="M1 -3.5l-5 3.5 5 3.5zM6 -3.5l-5 3.5 5 3.5z" class="{c}"/>"#)
        }
        "conditional" => format!(
            r#"<rect x="-4.5" y="-5.5" width="9" height="11" rx="1" class="{c}"/><path d="M-2.5 -2.5h5M-2.5 0h5M-2.5 2.5h3" class="bi"/>"#
        ),
        "link" => {
            format!(r#"<path d="M-2 -3.5v7l5.5-3.5z" class="{c}"/><path d="M-6 0h4" class="bi"/>"#)
        }
        "cancel" => format!(r#"<path d="M-4 -4l8 8M4 -4l-8 8" class="{c}"/>"#),
        "terminate" => r#"<circle cx="0" cy="0" r="5" class="bis"/>"#.to_owned(),
        _ => String::new(),
    }
}

/// Gateway-type marker centred at 0,0 (TS `gatewayMarker`).
pub(crate) fn gateway_marker(type_name: &str) -> &'static str {
    match type_name {
        "exclusiveGateway" => r#"<path d="M-6 -6l12 12M6 -6l-12 12" class="gms"/>"#,
        "parallelGateway" => r#"<path d="M0 -8v16M-8 0h16" class="gms"/>"#,
        "inclusiveGateway" => r#"<circle cx="0" cy="0" r="6" class="gms"/>"#,
        "eventBasedGateway" => {
            r#"<circle cx="0" cy="0" r="7" class="gms"/><circle cx="0" cy="0" r="5" class="gms"/><path d="M0 -4L3.8 1.8H-3.8Z" class="gm"/>"#
        }
        "complexGateway" => {
            r#"<path d="M0 -8v16M-8 0h16M-5.7 -5.7l11.4 11.4M5.7 -5.7l-11.4 11.4" class="gms"/>"#
        }
        _ => "",
    }
}

/// Collapsed sub-process `+`, or the ad-hoc `~` (TS `subProcessMarker`).
pub(crate) fn sub_process_marker(type_name: &str) -> &'static str {
    if type_name == "adHocSubProcess" {
        r#"<path d="M-7 0Q-4 -4 0 0Q4 4 7 0" class="bi"/>"#
    } else {
        r#"<rect x="-7" y="-7" width="14" height="14" rx="1" class="bi"/><path d="M0 -4v8M-4 0h8" class="bi"/>"#
    }
}
