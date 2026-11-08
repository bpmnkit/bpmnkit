//! BPMN parsing for Reebe: the shared `bpmnkit-bpmn` parser, then [`crate::adapter`] maps its
//! model onto the execution model.

use crate::adapter::adapt;
use crate::model::*;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum BpmnParseError {
    #[error("XML parse error: {0}")]
    XmlError(String),

    #[error("Missing required attribute '{attr}' on element '{element}'")]
    MissingAttribute { element: String, attr: String },

    #[error("Invalid BPMN structure: {0}")]
    InvalidStructure(String),
}

impl From<bpmnkit_bpmn::ParseError> for BpmnParseError {
    fn from(e: bpmnkit_bpmn::ParseError) -> Self {
        let message = e.0;
        // `Missing required attribute "id" on <process>`
        let missing = message
            .strip_prefix("Missing required attribute \"")
            .and_then(|rest| {
                let (attr, rest) = rest.split_once("\" on <")?;
                Some((rest.strip_suffix('>')?.to_owned(), attr.to_owned()))
            });
        match missing {
            Some((element, attr)) => BpmnParseError::MissingAttribute {
                element: element.rsplit(':').next().unwrap_or(&element).to_owned(),
                attr,
            },
            None if message.starts_with("Expected <definitions>")
                || message.starts_with("Missing <") =>
            {
                BpmnParseError::InvalidStructure(message)
            }
            None => BpmnParseError::XmlError(message),
        }
    }
}

/// Parse a BPMN 2.0 XML string and return all process definitions.
pub fn parse_bpmn(xml: &str) -> Result<Vec<BpmnProcess>, BpmnParseError> {
    let mut source = std::borrow::Cow::Borrowed(xml);
    // The shared parser mirrors a strict reader and wants an `id` and a `targetNamespace` on
    // `<definitions>`; Reebe never needed either, and hand-written test and deployment
    // resources often leave them out. Supply a missing one and read again.
    for _ in 0..2 {
        match bpmnkit_bpmn::parse_bpmn(&source) {
            Ok(defs) => return Ok(adapt(&defs)),
            Err(e) => {
                let missing = ["id", "targetNamespace"].into_iter().find(|attr| {
                    e.0 == format!(
                        "Missing required attribute \"{attr}\" on <{}>",
                        definitions_tag(&source).unwrap_or_default()
                    )
                });
                match missing.and_then(|attr| with_root_attribute(&source, attr)) {
                    Some(patched) => source = std::borrow::Cow::Owned(patched),
                    None => return Err(e.into()),
                }
            }
        }
    }
    Ok(adapt(&bpmnkit_bpmn::parse_bpmn(&source)?))
}

/// The byte range of the name in the root element's start tag, if that is `definitions`.
fn definitions_name_range(xml: &str) -> Option<std::ops::Range<usize>> {
    let mut at = 0;
    while let Some(i) = xml[at..].find('<') {
        let start = at + i;
        let rest = &xml[start + 1..];
        if rest.starts_with('?') || rest.starts_with('!') {
            // Declarations, comments and doctypes hold no root; `>` ends all that matter here.
            at = start + xml[start..].find('>').map_or(xml.len(), |e| e + 1);
            continue;
        }
        let len = rest.find(|c: char| c.is_whitespace() || c == '>' || c == '/')?;
        let name = &rest[..len];
        return (name.rsplit(':').next() == Some("definitions"))
            .then(|| start + 1..start + 1 + len);
    }
    None
}

fn definitions_tag(xml: &str) -> Option<&str> {
    definitions_name_range(xml).map(|r| &xml[r])
}

fn with_root_attribute(xml: &str, attr: &str) -> Option<String> {
    let end = definitions_name_range(xml)?.end;
    let value = if attr == "id" { "definitions" } else { "" };
    Some(format!("{} {attr}=\"{value}\"{}", &xml[..end], &xml[end..]))
}

#[cfg(test)]
mod tests {
    use super::*;

