//! Twin of `zeebe-validate/rules/events.ts`: event definition counts, event
//! sub-process start events, timers (including the static values Zeebe
//! evaluates at deploy time), boundary and end event shape, execution listener
//! restrictions and conditional events.

use super::context::{
    feel_error, feel_failure, is_expression, static_value_message, NodeEntry, ScopeKind,
    ZeebeContext,
};
use crate::compat::pattern::is_js_space;
use bpmnkit_bpmn::{BpmnEventDefinition, BpmnFlowElement, BpmnTimerEventDefinition};
use bpmnkit_xml::XmlElement;

fn event_definitions(node: &BpmnFlowElement) -> &[BpmnEventDefinition] {
    node.event_definitions().unwrap_or(&[])
}

fn is_event_sub_process(node: &BpmnFlowElement) -> bool {
    match node {
        BpmnFlowElement::EventSubProcess(_) => true,
        BpmnFlowElement::SubProcess(s) => s.triggered_by_event == Some(true),
        _ => false,
    }
}

/// `isBpmnActivity`.
fn is_activity(node: &BpmnFlowElement) -> bool {
    use BpmnFlowElement::*;
    matches!(
        node,
        Task(_)
            | ServiceTask(_)
            | UserTask(_)
            | ScriptTask(_)
            | SendTask(_)
            | ReceiveTask(_)
            | BusinessRuleTask(_)
            | ManualTask(_)
            | CallActivity(_)
            | SubProcess(_)
            | AdHocSubProcess(_)
            | EventSubProcess(_)
            | Transaction(_)
    )
}

/// The flow elements Zeebe validates: those of executable processes, contents included.
fn nodes<'a>(ctx: &ZeebeContext<'a>) -> Vec<NodeEntry<'a>> {
    ctx.nodes
        .iter()
        .filter(|n| {
            let pid = ctx.scopes[n.scope].process_id;
            ctx.defs
                .processes
                .iter()
                .any(|p| p.is_executable == Some(true) && p.id == pid)
        })
        .copied()
        .collect()
}

/// The `zeebe:executionListener` children of the single `zeebe:executionListeners`,
/// or `None` when there is none or more than one.
fn execution_listeners<'e>(
    ctx: &ZeebeContext,
    node: &'e BpmnFlowElement,
) -> Option<Vec<&'e XmlElement>> {
    let lists = ctx.zeebe(&node.base().extension_elements, "executionListeners");
    match lists.as_slice() {
        [list] => Some(ctx.zeebe_children(Some(list), "executionListener")),
        _ => None,
    }
}

fn has_listener(listeners: &[&XmlElement], event_type: &str) -> bool {
    listeners
        .iter()
        .any(|l| l.attributes.get("eventType").map(String::as_str) == Some(event_type))
}

/// Java's `Boolean.parseBoolean`.
fn java_boolean(value: &str) -> bool {
    value.to_lowercase() == "true"
}

/// Java's `String.trim()`: strips code points up to U+0020 only.
fn java_trim(value: &str) -> &str {
    value.trim_matches(|c: char| c <= ' ')
}

// ---------------------------------------------------------------------------
// java.time parsing, as Zeebe evaluates static timer values
// ---------------------------------------------------------------------------

/// The failure message of a parse (`TimeParseError.message` in TS).
type ParseResult = Result<(), String>;

fn fail<T>(message: impl Into<String>) -> Result<T, String> {
    Err(message.into())
}

const INT_MAX: f64 = 2147483647.0;
const INT_MIN: f64 = -2147483648.0;

/// `/^[+-]?[0-9]+$/`.
fn is_signed_digits(text: &str) -> bool {
    let digits = text.strip_prefix(['+', '-']).unwrap_or(text);
    !digits.is_empty() && digits.bytes().all(|b| b.is_ascii_digit())
}

/// JS `Number(text)` for a string of digits with an optional sign.
fn number(text: &str) -> f64 {
    text.parse::<f64>().unwrap_or(f64::NAN)
}

/// Java's `Integer.parseInt`, or `None` on `NumberFormatException`.
fn java_int(text: &str) -> Option<f64> {
    if !is_signed_digits(text) {
        return None;
    }
    let n = number(text);
    (INT_MIN..=INT_MAX).contains(&n).then_some(n)
}

/// A cursor over a text, for the hand-written twins of the TS regexes.
struct Scan {
    chars: Vec<char>,
    pos: usize,
}

impl Scan {
    fn new(text: &str) -> Self {
        Self {
            chars: text.chars().collect(),
            pos: 0,
        }
    }

    fn peek(&self) -> Option<char> {
        self.chars.get(self.pos).copied()
    }

    fn at_end(&self) -> bool {
        self.pos >= self.chars.len()
    }

