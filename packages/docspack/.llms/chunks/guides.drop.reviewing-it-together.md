# Drop — Share & Co-edit — Reviewing it together

Everything below happens on the share page itself — there is nothing to install on either
end.

**Live presence.** The topbar counts the people who have the drop open, and says when one
of them is editing. A diagram moving under a reader's eyes is only unsettling when nothing
on the page explains it.

**One writer at a time.** Editing is a baton, not a merge. Press **Edit** to claim it and
the diagram becomes editable for you and stays live for everyone else; press **Done** to
hand it back. A second person pressing Edit while you hold it is told who has it. There is
no conflict resolution because there is never a second writer to conflict with.

**No save button.** Changes persist as you make them, so there is no moment at which a
reviewer can lose work by closing the tab — and none at which they can be asked whether
they meant it. That is what makes the version log below load-bearing rather than a nicety.

**Asking the AI while you edit.** Where the deployment has AI changes on (a closed beta,
behind an access code), **Ask AI** opens a chat beside the editor. Say what to change — select
elements first to make the request about them — and the change is made in the editor with the
layout kept, as one edit that **Undo** reverts. A diagram drafted with *Describe a process* on
the Drop landing page has **Open in editor**: it is stored as a drop like a share link, and
opens straight into the editor with this chat, so you can keep refining it there.
*Describe a process* takes up to 2,000 characters. To paste a whole specification, open the
page with `?nolimit` (`/drop?nolimit`): the description then has no length limit. The daily
budget and the hourly cap still apply, and a description longer than the model's context
window fails with the model's error. With `?nolimit` the model also gets a larger output
budget and the description keeps its line breaks, so headings and lists reach it. If the answer
still hits the model's output limit, the page shows "The answer was cut off at the model's output
limit — the diagram may be incomplete." The connector step takes the long description too. The
readiness badge names the steps that keep a draft from running, including plain tasks. When
Camunda 8 would refuse the draft, the check under it shows the [deploy gate](/docs/guides/deploy-gate)'s
lines, and **Fill placeholders** writes the documented placeholder values (job types, message
names, correlation keys, timers) for you to replace later. **Share** is refused until the draft
deploys; **Open in editor** opens it as it is, to finish it there.
*Describe a process* can also draft on your device with Chrome's built-in model: open `/drop?ai=on-device`. See [On-device generation](/docs/guides/ai-on-device).

**Version history.** Every file keeps the original it was uploaded as, pinned and never
overwritten, plus its ten most recent milestones. Repeated saves inside an hour collapse
into one milestone, and a new editing session always starts its own, so a stranger editing
at 10:45 cannot overwrite the previous editor's 10:30 state. Restoring **appends**: the
state being replaced becomes a milestone first, so restoring can never be the thing that
loses work. Undoing a restore is another restore.

**Visual diff.** Two drops can be put side by side at `/drop/<before>/diff/<after>`: added,
removed, changed and *moved* elements marked on synchronised canvases, with pan and zoom
locked together. The same diff is available offline as
[`casen diff bpmn`](/docs/cli/diff) and as a plugin in `@bpmnkit/plugins`.

---
Source: https://bpmnkit.com/docs/guides/drop