    const SIMPLE_PROCESS: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">
  <bpmn:process id="simple-process" name="Simple Process" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:serviceTask id="ServiceTask_1" name="Do Work">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="my-job" retries="3"/>
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="EndEvent_1">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="ServiceTask_1"/>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="ServiceTask_1" targetRef="EndEvent_1"/>
  </bpmn:process>
</bpmn:definitions>"#;

    #[test]
    fn test_parse_simple_process() {
        let processes = parse_bpmn(SIMPLE_PROCESS).unwrap();
        assert_eq!(processes.len(), 1);
        let p = &processes[0];
        assert_eq!(p.id, "simple-process");
        assert_eq!(p.name.as_deref(), Some("Simple Process"));
        assert!(p.is_executable);
        assert_eq!(p.start_events.len(), 1);
        assert_eq!(p.sequence_flows.len(), 2);
        assert!(p.elements.contains_key("ServiceTask_1"));
        assert!(p.elements.contains_key("StartEvent_1"));
        assert!(p.elements.contains_key("EndEvent_1"));
    }

    #[test]
    fn test_parse_service_task_with_job_type() {
        let processes = parse_bpmn(SIMPLE_PROCESS).unwrap();
        let p = &processes[0];
        if let Some(FlowElement::ServiceTask(task)) = p.elements.get("ServiceTask_1") {
            assert!(task.task_definition.is_some());
            let def = task.task_definition.as_ref().unwrap();
            assert_eq!(def.job_type, "my-job");
            assert_eq!(def.retries, "3");
        } else {
            panic!("ServiceTask_1 not found or wrong type");
        }
    }

    #[test]
    fn test_parse_exclusive_gateway() {
        let xml = r#"<?xml version="1.0"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <bpmn:process id="gw-process" isExecutable="true">
    <bpmn:startEvent id="Start"><bpmn:outgoing>F1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:exclusiveGateway id="GW1"><bpmn:incoming>F1</bpmn:incoming><bpmn:outgoing>F2</bpmn:outgoing><bpmn:outgoing>F3</bpmn:outgoing></bpmn:exclusiveGateway>
    <bpmn:endEvent id="End1"><bpmn:incoming>F2</bpmn:incoming></bpmn:endEvent>
    <bpmn:endEvent id="End2"><bpmn:incoming>F3</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="F1" sourceRef="Start" targetRef="GW1"/>
    <bpmn:sequenceFlow id="F2" sourceRef="GW1" targetRef="End1"/>
    <bpmn:sequenceFlow id="F3" sourceRef="GW1" targetRef="End2"/>
  </bpmn:process>
</bpmn:definitions>"#;
        let processes = parse_bpmn(xml).unwrap();
        assert_eq!(processes.len(), 1);
        let gw = processes[0].elements.get("GW1").unwrap();
        assert!(matches!(gw, FlowElement::ExclusiveGateway(_)));
    }

    #[test]
    fn test_parse_condition_expression_cdata() {
        // bpmn-js sometimes wraps condition expressions in CDATA sections.
        // The parser must read CDATA text the same as plain text.
        let xml = "<?xml version=\"1.0\"?>\n\
<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\">\n\
  <bpmn:process id=\"cdata-proc\" isExecutable=\"true\">\n\
    <bpmn:startEvent id=\"Start\"><bpmn:outgoing>F1</bpmn:outgoing></bpmn:startEvent>\n\
    <bpmn:exclusiveGateway id=\"GW1\" default=\"F3\">\n\
      <bpmn:incoming>F1</bpmn:incoming>\n\
      <bpmn:outgoing>F2</bpmn:outgoing>\n\
      <bpmn:outgoing>F3</bpmn:outgoing>\n\
    </bpmn:exclusiveGateway>\n\
    <bpmn:endEvent id=\"End1\"><bpmn:incoming>F2</bpmn:incoming></bpmn:endEvent>\n\
    <bpmn:endEvent id=\"End2\"><bpmn:incoming>F3</bpmn:incoming></bpmn:endEvent>\n\
    <bpmn:sequenceFlow id=\"F1\" sourceRef=\"Start\" targetRef=\"GW1\"/>\n\
    <bpmn:sequenceFlow id=\"F2\" sourceRef=\"GW1\" targetRef=\"End1\">\n\
      <bpmn:conditionExpression><![CDATA[= count(validationErrors) = 0]]></bpmn:conditionExpression>\n\
    </bpmn:sequenceFlow>\n\
    <bpmn:sequenceFlow id=\"F3\" sourceRef=\"GW1\" targetRef=\"End2\"/>\n\
  </bpmn:process>\n\
</bpmn:definitions>";
        let processes = parse_bpmn(xml).unwrap();
        let flow_f2 = processes[0]
            .sequence_flows
            .iter()
            .find(|f| f.id == "F2")
            .unwrap();
        assert_eq!(
            flow_f2.condition_expression.as_deref(),
            Some("= count(validationErrors) = 0"),
            "CDATA condition expression must be read correctly"
        );
    }