    /// Consumes `c` case-insensitively (ASCII, like the `i` flag).
    fn eat_ci(&mut self, c: char) -> bool {
        if self.peek().is_some_and(|p| p.eq_ignore_ascii_case(&c)) {
            self.pos += 1;
            true
        } else {
            false
        }
    }

    fn eat(&mut self, c: char) -> bool {
        if self.peek() == Some(c) {
            self.pos += 1;
            true
        } else {
            false
        }
    }

    fn eat_sign(&mut self) -> bool {
        if matches!(self.peek(), Some('+' | '-')) {
            self.pos += 1;
            true
        } else {
            false
        }
    }

    fn digits(&mut self, min: usize, max: usize) -> Option<String> {
        let start = self.pos;
        while self.pos - start < max && self.peek().is_some_and(|c| c.is_ascii_digit()) {
            self.pos += 1;
        }
        (self.pos - start >= min).then(|| self.chars[start..self.pos].iter().collect())
    }

    /// `(?:([-+]?[0-9]+)<letter>)?`: the signed integer, or `None` with nothing consumed.
    fn int_then(&mut self, letter: char) -> Option<String> {
        let start = self.pos;
        self.eat_sign();
        if self.digits(1, usize::MAX).is_some() {
            let number: String = self.chars[start..self.pos].iter().collect();
            if self.eat_ci(letter) {
                return Some(number);
            }
        }
        self.pos = start;
        None
    }
}

const PERIOD_FAIL: &str = "Text cannot be parsed to a Period";
const DURATION_FAIL: &str = "Text cannot be parsed to a Duration";

/// `java.time.Period.parse`.
fn parse_period(text: &str) -> ParseResult {
    let mut s = Scan::new(text);
    s.eat_sign();
    if !s.eat_ci('P') {
        return fail(PERIOD_FAIL);
    }
    let groups = [
        s.int_then('Y'),
        s.int_then('M'),
        s.int_then('W'),
        s.int_then('D'),
    ];
    if !s.at_end() || groups.iter().all(Option::is_none) {
        return fail(PERIOD_FAIL);
    }
    let mut values = [0.0; 4];
    for (value, group) in values.iter_mut().zip(&groups) {
        if let Some(g) = group {
            match java_int(g) {
                Some(n) => *value = n,
                None => return fail(PERIOD_FAIL),
            }
        }
    }
    let days = values[2] * 7.0 + values[3];
    if !(INT_MIN..=INT_MAX).contains(&days) {
        return fail(PERIOD_FAIL);
    }
    Ok(())
}

/// `java.time.Duration.parse`; a number too large for a `long` overflows.
fn parse_duration(text: &str) -> ParseResult {
    let mut s = Scan::new(text);
    s.eat_sign();
    if !s.eat_ci('P') {
        return fail(DURATION_FAIL);
    }
    let days = s.int_then('D');
    let mut hours = None;
    let mut minutes = None;
    let mut seconds = None;
    let mut time_part = false;
    let mut time_only_t = false;
    if s.eat_ci('T') {
        time_part = true;
        hours = s.int_then('H');
        minutes = s.int_then('M');
        let start = s.pos;
        s.eat_sign();
        if s.digits(1, usize::MAX).is_some() {
            let number: String = s.chars[start..s.pos].iter().collect();
            if matches!(s.peek(), Some('.' | ',')) {
                s.pos += 1;
                s.digits(0, 9);
            }
            if s.eat_ci('S') {
                seconds = Some(number);
            } else {
                s.pos = start;
            }
        } else {
            s.pos = start;
        }
        time_only_t = hours.is_none() && minutes.is_none() && seconds.is_none();
    }
    if !s.at_end() || (days.is_none() && !time_part) || time_only_t {
        return fail(DURATION_FAIL);
    }
    for g in [&days, &hours, &minutes, &seconds].into_iter().flatten() {
        let digits = g
            .strip_prefix(['+', '-'])
            .unwrap_or(g)
            .trim_start_matches('0');
        if digits.len() > 18 {
            return fail(DURATION_FAIL);
        }
    }
    Ok(())
}

fn leap_year(year: i64) -> bool {
    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
}

