// Dumps TS's process-text token helpers (tokenizePath, splitFeel, splitMappings, duration,
// edgeLabel, conditionOrLabel and the private line patterns) into pt_tokens.json.
// Run from the repo root: node crates/bpmnkit-text/tests/oracle/pt_tokens.mjs
import { writeFileSync } from "node:fs"
import { conformanceInputs, loadProcessText } from "./pt_load.mjs"

const m = await loadProcessText()
const nul = (v) => (v === undefined ? null : v)

// --- inputs -------------------------------------------------------------------------
const recorded = new Set()
for (const input of conformanceInputs()) {
	for (const line of input.split(/\r?\n/)) recorded.add(line.trim())
}
recorded.delete("")

const handwritten = [
	"a > b > c",
	"a->b-->c",
	"a ---> b",
	"start[start Order placed] > check[xor Amount over 1000?]",
	"check >(Yes: amount > 1000) review[user Review] > done[end Done]",
	"check >(No: default) auto[service Auto approve] > pay",
	"check > (No: default) decision",
	"gw >(No: default) > next",
	"gw >(Label: a > b and (c)) x",
	'gw >(Label: name = ")" ) x',
	"gw >(unclosed x",
	"1[service List runs] > 2[xor Any left?]",
	"1abc--> x",
	"1abc-- > x",
	"12 [start A] > 3",
	"1.5 > b",
	"call back[service Call back] > x",
	"call back  now  [service Call] > x",
	"a b c > d",
	"done-end [end Done]",
	"x > xor Notify sales? >(Yes: yes) y",
	"x > end Done",
	"x > end  > y",
	"x > end   Done   -->   y",
	"end of the answer > x",
	"x > task",
	"x > user Fix it (now) > y",
	"x > service Ünï cödé > y",
	"start[start HR) > next",
	"end[Page created",
	"end[Page created) > x",
	"end[Page created  --> x",
	"end[Page [created] ) > x",
	"end[ ] > x",
	"end[",
	"end[)",
	"a[task A (note)]   (ADDED)",
	"a[task A] (ADDED) > b",
	"a[task A] (ADDED",
	"a[task A] b",
	"a[task A] >",
	"a[task A] > ",
	"a > > b",
	"> a",
	"",
	"   ",
	"é > x",
	"a > é",
	"a[task 😀😀😀😀😀😀😀😀😀😀😀 long] x",
	"a 😀😀😀😀😀😀😀😀😀😀😀😀",
	"😀😀😀😀😀😀😀😀😀😀😀😀",
	"a[ task A ]\u00a0>\u00a0b",
	"a\u2003>\u2003b",
	"a[b[c]] > d",
	'a[task "x]y"] > b',
	'a[task "x] > b',
	"a[task A]b",
	"a [task A]",
	"a  [task A]",
	"a(label) > b",
	"constructor[task X] > toString Do it > valueOf",
	"a > toString Do it > b",
	"a > hasOwnProperty Run it >(x) b",
	"a > constructor stuff",
	"a > __proto__ stuff",
	"a > Constructor stuff",
	"start:message[x] > a:b",
	"a_b.c-d[task X] > e",
]

const attrs = [
	"",
	"feel=1+1",
	"result=x feel=count(items)",
	'| result=open feel=count(issues[state = "open"])',
	"feel=",
	"feel=   ",
	"feel==x + 1",
	"feel= = 3",
	"xfeel=3",
	" feel=3",
	",feel=3",
	"|feel=3",
	"\u00a0feel=3",
	"a=1\tfeel=a, b",
	"a feel=1 feel=2",
	"in.x=1",
	"in.x=a = 1 out.y=b, c | job=z",
	"job=a in.x=if a = 1 then 2 else 3 out.y=4 nonint",
	"out.a=1 out.b=2, in.c=3 |",
	"in.x= out.y=2",
	"in.x=1,out.y=2",
	"in.x=1 , | out.y=2",
	"xin.x=1",
	"in.=1",
	"in.1x=2",
	"in.a.b-c=2 d=3",
	"in.a=x\u00a0y=2",
	"in.ü=1",
	"IN.x=1",
	"in.x=1 in.x=2",
	"in.x=a==b c=d",
	" out.y=é, è | in.x=ü",
	"on=a | nonint",
]
for (const line of recorded) {
	const bar = line.indexOf("|")
	if (bar >= 0) attrs.push(line.slice(bar + 1), line.slice(bar), line.slice(0, bar))
}

