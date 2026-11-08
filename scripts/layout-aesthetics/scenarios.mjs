/**
 * Ten typical new-diagram processes (no DI) for the layout aesthetics benchmark.
 * Each node is `[id, type, name]` (boundary: `[id, "boundaryEvent", name, host, def, cancel]`);
 * each flow is `[source, target, name?]`. Element order mirrors how a model writes XML.
 */

const NS =
	'xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI"'

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")

function processXml(id, { nodes, flows, lanes }) {
	const out = []
	const inc = new Map()
	const outg = new Map()
	flows.forEach(([s, t], i) => {
		const fid = `f${id}_${i}`
		;(outg.get(s) ?? outg.set(s, []).get(s)).push(fid)
		;(inc.get(t) ?? inc.set(t, []).get(t)).push(fid)
	})
	out.push(`<process id="${id}" isExecutable="true">`)
	if (lanes) {
		out.push("<laneSet>")
		for (const [lid, name, refs] of lanes) {
			out.push(`<lane id="${lid}" name="${esc(name)}">`)
			for (const r of refs) out.push(`<flowNodeRef>${r}</flowNodeRef>`)
			out.push("</lane>")
		}
		out.push("</laneSet>")
	}
	const emit = (list) => {
		for (const n of list) {
			const [nid, type, name, host, def, cancel] = n
			const attrs = [`id="${nid}"`]
			if (name) attrs.push(`name="${esc(name)}"`)
			if (type === "boundaryEvent") {
				attrs.push(`attachedToRef="${host}"`)
				if (cancel === false) attrs.push('cancelActivity="false"')
			}
			const body = []
			for (const f of inc.get(nid) ?? []) body.push(`<incoming>${f}</incoming>`)
			for (const f of outg.get(nid) ?? []) body.push(`<outgoing>${f}</outgoing>`)
			if (def) body.push(`<${def}EventDefinition/>`)
			if (type === "subProcess") {
				out.push(`<subProcess ${attrs.join(" ")}>${body.join("")}`)
				emit(n[3].nodes)
				n[3].flows.forEach(([s, t, nm], i) => {
					out.push(
						`<sequenceFlow id="f${nid}_${i}" sourceRef="${s}" targetRef="${t}"${nm ? ` name="${esc(nm)}"` : ""}/>`,
					)
				})
				out.push("</subProcess>")
				continue
			}
			out.push(`<${type} ${attrs.join(" ")}>${body.join("")}</${type}>`)
		}
	}
	emit(nodes)
	flows.forEach(([s, t, nm], i) => {
		out.push(
			`<sequenceFlow id="f${id}_${i}" sourceRef="${s}" targetRef="${t}"${nm ? ` name="${esc(nm)}"` : ""}/>`,
		)
	})
	out.push("</process>")
	return out.join("\n")
}

function wrap(body, collab = "") {
	return `<?xml version="1.0" encoding="UTF-8"?>\n<definitions ${NS} id="defs" targetNamespace="http://bpmn.io/schema/bpmn">\n${collab}${body}\n</definitions>\n`
}

const single = (spec) => wrap(processXml("Process_1", spec))