    #[test]
    fn test_parse_timer_event() {
        let xml = r#"<?xml version="1.0"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <bpmn:process id="timer-process" isExecutable="true">
    <bpmn:startEvent id="TimerStart">
      <bpmn:outgoing>F1</bpmn:outgoing>
      <bpmn:timerEventDefinition>
        <bpmn:timeDuration>PT10M</bpmn:timeDuration>
      </bpmn:timerEventDefinition>
    </bpmn:startEvent>
    <bpmn:endEvent id="End"><bpmn:incoming>F1</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="F1" sourceRef="TimerStart" targetRef="End"/>
  </bpmn:process>
</bpmn:definitions>"#;
        let processes = parse_bpmn(xml).unwrap();
        let ev = processes[0].elements.get("TimerStart").unwrap();
        if let FlowElement::StartEvent(se) = ev {
            assert!(matches!(
                se.event_definition,
                Some(EventDefinition::Timer(_))
            ));
            if let Some(EventDefinition::Timer(t)) = &se.event_definition {
                assert_eq!(t.expression, "PT10M");
                assert_eq!(t.timer_type, TimerType::Duration);
            }
        } else {
            panic!("Expected StartEvent");
        }
    }

    #[test]
    fn test_message_correlation_keys() {
        // Event-level subscription before the definition; root-message subscription for the
        // receive task and the second catch event.
        let xml = r#"<?xml version="1.0"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">
  <bpmn:message id="M1" name="go"/>
  <bpmn:message id="M2" name="paid">
    <bpmn:extensionElements><zeebe:subscription correlationKey="=orderId"/></bpmn:extensionElements>
  </bpmn:message>
  <bpmn:process id="p" isExecutable="true">
    <bpmn:intermediateCatchEvent id="A">
      <bpmn:extensionElements><zeebe:subscription correlationKey="=key"/></bpmn:extensionElements>
      <bpmn:messageEventDefinition messageRef="M1"/>
    </bpmn:intermediateCatchEvent>
    <bpmn:intermediateCatchEvent id="B"><bpmn:messageEventDefinition messageRef="M2"/></bpmn:intermediateCatchEvent>
    <bpmn:receiveTask id="R" messageRef="M2"><bpmn:incoming>F</bpmn:incoming></bpmn:receiveTask>
  </bpmn:process>
</bpmn:definitions>"#;
        let processes = parse_bpmn(xml).unwrap();
        let key_of = |id: &str| match processes[0].elements.get(id).unwrap() {
            FlowElement::IntermediateCatchEvent(e) => match &e.event_definition {
                Some(EventDefinition::Message(m)) => {
                    (m.message_name.clone(), m.correlation_key.clone())
                }
                _ => panic!("expected a message definition on {id}"),
            },
            _ => panic!("expected a catch event {id}"),
        };
        assert_eq!(key_of("A"), ("go".to_string(), Some("=key".to_string())));
        assert_eq!(
            key_of("B"),
            ("paid".to_string(), Some("=orderId".to_string()))
        );
        if let FlowElement::ReceiveTask(r) = processes[0].elements.get("R").unwrap() {
            assert_eq!(r.message_name.as_deref(), Some("paid"));
            assert_eq!(r.correlation_key.as_deref(), Some("=orderId"));
        } else {
            panic!("expected a receive task");
        }
    }
}
