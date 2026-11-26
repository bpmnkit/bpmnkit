#!/usr/bin/env python3
"""Offline test of a REST connector task in a .bpmn file.

  connector-test.py <file.bpmn> <connector-samples.json>

Each sample names a service task (`element`). The task's own zeebe:input mappings and task
headers become a one-off element template, a local server answers with the sample's `http` stub,
and the published CLI runs it: `bpmnkit connector test`. The stub's address is passed in the
variable named by `baseVar`, which the task's url mapping prefers over the real host.
`expect` is compared with the command JSON the CLI prints (`complete` compares variables).
"""
import http.server, json, subprocess, sys, tempfile, threading, urllib.parse, pathlib
import xml.etree.ElementTree as ET

NS = {"bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL", "zeebe": "http://camunda.org/schema/zeebe/1.0"}
BPMNKIT = "bpmnkit"


def template(bpmn: pathlib.Path, element: str) -> dict:
    task = ET.parse(bpmn).getroot().find(f".//bpmn:serviceTask[@id='{element}']", NS)
    if task is None:
        sys.exit(f"{bpmn}: no service task {element}")
    props = [{"type": "Hidden", "value": task.find(".//zeebe:taskDefinition", NS).get("type"),
              "binding": {"type": "zeebe:taskDefinition", "property": "type"}}]
    for i in task.iterfind(".//zeebe:input", NS):
        props.append({"type": "Hidden", "value": i.get("source"), "binding": {"type": "zeebe:input", "name": i.get("target")}})
    for h in task.iterfind(".//zeebe:header", NS):
        props.append({"type": "Hidden", "value": h.get("value"), "binding": {"type": "zeebe:taskHeader", "key": h.get("key")}})
    return {"$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
            "name": element, "id": f"playground.{element}", "version": 1, "appliesTo": ["bpmn:Task"],
            "elementType": {"value": "bpmn:ServiceTask"}, "properties": props}


def serve(stub: dict, seen: list):
    class H(http.server.BaseHTTPRequestHandler):
        def _answer(self):
            seen.append((self.command, urllib.parse.urlsplit(self.path).path, self.path))
            body = stub.get("body", "").encode()
            self.send_response(stub["status"])
            self.send_header("content-type", "application/json")
            self.send_header("content-length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        do_GET = do_POST = _answer
        def log_message(self, *a):
            pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def main() -> int:
    bpmn, samples = pathlib.Path(sys.argv[1]), json.loads(pathlib.Path(sys.argv[2]).read_text())
    failed = 0
    with tempfile.TemporaryDirectory() as tmp:
        for s in samples:
            seen: list = []
            srv = serve(s["http"], seen)
            t, v = pathlib.Path(tmp, "t.json"), pathlib.Path(tmp, "v.json")
            t.write_text(json.dumps(template(bpmn, s["element"])))
            v.write_text(json.dumps({**s["variables"], s["baseVar"]: f"http://127.0.0.1:{srv.server_port}"}))
            out = subprocess.run([BPMNKIT, "connector", "test", str(t), "--vars", str(v), "--retries", "1"],
                                 capture_output=True, text=True)
            srv.shutdown()
            problems = []
            try:
                got = json.loads(out.stdout)
            except json.JSONDecodeError:
                got, problems = None, [f"no JSON (exit {out.returncode}): {out.stdout}{out.stderr}".strip()]
            want = s["expect"]
            if got is not None:
                kind = next(iter(want))
                if kind not in got:
                    problems.append(f"want {kind}, got {json.dumps(got)}")
                elif kind == "complete" and got[kind].get("variables") != want[kind]["variables"]:
                    problems.append(f"variables {json.dumps(got[kind].get('variables'))}")
            m, path = s["http"]["method"], s["http"]["path"]
            if not seen or seen[0][:2] != (m, path):
                problems.append(f"want {m} {path}, server saw {seen}")
            print(("ok   " if not problems else "FAIL ") + s["name"] + (f" ({seen[0][2]})" if seen else ""))
            for p in problems:
                print("     " + p)
            failed += bool(problems)
    print(f"{len(samples) - failed}/{len(samples)} connector samples passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