const MONTH_DAYS: [i64; 12] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/// `java.time.ZonedDateTime.parse` (ISO_ZONED_DATE_TIME, strict resolver). The
/// bracketed zone id is only checked for shape.
fn parse_zoned_date_time(text: &str) -> ParseResult {
    let failure = || format!("Text '{text}' could not be parsed");
    let mut s = Scan::new(text);
    let sign = s.eat_sign();
    let signed_plus = sign && s.chars[0] == '+';
    let Some(year_digits) = s.digits(4, 10) else {
        return fail(failure());
    };
    let two = |s: &mut Scan| s.digits(2, 2);
    if !s.eat('-') {
        return fail(failure());
    }
    let Some(month) = two(&mut s) else {
        return fail(failure());
    };
    if !s.eat('-') {
        return fail(failure());
    }
    let Some(day) = two(&mut s) else {
        return fail(failure());
    };
    if !s.eat_ci('T') {
        return fail(failure());
    }
    let Some(hour) = two(&mut s) else {
        return fail(failure());
    };
    if !s.eat(':') {
        return fail(failure());
    }
    let Some(minute) = two(&mut s) else {
        return fail(failure());
    };
    let mut second = None;
    let save = s.pos;
    if s.eat(':') {
        match two(&mut s) {
            Some(sec) => {
                second = Some(sec);
                if s.eat('.') {
                    s.digits(0, 9);
                }
            }
            None => s.pos = save,
        }
    }
    let offset_start = s.pos;
    if s.eat_ci('Z') {
    } else if s.eat_sign() {
        if two(&mut s).is_none() {
            return fail(failure());
        }
        let save = s.pos;
        if s.eat(':') && two(&mut s).is_some() {
            let save = s.pos;
            if !(s.eat(':') && two(&mut s).is_some()) {
                s.pos = save;
            }
        } else {
            s.pos = save;
        }
    } else {
        return fail(failure());
    }
    let offset: String = s.chars[offset_start..s.pos].iter().collect();
    let mut zone = None;
    if s.eat('[') {
        let start = s.pos;
        while s.peek().is_some_and(|c| c != ']') {
            s.pos += 1;
        }
        if s.pos == start || !s.eat(']') {
            return fail(failure());
        }
        zone = Some(s.chars[start..s.pos - 1].iter().collect::<String>());
    }
    if !s.at_end() {
        return fail(failure());
    }

    // SignStyle.EXCEEDS_PAD: more than four digits need a sign, and a plus only comes with them.
    let digits = year_digits.len();
    if digits > 4 && !sign {
        return fail(failure());
    }
    if digits == 4 && signed_plus {
        return fail(failure());
    }
    let year = number(&year_digits) as i64;
    let month = number(&month) as i64;
    let day = number(&day) as i64;
    if year > 999_999_999 || !(1..=12).contains(&month) {
        return fail(failure());
    }
    let max_day = if month == 2 && leap_year(year) {
        29
    } else {
        MONTH_DAYS[(month - 1) as usize]
    };
    if day < 1 || day > max_day {
        return fail(failure());
    }
    if number(&hour) > 23.0
        || number(&minute) > 59.0
        || second.as_deref().is_some_and(|sec| number(sec) > 59.0)
    {
        return fail(failure());
    }
    if !offset.eq_ignore_ascii_case("z") {
        let mut parts = offset[1..].split(':');
        let h = number(parts.next().unwrap_or("0"));
        let min = number(parts.next().unwrap_or("0"));
        let sec = number(parts.next().unwrap_or("0"));
        if min > 59.0 || sec > 59.0 || h * 3600.0 + min * 60.0 + sec > 18.0 * 3600.0 {
            return fail(failure());
        }
    }
    if let Some(zone) = zone {
        let valid = zone
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || "~/._+:-".contains(c));
        if !valid {
            return fail(failure());
        }
    }
    Ok(())
}

/// Zeebe's `Interval.parse`: `[<start>/]<period or duration>`.
fn parse_interval(text: &str) -> ParseResult {
    let index = text.rfind('/');
    if let Some(i) = index.filter(|&i| i > 0) {
        parse_zoned_date_time(&text[..i])?;
    }
    let exp = index.map_or(text, |i| &text[i + 1..]);
    let (sign, start_offset) = if exp.starts_with('-') {
        ("-", 1)
    } else if exp.starts_with('+') {
        ("", 1)
    } else {
        ("", 0)
    };
    // Case-sensitive 'T', unlike Period/Duration: a lower-case `pt5m` is read as a period.
    match exp.find('T') {
        None => parse_period(exp),
        Some(i) if exp[..i].encode_utf16().count() == start_offset + 1 => parse_duration(exp),
        Some(i) => {
            parse_period(&exp[..i])?;
            parse_duration(&format!("{sign}P{}", &exp[i..]))
        }
    }
}

/// Zeebe's `RepeatingInterval.parse`, for a text starting with `R`.
fn parse_repeating_interval(text: &str) -> ParseResult {
    let Some(offset) = text.find('/') else {
        return fail("No interval given");
    };
    if offset == 1 {
        return parse_interval(&text[2..]);
    }
    if java_int(&text[1..offset]).is_none() {
        return fail("Cannot parse repetitions count");
    }
    parse_interval(&text[offset + 1..])
}

const CRON_NICKNAMES: [&str; 7] = [
    "@yearly",
    "@annually",
    "@monthly",
    "@weekly",
    "@daily",
    "@midnight",
    "@hourly",
];
const CRON_RANGES: [(f64, f64); 6] = [
    (0.0, 59.0),
    (0.0, 59.0),
    (0.0, 23.0),
    (1.0, 31.0),
    (1.0, 12.0),
    (0.0, 7.0),
];