const durations = [
	"PT5M",
	"pt5m",
	"P1D",
	"p1d",
	"P",
	"PT",
	"P 5 minutes",
	"P2W",
	"P1Y2M3DT4H5M6S",
	"PT1H30M",
	"P1DT",
	"5m",
	"5 min",
	"5 mins",
	"5 minutes",
	"5minutes",
	"2 hours",
	"2 hrs",
	"2 hr",
	"1 day",
	"3 days",
	"2 weeks",
	"1w",
	"10s",
	"10 sec",
	"10 secs",
	"10 seconds",
	"30 s",
	"Wait 5 minutes",
	"Wait for 05 minutes please",
	"5 minutesx",
	"5mx",
	"5 months",
	"5 M",
	"5 H",
	"5 D",
	"every 15m and PT1H",
	"Wait PT5M then 3 days",
	"5\u00a0min",
	"5\u3000min",
	"５ min",
	"no number",
	"",
	"a P1D",
	"aP1D",
	"P1D1",
	"p",
	"5 sec.",
	"1 d",
	"99999999999999999999 h",
	"PT5M30S",
	"P0D",
	"Timeout after 2 hrs",
	"Dm3",
]
for (const line of recorded) durations.push(line)

const labels = [
	undefined,
	"",
	"Yes",
	"default",
	"Default",
	" DEFAULT ",
	"Name: default",
	"Name: Default",
	"Name:",
	": x",
	":",
	"Yes: amount > 1000",
	'Name: status = "ok"',
	"Name: = a",
	"Name: =",
	"No: is not approved",
	"Yes: a: b",
	"A: default: x",
	"  Spaced  :  a > 1  ",
	"Ünï: é > 1",
	"x: a ::",
	"x: 1 +",
	"x: )",
	"x: [1,2",
	"Over limit: amount > 10 and",
	"Large: order total > 100",
	"Yes: if a then b else c",
	"Yes: some x in xs satisfies x > 1",
	"Approved: true",
	"Rejected: not(approved)",
	"x: a = = b",
	"x: \u00a0default\u00a0",
	"Name: DeFaUlT",
	"İ: x",
]
for (const line of recorded) {
	for (const lab of line.matchAll(/\(([^()]*)\)/g)) labels.push(lab[1])
}

const wordsOf = new Set()
const ids = new Set([
	"constructor",
	"toString",
	"__proto__",
	"sendEmail",
	"send_email",
	"check-order.v2",
])
const names = new Set()
for (const line of recorded) {
	for (const w of line.split(/[^A-Za-z0-9_.\-]+/)) if (w) wordsOf.add(w)
	const t = m.tokenizePath(line)
	if ("refs" in t) {
		for (const r of t.refs) {
			ids.add(r.id)
			if (r.spec) names.add(r.spec.replace(/^\S+\s*/, ""))
		}
	}
}

// --- dump ---------------------------------------------------------------------------
const tokens = (t) =>
	"error" in t
		? { error: t.error }
		: {
				refs: t.refs.map((r) => ({ id: r.id, spec: nul(r.spec) })),
				labels: t.labels.map(nul),
				note: nul(t.note),
				joined: t.joined ?? [],
				unclosed: t.unclosed ?? [],
				bracketless: t.bracketless ?? [],
			}
const edge = (e) => ({
	name: nul(e.name),
	condition: nul(e.condition),
	isDefault: nul(e.isDefault),
})

const lines = [...new Set([...handwritten, ...recorded])]
// Cut every line short at a few places: unclosed brackets and labels, half-typed arrows.
const cut = []
for (const line of recorded) {
	for (let k = 3; k < line.length; k += 7) cut.push(line.slice(0, k))
}
const pathInputs = [...new Set([...lines, ...cut])]

