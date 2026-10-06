# Drop — Share & Co-edit — Reviewing it together (2)

**Who you are, without an account.** Your display name is whatever you type into the
comment box. The browser remembers it and shows it to the other people viewing the drop.
Nothing checks it, so two people can both call themselves Anna. Your first comment on a
drop gives your browser a private key for that drop, and the server stores only a hash
of it. That key is what lets you edit or delete **your own** comments, and nobody else's.
It lives in this browser only: clear the site data, or change browsers, and your earlier
comments can no longer be edited or deleted from there. A deleted comment that has replies
leaves a "Comment deleted" placeholder, so the replies still make sense.

Comments follow the same abuse rules as edits. Where the deployment configures Turnstile,
your first comment on a drop needs one challenge, and your later comments on it do not.
Each address can make 60 comment writes an hour. A drop holds at most 500 comments, and a
comment is at most 2,000 characters. A drop whose content is on the ban list takes no new
comments. The demo drop and drops an operator has pinned are read-only for comments as
well as for edits. Comments are deleted with their drop: when it expires, or when an
operator removes it.

Diagram editing is limited to BPMN files with a single process — the editor handles one
process at a time — and the built-in demo drop is read-only, though **Edit a copy** will
upload it as a drop of your own. A FEEL statement is edited differently and on its own
terms; see [trying it with your own numbers](#trying-it-with-your-own-numbers) above.

---
Source: https://bpmnkit.com/docs/guides/drop