/// JS `String(n)` for the non-negative whole numbers cron messages embed.
fn js_number(n: f64) -> String {
    if n >= 1e21 {
        let s = format!("{n:e}");
        return s.replacen('e', "e+", 1);
    }
    format!("{n}")
}

/// `/^(?:\*|([0-9]+)(?:-([0-9]+))?)(?:\/([0-9]+))?$/`: the numbers of a cron part, or `None`
/// when the part does not have that shape.
fn cron_part(part: &str) -> Option<(Vec<f64>, Option<f64>)> {
    let mut s = Scan::new(part);
    let mut values = vec![];
    if !s.eat('*') {
        values.push(number(&s.digits(1, usize::MAX)?));
        if s.eat('-') {
            values.push(number(&s.digits(1, usize::MAX)?));
        }
    }
    let mut step = None;
    if s.eat('/') {
        step = Some(number(&s.digits(1, usize::MAX)?));
    }
    s.at_end().then_some((values, step))
}

/// Zeebe's `CronTimer.parse` (cron-utils, Spring 5.3 definition). Only the
/// failures that are certain are reproduced.
fn parse_cron(text: &str) -> ParseResult {
    let trimmed = java_trim(text);
    if trimmed.is_empty() {
        return fail("Empty expression!");
    }
    // Nicknames match exactly (lower case, untrimmed); anything else starting with '@' is read as fields.
    if CRON_NICKNAMES.contains(&text) {
        return Ok(());
    }
    if text == "@reboot" {
        return fail("Nickname @reboot not supported!");
    }
    // `split(/\s+/)`: empty ends stay when the trimmed text starts or ends with other white space.
    let mut fields: Vec<&str> = vec![];
    let mut start = 0;
    let mut in_space = false;
    for (i, c) in trimmed.char_indices() {
        if is_js_space(c) {
            if !in_space {
                fields.push(&trimmed[start..i]);
                in_space = true;
            }
        } else if in_space {
            start = i;
            in_space = false;
        }
    }
    fields.push(if in_space { "" } else { &trimmed[start..] });
    if fields.len() != 6 {
        return fail(format!(
            "Cron expression contains {} parts but we expect one of [6]",
            fields.len()
        ));
    }
    let failed = |detail: String| -> ParseResult {
        fail(format!("Failed to parse cron expression. {detail}"))
    };
    for (i, field) in fields.iter().enumerate() {
        let (lo, hi) = CRON_RANGES[i];
        for part in field.split(',') {
            // `?` is only for day-of-month and day-of-week.
            if part == "?" && i != 3 && i != 5 {
                return failed("Invalid expression: ?".to_string());
            }
            let Some((values, step)) = cron_part(part) else {
                continue;
            };
            for &v in &values {
                if v < lo || v > hi {
                    return failed(format!(
                        "Value {} not in range [{}, {}]",
                        js_number(v),
                        js_number(lo),
                        js_number(hi)
                    ));
                }
            }
            let from = values.first().copied().unwrap_or(0.0);
            let to = values.get(1).copied().unwrap_or(from);
            // Day-of-month, month and day-of-week ranges may wrap around; the time fields may not.
            if i < 3 && from > to {
                return failed(format!(
                    "Invalid range! [{},{}]",
                    js_number(from),
                    js_number(to)
                ));
            }
            if let Some(step) = step.filter(|&st| st < 1.0 || st > hi) {
                return failed(format!(
                    "Period {} not in range [{}, {}]",
                    js_number(step),
                    js_number(lo),
                    js_number(hi)
                ));
            }
        }
    }
    Ok(())
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum StaticType {
    Null,
    Boolean,
    Number,
    String,
}

impl StaticType {
    fn name(self) -> &'static str {
        match self {
            Self::Null => "NULL",
            Self::Boolean => "BOOLEAN",
            Self::Number => "NUMBER",
            Self::String => "STRING",
        }
    }
}

/// java.math.BigDecimal's grammar: `/^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)([eE][+-]?[0-9]+)?$/`.
fn is_big_decimal(text: &str) -> bool {
    let mut s = Scan::new(text);
    s.eat_sign();
    if s.digits(1, usize::MAX).is_some() {
        s.eat('.');
        s.digits(0, usize::MAX);
    } else if !(s.eat('.') && s.digits(1, usize::MAX).is_some()) {
        return false;
    }
    if s.eat('e') || s.eat('E') {
        s.eat_sign();
        if s.digits(1, usize::MAX).is_none() {
            return false;
        }
    }
    s.at_end()
}

