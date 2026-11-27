#!/usr/bin/env bash
# Offline: lint the process and run the forecast task's own mappings against samples.json stubs.
set -euo pipefail
cd "$(dirname "$0")"
bpmnkit lint frost.bpmn
python3 -I ../connector-test.py frost.bpmn samples.json