export const SCENARIOS = {
	"S01-linear": single({
		nodes: [
			["start", "startEvent", "Request received"],
			["validate", "serviceTask", "Validate request"],
			["enrich", "serviceTask", "Enrich customer data"],
			["approve", "userTask", "Approve request"],
			["notify", "sendTask", "Notify requester"],
			["end", "endEvent", "Request handled"],
		],
		flows: [
			["start", "validate"],
			["validate", "enrich"],
			["enrich", "approve"],
			["approve", "notify"],
			["notify", "end"],
		],
	}),
	"S02-xor-split-join": single({
		nodes: [
			["start", "startEvent", "Claim submitted"],
			["assess", "userTask", "Assess claim"],
			["gw", "exclusiveGateway", "Claim amount?"],
			["auto", "serviceTask", "Auto-approve"],
			["review", "userTask", "Manual review"],
			["reject", "serviceTask", "Reject claim"],
			["join", "exclusiveGateway", ""],
			["pay", "serviceTask", "Notify claimant"],
			["end", "endEvent", "Claim closed"],
		],
		flows: [
			["start", "assess"],
			["assess", "gw"],
			["gw", "auto", "< 1000"],
			["gw", "review", ">= 1000"],
			["gw", "reject", "invalid"],
			["auto", "join"],
			["review", "join"],
			["reject", "join"],
			["join", "pay"],
			["pay", "end"],
		],
	}),
	"S03-parallel": single({
		nodes: [
			["start", "startEvent", "Order paid"],
			["fork", "parallelGateway", ""],
			["pick", "userTask", "Pick items"],
			["invoice", "serviceTask", "Create invoice"],
			["label", "serviceTask", "Print shipping label"],
			["sync", "parallelGateway", ""],
			["ship", "userTask", "Ship parcel"],
			["end", "endEvent", "Order shipped"],
		],
		flows: [
			["start", "fork"],
			["fork", "pick"],
			["fork", "invoice"],
			["fork", "label"],
			["pick", "sync"],
			["invoice", "sync"],
			["label", "sync"],
			["sync", "ship"],
			["ship", "end"],
		],
	}),
	"S04-order-process": single({
		nodes: [
			["start", "startEvent", "Order received"],
			["check", "serviceTask", "Check stock"],
			["inStock", "exclusiveGateway", "In stock?"],
			["reserve", "serviceTask", "Reserve items"],
			["backorder", "userTask", "Order from supplier"],
			["payment", "serviceTask", "Charge payment"],
			["paid", "exclusiveGateway", "Payment ok?"],
			["ship", "serviceTask", "Ship order"],
			["cancel", "serviceTask", "Cancel order"],
			["endOk", "endEvent", "Order completed"],
			["endFail", "endEvent", "Order cancelled"],
		],
		flows: [
			["start", "check"],
			["check", "inStock"],
			["inStock", "reserve", "yes"],
			["inStock", "backorder", "no"],
			["backorder", "reserve"],
			["reserve", "payment"],
			["payment", "paid"],
			["paid", "ship", "yes"],
			["paid", "cancel", "no"],
			["ship", "endOk"],
			["cancel", "endFail"],
		],
	}),
	"S05-loop-back": single({
		nodes: [
			["start", "startEvent", "Draft created"],
			["write", "userTask", "Write article"],
			["review", "userTask", "Review article"],
			["ok", "exclusiveGateway", "Approved?"],
			["publish", "serviceTask", "Publish article"],
			["end", "endEvent", "Published"],
		],
		flows: [
			["start", "write"],
			["write", "review"],
			["review", "ok"],
			["ok", "publish", "yes"],
			["ok", "write", "no"],
			["publish", "end"],
		],
	}),
	"S06-boundary-events": single({
		nodes: [
			["start", "startEvent", "Payment requested"],
			["charge", "serviceTask", "Charge card"],
			["confirm", "userTask", "Confirm payment"],
			["end", "endEvent", "Payment done"],
			["err", "boundaryEvent", "Card declined", "charge", "error"],
			["refund", "serviceTask", "Notify customer"],
			["endErr", "endEvent", "Payment failed"],
			["timer", "boundaryEvent", "24h", "confirm", "timer", false],
			["remind", "sendTask", "Send reminder"],
			["endRemind", "endEvent", "Reminder sent"],
		],
		flows: [
			["start", "charge"],
			["charge", "confirm"],
			["confirm", "end"],
			["err", "refund"],
			["refund", "endErr"],
			["timer", "remind"],
			["remind", "endRemind"],
		],
	}),
	"S07-subprocess": single({
		nodes: [
			["start", "startEvent", "Application received"],
			[
				"screen",
				"subProcess",
				"Screen applicant",
				{
					nodes: [
						["sStart", "startEvent", ""],
						["cv", "userTask", "Review CV"],
						["call", "userTask", "Phone screen"],
						["sEnd", "endEvent", ""],
					],
					flows: [
						["sStart", "cv"],
						["cv", "call"],
						["call", "sEnd"],
					],
				},
			],
			["decide", "exclusiveGateway", "Hire?"],
			["offer", "sendTask", "Send offer"],
			["decline", "sendTask", "Send rejection"],
			["endHired", "endEvent", "Offer sent"],
			["endRejected", "endEvent", "Rejected"],
		],
		flows: [
			["start", "screen"],
			["screen", "decide"],
			["decide", "offer", "yes"],
			["decide", "decline", "no"],
			["offer", "endHired"],
			["decline", "endRejected"],
		],
	}),
	"S08-lanes": wrap(
		processXml("Process_1", {
			lanes: [
				["laneCustomer", "Customer", ["start", "submit", "endOk", "endRej"]],
				["laneSales", "Sales", ["qualify", "gw", "quote"]],
				["laneFinance", "Finance", ["credit", "approve"]],
			],
			nodes: [
				["start", "startEvent", "Need identified"],
				["submit", "userTask", "Submit inquiry"],
				["qualify", "userTask", "Qualify lead"],
				["gw", "exclusiveGateway", "Qualified?"],
				["credit", "serviceTask", "Check credit"],
				["approve", "userTask", "Approve terms"],
				["quote", "sendTask", "Send quote"],
				["endOk", "endEvent", "Quote received"],
				["endRej", "endEvent", "Inquiry declined"],
			],
			flows: [
				["start", "submit"],
				["submit", "qualify"],
				["qualify", "gw"],
				["gw", "credit", "yes"],
				["gw", "endRej", "no"],
				["credit", "approve"],
				["approve", "quote"],
				["quote", "endOk"],
			],
		}),
		'<collaboration id="Collab_1"><participant id="P_1" name="Sales process" processRef="Process_1"/></collaboration>\n',
	),
	"S09-collaboration": wrap(
		`${processXml("Process_Customer", {
			nodes: [
				["cStart", "startEvent", "Hungry"],
				["cOrder", "sendTask", "Place order"],
				["cWait", "intermediateCatchEvent", "Pizza delivered", null, "message"],
				["cPay", "sendTask", "Pay pizza"],
				["cEnd", "endEvent", "Hunger satisfied"],
			],
			flows: [
				["cStart", "cOrder"],
				["cOrder", "cWait"],
				["cWait", "cPay"],
				["cPay", "cEnd"],
			],
		})}\n${processXml("Process_Shop", {
			nodes: [
				["sStart", "startEvent", "Order received", null, "message"],
				["sBake", "userTask", "Bake pizza"],
				["sDeliver", "sendTask", "Deliver pizza"],
				["sPaid", "receiveTask", "Receive payment"],
				["sEnd", "endEvent", "Order done"],
			],
			flows: [
				["sStart", "sBake"],
				["sBake", "sDeliver"],
				["sDeliver", "sPaid"],
				["sPaid", "sEnd"],
			],
		})}`,
		`<collaboration id="Collab_1">
<participant id="P_Customer" name="Customer" processRef="Process_Customer"/>
<participant id="P_Shop" name="Pizza shop" processRef="Process_Shop"/>
<messageFlow id="m1" name="order" sourceRef="cOrder" targetRef="sStart"/>
<messageFlow id="m2" name="pizza" sourceRef="sDeliver" targetRef="cWait"/>
<messageFlow id="m3" name="money" sourceRef="cPay" targetRef="sPaid"/>
</collaboration>\n`,
	),
	"S10-mixed": single({
		nodes: [
			["start", "startEvent", "Ticket opened"],
			["triage", "userTask", "Triage ticket"],
			["sev", "exclusiveGateway", "Severity?"],
			["fix", "userTask", "Fix issue"],
			["escalate", "userTask", "Escalate to L2"],
			["merge", "exclusiveGateway", ""],
			["verify", "userTask", "Verify fix"],
			["works", "exclusiveGateway", "Resolved?"],
			["close", "serviceTask", "Close ticket"],
			["end", "endEvent", "Ticket closed"],
			["sla", "boundaryEvent", "SLA 4h", "fix", "timer", false],
			["page", "sendTask", "Page on-call"],
			["endPage", "endEvent", ""],
		],
		flows: [
			["start", "triage"],
			["triage", "sev"],
			["sev", "fix", "normal"],
			["sev", "escalate", "critical"],
			["fix", "merge"],
			["escalate", "merge"],
			["merge", "verify"],
			["verify", "works"],
			["works", "close", "yes"],
			["works", "triage", "no"],
			["close", "end"],
			["sla", "page"],
			["page", "endPage"],
		],
	}),
}