/// The result type of Zeebe's `StaticExpression` for a static text.
fn static_type(text: &str) -> StaticType {
    if text == "null" {
        StaticType::Null
    } else if text == "true" || text == "false" {
        StaticType::Boolean
    } else if is_big_decimal(text) {
        StaticType::Number
    } else {
        StaticType::String
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum TimerKind {
    Duration,
    Cycle,
    Date,
}

impl TimerKind {
    fn name(self) -> &'static str {
        match self {
            Self::Duration => "duration",
            Self::Cycle => "cycle",
            Self::Date => "date",
        }
    }
}

/// The failure of evaluating a static timer value the way `TimerCatchEventExpressionValidator`
/// does, or `None` when it is valid. A message whose Java detail we can't
/// reproduce is cut to a prefix of Zeebe's.
fn static_timer_failure(kind: TimerKind, text: &str) -> Option<String> {
    let wrap = |detail: &str| format!("Invalid timer {} expression ({detail})", kind.name());
    let ty = static_type(text);
    if kind == TimerKind::Cycle {
        if ty != StaticType::String {
            return Some(wrap(&format!(
                "Expected result of the expression '{text}' to be 'STRING', but was '{}'.",
                ty.name()
            )));
        }
        let result = if text.starts_with('R') {
            parse_repeating_interval(text)
        } else {
            parse_cron(text)
        };
        return result.err().map(|message| {
            if message.starts_with("Text '") {
                format!("Invalid timer cycle expression ({message}")
            } else {
                wrap(&message)
            }
        });
    }
    let types = if kind == TimerKind::Duration {
        "[DURATION, PERIOD, STRING]"
    } else {
        "[DATE_TIME, STRING]"
    };
    if ty != StaticType::String {
        return Some(wrap(&format!(
            "Expected result of the expression '{text}' to be one of '{types}', but was '{}'.",
            ty.name()
        )));
    }
    let result = if kind == TimerKind::Duration {
        parse_interval(text)
    } else {
        parse_zoned_date_time(text)
    };
    result.err().map(|_| {
        let label = if kind == TimerKind::Duration {
            "duration"
        } else {
            "date-time"
        };
        wrap(&format!(
            "Invalid {label} format '{text}' for expression '{text}'."
        ))
    })
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

fn interrupting_timer_cycle(
    ctx: &mut ZeebeContext,
    element_id: &str,
    defs: &[BpmnEventDefinition],
) {
    if defs
        .iter()
        .any(|d| matches!(d, BpmnEventDefinition::Timer(t) if t.time_cycle.is_some()))
    {
        ctx.report(
            "interrupting-timer-cycle",
            element_id,
            "Interrupting timer event with time cycle is not allowed.".to_string(),
            "Use a time duration or date, or make the event non-interrupting.",
        );
    }
}

/// Z37, Z39: start event definition count and start listeners.
fn start_events(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        let BpmnFlowElement::StartEvent(start) = entry.node else {
            continue;
        };
        let id = &start.base.id;
        if start.event_definitions.len() > 1 {
            ctx.report(
                "start-event-definitions",
                id,
                "Start event can't have more than one type".to_string(),
                "Keep one event definition on the start event.",
            );
        }
        let listeners = execution_listeners(ctx, entry.node);
        if listeners.is_some_and(|l| has_listener(&l, "start")) {
            ctx.report(
                "start-event-start-listener",
                id,
                "Execution listeners of type 'start' are not supported by start events".to_string(),
                "Use an 'end' execution listener on the start event.",
            );
        }
    }
}

/// Z38: a start event form with public access, unsupported since public forms were removed.
fn public_access_form(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        let BpmnFlowElement::StartEvent(start) = entry.node else {
            continue;
        };
        let enabled = ctx
            .zeebe(&start.base.extension_elements, "properties")
            .into_iter()
            .flat_map(|p| ctx.zeebe_children(Some(p), "property"))
            .any(|p| {
                p.attributes.get("name").map(String::as_str) == Some("publicAccess")
                    && java_boolean(p.attributes.get("value").map_or("", String::as_str))
            });
        if enabled {
            ctx.report(
                "start-form-public-access",
                &start.base.id,
                "Start event forms with public access enabled are not supported. Please remove the 'publicAccess' property or set it to 'false'".to_string(),
                "Remove the 'publicAccess' property from the start event.",
            );
        }
    }
}

