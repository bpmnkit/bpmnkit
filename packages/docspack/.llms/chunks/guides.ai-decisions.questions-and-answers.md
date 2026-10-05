# AI Decisions — Questions and answers

Each question has a `type` and `instructions`. Answers come back under the same ids. With the
default result expression, the answer to question `team` is in `clef.team`.

| Type | `criteria` | Answer |
|---|---|---|
| `noul` (yes/no) | Optional `{"true": …, "false": …}` | `noul`: probability of yes, 0 to 1 |
| `choice` | Required. Context of 2 to 255 options: id → description | `choice`: the option id. `probabilities` per option. `confidence`. |
| `score` | Required. List of 2 to 10 levels, lowest first | `score`: probability-weighted level from 0, can fall between levels. `legend`, `probabilities`, `confidence`. |

```feel
={
  "urgent": {"type": "noul", "instructions": "Is this support request urgent?"},
  "team": {
    "type": "choice",
    "instructions": "Which team should handle this request?",
    "criteria": {
      "billing": "Payments, invoices and refunds",
      "technical": "Outages, errors and configuration",
      "sales": "Plans and upgrades"
    }
  },
  "severity": {
    "type": "score",
    "instructions": "How severe is the customer impact?",
    "criteria": ["No impact", "Minor", "Major", "Critical"]
  }
}
```

The answers for these questions look like this:

```json
{
  "urgent": { "type": "noul", "noul": 0.94 },
  "team": {
    "type": "choice",
    "choice": "technical",
    "probabilities": { "billing": 0.06, "technical": 0.91, "sales": 0.03 },
    "confidence": 0.88
  },
  "severity": {
    "type": "score",
    "score": 2.7,
    "legend": { "0": "No impact", "1": "Minor", "2": "Major", "3": "Critical" },
    "probabilities": { "0": 0.01, "1": 0.04, "2": 0.2, "3": 0.75 },
    "confidence": 0.71
  }
}
```

---
Source: https://bpmnkit.com/docs/guides/ai-decisions