const out = {}
out.tokenize = pathInputs.map((text) => [text, tokens(m.tokenizePath(text))])
out.splitFeel = [...new Set(attrs)].map((a) => {
	const r = m.splitFeel(a)
	return [a, { plain: r.plain, feel: nul(r.feel) }]
})
out.splitMappings = [...new Set(attrs)].map((a) => [a, m.splitMappings(a)])
out.duration = [...new Set(durations)].map((d) => [d, nul(m.duration(d))])
const labelList = [...new Set(labels)]
out.edgeLabel = labelList.map((l) => [nul(l), edge(m.edgeLabel(l))])
const edges = labelList.map((l) => m.edgeLabel(l))
edges.push(
	{ name: "Big", condition: "= order total > 100" },
	{ name: "", condition: "= is not approved" },
	{ condition: "=", isDefault: true },
	{ name: "x", isDefault: true, condition: "= a b" },
	{ condition: "= \u00a0 " },
	{ condition: "== 1" },
	{ condition: "= a = " },
)
out.conditionOrLabel = edges.map((e) => {
	const r = m.conditionOrLabel(e)
	return [edge(e), { edge: edge(r.edge), problem: nul(r.problem) }]
})
out.noteDoc = lines
	.concat([
		"note a: x",
		"NOTE a:x",
		"Note  a1 :   text  ",
		"note a: x\ny",
		"note a:\nx",
		"note a b: x",
		"note:x",
		"notea: x",
		"doc a: Returns users",
		"DOC x.y-z : é",
		"doc a: x\u2028y",
		"doc _: ",
		"docs a: x",
		"note\u00a0a: x",
		"note a : :: ",
	])
	.map((t) => {
		const n = m.NOTE_LINE.exec(t)
		const d = m.DOC_LINE.exec(t)
		return [t, n ? [n[1], n[2]] : null, d ? [d[1], d[2]] : null]
	})
const segments = [
	"camunda=8.10",
	" camunda=8.10 ",
	"camunda=8.10, camunda=8.11",
	"camunda=",
	"camunda=1camunda=2",
	"",
	" ",
	",",
	" , camunda=x , ",
	"camunda=8.10 x",
	"Camunda=8.10",
	"camunda=8|1",
	"camunda=a b",
	"camunda=a,b",
	"\u00a0camunda=1\u00a0",
	"payment flow",
	" Payment ",
	"camunda 8.10",
	"x camunda=8",
]
out.header = segments.map((s) => [s, m.HEADER_SEGMENT.test(s)])
out.dangling = lines
	.concat([
		"a >",
		"a ->",
		"a -->",
		"a --->",
		"a > (x)",
		"a >(x)  ",
		"a >(x(y))",
		"a >(x) b",
		"a > ( )",
		"a >\n",
		" > ",
		">",
		"a >(x) >",
		"a > b >",
		"a -> (No: default)",
		"a >(No: default) >",
		"a>>",
		"x > (a > b)",
		"x > (a > b) ",
		"x - >",
		"x -  >",
		"x \u00a0>\u00a0",
		"é >",
		"é > (ü)",
	])
	.map((t) => [t, m.DANGLING.test(t), t.replace(m.DANGLING, "")])
// `matching` takes UTF-16 indices: only ASCII lines, where they equal byte offsets.
out.matching = []
for (const text of lines) {
	if (!/^[\x00-\x7f]*$/.test(text)) continue
	for (let i = 0; i < text.length; i++) {
		const open = text[i] === "[" ? ["[", "]"] : text[i] === "(" ? ["(", ")"] : null
		if (open) out.matching.push([text, i, open[0], open[1], m.matching(text, i, open[0], open[1])])
	}
}
out.matching.push(
	['a["]"]b', 1, "[", "]", m.matching('a["]"]b', 1, "[", "]")],
	["((", 0, "(", ")", -1],
)
const elements = [...ids]
	.flatMap((id) => [{ id }])
	.concat(
		[...names].flatMap((name) => [{ id: "x", name }]),
		[
			{ id: "x", name: "Handle failure" },
			{ id: "retry_payment" },
			{ id: "x", name: "roll back" },
			{ id: "x", name: "rollback" },
			{ id: "x", name: "roll\u00a0back" },
			{ id: "x", name: "Timed out" },
			{ id: "x", name: "timed\u00a0out" },
			{ id: "x", name: "Too late!" },
			{ id: "x", name: "latest" },
			{ id: "x", name: "Retries" },
			{ id: "x", name: "ERRORS happened" },
			{ id: "x", name: "ÉRROR" },
			{ id: "x", name: "Fail\u212a" },
			{ id: "on-error.handler" },
			{ id: "ok", name: "Alert ops" },
			{ id: "ok", name: "Notify" },
			{ id: "ok", name: "unnotified" },
			{ id: "ok", name: "cancelled order" },
			{ id: "reject.order" },
		],
	)