/// Z40-Z43 for event sub-processes. Zeebe validates only the first start event,
/// and names the event sub-process.
fn event_sub_process_starts(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        let node = entry.node;
        if !is_event_sub_process(node) {
            continue;
        }
        let Some(contents) = node.contents() else {
            continue;
        };
        let Some(BpmnFlowElement::StartEvent(start)) = contents
            .flow_elements
            .iter()
            .find(|c| matches!(c, BpmnFlowElement::StartEvent(_)))
        else {
            continue;
        };
        let id = &node.base().id;
        let scope_kind = ctx.scopes[entry.scope].kind;
        let defs = &start.event_definitions;
        if defs.is_empty() {
            ctx.report(
                "event-sub-process-start-typed",
                id,
                "Start events in event subprocesses must be one of: message, timer, error, signal, escalation or conditional".to_string(),
                "Give the event sub-process start event a message, timer, error, signal, escalation or conditional trigger.",
            );
        }
        if defs
            .iter()
            .any(|d| matches!(d, BpmnEventDefinition::Compensate(_)))
            && scope_kind == ScopeKind::Process
        {
            ctx.report(
                "compensation-event-sub-process-level",
                id,
                "A compensation event subprocess is not allowed on the process level".to_string(),
                "Move the compensation event sub-process into a sub-process.",
            );
        }
        // A typed but unsupported trigger is Z17 (event-sub-process-start-type, structure.ts).
        let interrupting = start.is_interrupting != Some(false);
        if interrupting {
            interrupting_timer_cycle(ctx, id, defs);
        }
        if interrupting && scope_kind == ScopeKind::AdHocSubProcess {
            ctx.report(
                "interrupting-event-sub-process-in-ad-hoc",
                id,
                "An interrupting event subprocess is not allowed inside an ad-hoc subprocess"
                    .to_string(),
                "Make the event sub-process non-interrupting.",
            );
        }
    }
}

/// Z43 for boundary events: `cancelActivity` defaults to true.
fn boundary_timer_cycle(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        if let BpmnFlowElement::BoundaryEvent(b) = entry.node {
            if b.cancel_activity != Some(false) {
                interrupting_timer_cycle(ctx, &b.base.id, &b.event_definitions);
            }
        }
    }
}

fn timer_defs(node: &BpmnFlowElement) -> impl Iterator<Item = &BpmnTimerEventDefinition> {
    event_definitions(node).iter().filter_map(|d| match d {
        BpmnEventDefinition::Timer(t) => Some(t),
        _ => None,
    })
}

/// Z44: exactly one of timeDuration / timeDate / timeCycle, on any timer definition.
fn timer_one_value(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        for def in timer_defs(entry.node) {
            let count = [&def.time_date, &def.time_duration, &def.time_cycle]
                .iter()
                .filter(|v| v.is_some())
                .count();
            if count != 1 {
                ctx.report(
                    "timer-one-value",
                    &entry.node.base().id,
                    "Must be exactly one type of timer: timeDuration, timeDate or timeCycle"
                        .to_string(),
                    "Give the timer exactly one of time duration, time date or time cycle.",
                );
            }
        }
    }
}

/// Z45, Z57: an intermediate catch event has one definition; a timer one needs a duration or date.
fn intermediate_catch(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        let BpmnFlowElement::IntermediateCatchEvent(event) = entry.node else {
            continue;
        };
        match event.event_definitions.as_slice() {
            [def] => {
                if let BpmnEventDefinition::Timer(t) = def {
                    if t.time_duration.is_none() && t.time_date.is_none() {
                        ctx.report(
                            "intermediate-timer-value",
                            &event.base.id,
                            "Intermediate timer catch event must have either a time duration or a time date.".to_string(),
                            "Use a time duration or time date on the intermediate timer.",
                        );
                    }
                }
            }
            _ => ctx.report(
                "intermediate-catch-definitions",
                &event.base.id,
                "Must have exactly one event definition".to_string(),
                "Give the intermediate catch event exactly one event definition.",
            ),
        }
    }
}

fn is_catch_event(node: &BpmnFlowElement) -> bool {
    matches!(
        node,
        BpmnFlowElement::StartEvent(_)
            | BpmnFlowElement::IntermediateCatchEvent(_)
            | BpmnFlowElement::BoundaryEvent(_)
    )
}

/// Z46: every timer value must parse as FEEL; on catch events Zeebe also
/// evaluates the static value (duration, then cycle, then date, whichever comes first).
fn timer_expression(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        let id = &entry.node.base().id;
        for def in timer_defs(entry.node) {
            for text in [&def.time_date, &def.time_duration, &def.time_cycle]
                .into_iter()
                .flatten()
            {
                if feel_error(text).is_some() {
                    ctx.report(
                        "timer-expression",
                        id,
                        feel_failure(text),
                        "Fix the FEEL syntax of the timer expression.",
                    );
                }
            }
            if !is_catch_event(entry.node) {
                continue;
            }
            let (kind, text) = if let Some(t) = &def.time_duration {
                (TimerKind::Duration, t)
            } else if let Some(t) = &def.time_cycle {
                (TimerKind::Cycle, t)
            } else if let Some(t) = &def.time_date {
                (TimerKind::Date, t)
            } else {
                continue;
            };
            if is_expression(text) {
                continue;
            }
            if let Some(failure) = static_timer_failure(kind, text) {
                ctx.report(
                    "timer-expression",
                    id,
                    failure,
                    match kind {
                        TimerKind::Duration => "Use an ISO-8601 duration such as PT5M, or a FEEL expression starting with '='.",
                        TimerKind::Date => "Use an ISO-8601 date-time with offset such as 2030-01-01T09:00:00Z, or a FEEL expression.",
                        TimerKind::Cycle => "Use an ISO-8601 repeating interval such as R3/PT10M or a 6-field cron expression.",
                    },
                );
            }
        }
    }
}

/// The `sourceRef` of every association of the model, as Zeebe's
/// `getModelElementsByType(Association)` sees them.
fn association_sources(ctx: &ZeebeContext) -> Vec<String> {
    let mut out = vec![];
    for c in &ctx.defs.collaborations {
        out.extend(c.associations.iter().map(|a| a.source_ref.clone()));
    }
    for p in &ctx.defs.processes {
        out.extend(p.contents.associations.iter().map(|a| a.source_ref.clone()));
    }
    for entry in &ctx.nodes {
        if let Some(contents) = entry.node.contents() {
            out.extend(contents.associations.iter().map(|a| a.source_ref.clone()));
        }
    }
    out
}

/// Z48-Z52: boundary event attachment, flows, definition count and listeners.
fn boundary_events(ctx: &mut ZeebeContext) {
    let mut all: Option<Vec<String>> = None;
    for entry in nodes(ctx) {
        let BpmnFlowElement::BoundaryEvent(node) = entry.node else {
            continue;
        };
        let id = &node.base.id;
        let host = ctx.node(Some(&node.attached_to_ref)).map(|h| h.node);
        // A reference to a non-activity fails Zeebe's parse with a ClassCastException; it is just as undeployable.
        if !host.is_some_and(is_activity) {
            ctx.report(
                "boundary-attached",
                id,
                "Must be attached to an activity".to_string(),
                "Attach the boundary event to an activity.",
            );
        }
        if !ctx.incoming(id).is_empty() {
            ctx.report(
                "boundary-incoming",
                id,
                "Cannot have incoming sequence flows".to_string(),
                "Remove the sequence flows into the boundary event.",
            );
        }
        let defs = &node.event_definitions;
        if defs
            .iter()
            .any(|d| matches!(d, BpmnEventDefinition::Compensate(_)))
        {
            let sources = all.get_or_insert_with(|| association_sources(ctx));
            let associated = sources.iter().any(|s| s == id);
            if !ctx.outgoing(id).is_empty() || !associated {
                ctx.report(
                    "compensation-boundary-shape",
                    id,
                    "Compensation boundary events must have a compensation association and no outgoing sequence flows".to_string(),
                    "Connect the compensation boundary event to its handler with an association, not a sequence flow.",
                );
            }
        }
        if defs.len() != 1 {
            ctx.report(
                "boundary-event-definitions",
                id,
                "Must have exactly one event definition".to_string(),
                "Give the boundary event exactly one event definition.",
            );
        }
        let listeners = execution_listeners(ctx, entry.node);
        let (Some(listeners), Some(first)) = (listeners, defs.first()) else {
            continue;
        };
        if matches!(first, BpmnEventDefinition::Compensate(_)) {
            ctx.report(
                "boundary-listeners",
                id,
                "Execution listeners of type 'start' and 'end' are not supported by [compensation] boundary events".to_string(),
                "Remove the execution listeners from the compensation boundary event.",
            );
        } else if has_listener(&listeners, "start") {
            ctx.report(
                "boundary-listeners",
                id,
                "Execution listeners of type 'start' are not supported by boundary events"
                    .to_string(),
                "Use an 'end' execution listener on the boundary event.",
            );
        }
    }
}

/// The `waitForCompletion` attribute of a compensate definition.
fn wait_for_completion(def: &BpmnEventDefinition) -> Option<&str> {
    match def {
        BpmnEventDefinition::Compensate(c) => c
            .unknown_attributes
            .as_ref()?
            .get("waitForCompletion")
            .map(String::as_str),
        _ => None,
    }
}

/// Z53-Z56: end event flows, definition count, waitForCompletion and error end listeners.
fn end_events(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        match entry.node {
            BpmnFlowElement::IntermediateThrowEvent(event) => {
                let compensations: Vec<_> = event
                    .event_definitions
                    .iter()
                    .filter(|d| matches!(d, BpmnEventDefinition::Compensate(_)))
                    .collect();
                let wait = match compensations.as_slice() {
                    [one] => wait_for_completion(one),
                    _ => None,
                };
                if wait.is_some_and(|w| !java_boolean(w)) {
                    ctx.report(
                        "compensation-wait-for-completion",
                        &event.base.id,
                        "A compensation intermediate throwing event waitForCompletion attribute must be true or not present".to_string(),
                        "Remove waitForCompletion or set it to true.",
                    );
                }
            }
            BpmnFlowElement::EndEvent(event) => {
                let id = &event.base.id;
                if !ctx.outgoing(id).is_empty() {
                    ctx.report(
                        "end-event-outgoing",
                        id,
                        "End events must not have outgoing sequence flows to other elements."
                            .to_string(),
                        "Remove the outgoing sequence flows of the end event.",
                    );
                }
                let defs = &event.event_definitions;
                if defs.len() > 1 {
                    ctx.report(
                        "end-event-definitions",
                        id,
                        "Must have at most one event definition".to_string(),
                        "Keep at most one event definition on the end event.",
                    );
                }
                for def in defs {
                    if wait_for_completion(def).is_some_and(|w| !java_boolean(w)) {
                        ctx.report(
                            "compensation-wait-for-completion",
                            id,
                            "A compensation end event waitForCompletion attribute must be true or not present".to_string(),
                            "Remove waitForCompletion or set it to true.",
                        );
                    }
                }
                let listeners = execution_listeners(ctx, entry.node);
                if listeners.is_some_and(|l| has_listener(&l, "end"))
                    && matches!(defs.first(), Some(BpmnEventDefinition::Error(_)))
                {
                    ctx.report(
                        "error-end-end-listener",
                        id,
                        "Execution listeners of type 'end' are not supported by [error] end events"
                            .to_string(),
                        "Use a 'start' execution listener on the error end event.",
                    );
                }
            }
            _ => {}
        }
    }
}