out.handles = elements.map((e) => [e, m.handles(e)])
out.handlesNone = m.handles(undefined)
const idList = [
	...new Set([
		...ids,
		...wordsOf,
		"AND",
		"And",
		"Xor",
		"Or",
		"eventgw",
		"EventGW",
		"start",
		"Start_1",
		"startX",
		"END",
		"ending",
		"Done",
		"doneish",
		"finish_it",
		"FinishLine",
		"parallel",
		"Exclusive",
		"gateway",
		"decision",
		"event",
		"human",
		"catch",
		"task",
		"TASK",
		"x",
		"İstart",
		"ſtart",
		"Kstart",
		"hasOwnProperty",
		"__proto__",
	]),
]
out.typeFromId = idList.map((id) => [id, m.typeFromId(id)])
out.nameFromId = [
	...new Set([
		...idList,
		"",
		"_",
		"__a__",
		"a__b",
		"sendEmail",
		"SendEmail",
		"send_email",
		"HTTPRequest",
		"aB",
		"a1B",
		"aBC",
		"abcDef9Ghi",
		"x.y-z",
		"-lead",
		"trail-",
		"ünï_cödé",
		"über",
		"ßtart",
		"ǆx",
		"😀 x",
		"😀_x",
		"ŉx",
		"İx",
		"ΑΣ",
		"ΑΣ_Σ",
		"\u00a0x",
	]),
].map((id) => [id, m.nameFromId(id)])
const collections = [
	"recipients",
	"categories",
	"ies",
	"ries",
	"cies",
	"items",
	"class",
	"boss",
	"gas",
	"is",
	"as",
	"us",
	"ss",
	"abs",
	"x",
	"",
	"1abc",
	"a-b",
	"a.b",
	"order items",
	"_s",
	"_ies",
	"Stories",
	"cats\n",
	"ünï",
	"list",
	"boxes",
	"a1s",
	"a1",
]
out.itemOf = collections.map((c) => [c, m.itemOf(c)])
const lists = [[], ["a"], ["a", "b"], ["a", "b", "c"], ["a", "b", "c", "d"], [""], ["", ""], ["x"]]
out.listOf = lists.map((l) => [l, m.listOf(l)])
const texts = [
	...new Set([
		...names,
		"Status approved?",
		"statusApproved",
		"Order total > 100",
		"1st place",
		"",
		"?",
		"__",
		"_x_",
		"HTTP Request",
		"aB cD",
		"A1B2",
		"ünï cödé",
		"x-y_z",
		"Is it ok?",
		"9 lives",
		"ABC",
		"camelCaseWord",
		"a1B",
		"über cool",
		"😀 ok",
		"a😀b",
		" lead",
		"trail ",
	]),
]
out.variableFrom = texts.map((t) => [t, m.variableFrom(t)])
const branch = [
	"No",
	"no",
	"Not approved",
	"NOT",
	"nothing",
	"Else",
	"else if",
	"Otherwise",
	"Default",
	"False",
	"false",
	"Reject",
	"Rejected",
	"rejection",
	"Fail",
	"Failed",
	"failure",
	"Failures",
	"Invalid",
	"invalid!",
	"Denied",
	"Declined",
	"decline",
	"Yes",
	"",
	" no",
	"no-way",
	"no_way",
	"nó",
	"no\u00a0x",
	"Noé",
	"none",
	"nope",
	"N/A",
	"KO",
]
out.otherwise = branch.map((l) => [l, m.OTHERWISE.test(l)])

writeFileSync(new URL("./pt_tokens.json", import.meta.url), `${JSON.stringify(out)}\n`)