/// Z58: a conditional event's condition must be a FEEL expression that parses.
fn conditional_condition(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        for def in event_definitions(entry.node) {
            let BpmnEventDefinition::Conditional(c) = def else {
                continue;
            };
            let Some(text) = &c.condition else {
                continue;
            };
            let id = &entry.node.base().id;
            if !is_expression(text) {
                ctx.report(
                    "conditional-condition",
                    id,
                    static_value_message(text),
                    "Write the condition as a FEEL expression starting with '='.",
                );
            } else if feel_error(text).is_some() {
                ctx.report(
                    "conditional-condition",
                    id,
                    feel_failure(text),
                    "Fix the FEEL syntax of the condition.",
                );
            }
        }
    }
}

fn check_filters(ctx: &mut ZeebeContext, id: &str, filters: Vec<&XmlElement>) {
    for filter in filters {
        let Some(events) = filter.attributes.get("variableEvents") else {
            continue;
        };
        if java_trim(events).is_empty() {
            continue;
        }
        for raw in events.split(',') {
            let event = java_trim(raw);
            if !event.is_empty() && event != "create" && event != "update" {
                ctx.report(
                    "conditional-filter-events",
                    id,
                    format!("Variable event '{event}' is not valid. Must be one of: create, update or a comma-separated list of both."),
                    "Use 'create', 'update' or 'create,update' as variable events.",
                );
            }
        }
    }
}

/// Z59: `zeebe:conditionalFilter` variableEvents, wherever the filter is.
fn conditional_filter(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        let id = &entry.node.base().id;
        let filters = ctx.zeebe(&entry.node.base().extension_elements, "conditionalFilter");
        check_filters(ctx, id, filters);
        for def in event_definitions(entry.node) {
            if let BpmnEventDefinition::Conditional(c) = def {
                let ext = c.extension_elements.as_deref().unwrap_or(&[]);
                let filters = ctx.zeebe(ext, "conditionalFilter");
                check_filters(ctx, id, filters);
            }
        }
    }
}

/// Z60: the conditional catch events after an event-based gateway need distinct conditions.
fn event_based_gateway_conditions(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        let BpmnFlowElement::EventBasedGateway(gateway) = entry.node else {
            continue;
        };
        let mut conditions: Vec<&str> = vec![];
        for flow in ctx.outgoing(&gateway.id) {
            let Some(BpmnFlowElement::IntermediateCatchEvent(target)) =
                ctx.node(Some(&flow.flow.target_ref)).map(|t| t.node)
            else {
                continue;
            };
            for def in &target.event_definitions {
                if let BpmnEventDefinition::Conditional(c) = def {
                    if let Some(cond) = c.condition.as_deref().filter(|c| !c.is_empty()) {
                        conditions.push(java_trim(cond));
                    }
                }
            }
        }
        let mut reported: Vec<&str> = vec![];
        for (i, &c) in conditions.iter().enumerate() {
            let first = conditions.iter().position(|&x| x == c);
            if first != Some(i) && !reported.contains(&c) {
                reported.push(c);
                ctx.report(
                    "event-based-gateway-duplicate-condition",
                    &gateway.id,
                    format!("Multiple conditional event definitions with the same condition expression '{c}' are not allowed."),
                    "Give each conditional event after the gateway a different condition.",
                );
            }
        }
    }
}

pub(super) fn check(ctx: &mut ZeebeContext) {
    start_events(ctx);
    public_access_form(ctx);
    event_sub_process_starts(ctx);
    boundary_timer_cycle(ctx);
    timer_one_value(ctx);
    intermediate_catch(ctx);
    timer_expression(ctx);
    boundary_events(ctx);
    end_events(ctx);
    conditional_condition(ctx);
    conditional_filter(ctx);
    event_based_gateway_conditions(ctx);
}
