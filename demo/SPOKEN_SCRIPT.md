# Orbyte — Spoken Introduction (about 8 minutes)

*Everything outside square brackets is meant to be said out loud. The brackets are stage directions.*

---

## Opening — 45 seconds

**[Stand on the 3D campus. Hands off the mouse.]**

"Hi everyone. This is Orbyte.

Let me start with the problem, because the problem is really simple. If you run a small business, you don't usually lose money because customers refuse to pay. You lose money because nobody follows up. The invoice goes out, the due date passes, someone says 'yeah, we'll pay next week,' and then everybody forgets. Three weeks later you're still chasing money you should have collected a month ago.

So Orbyte is the agent that remembers. It takes an invoice, watches the due date, reads the customer's reply, drafts the follow-up, matches the payment when it arrives, and stops for a human whenever the amount is too big or the facts don't quite line up."

---

## The campus — 1 minute

**[Drag once to orbit, then press W for a second so the avatar walks.]**

"Now, you're probably wondering why this looks like a park.

This whole campus is real 3D running in your browser — WebGL, built with React Three Fiber. It's not a video, and it's not a screenshot. The ring building is modelled on Apple Park, and the seven people sitting inside it are our seven agents. Each one has a desk, a monitor in their department colour, and a floating name tag.

You can walk around. W, A, S, D, or the arrow keys. Hold Shift to run. And when you get close to an agent, the screen gives you a prompt — press E, and you can talk to them."

**[Walk to Payment Monitoring. Press E. The card opens.]**

"See? This is Agent 2. Click 'Open Staff Dashboard' and you're inside her workspace."

**[Open the dashboard, then go back to campus.]**

"The point of this is not to be cute. It's wayfinding. In a normal dashboard you click through a menu and hope you remember where things are. Here, the company has a physical layout, and you navigate it the way you'd walk through an office."

---

## Agent 1 — the invoice — 1 minute 30

**[Click Upload Bill. Pick INV-2026-8802.pdf.]**

"Okay. Let's do some actual work.

I'm uploading a real PDF invoice. Watch what happens on the left — that's the raw text the system pulled out of the document. And on the right, that's the structured invoice it built from it.

The client is Straits Marine Supply, the total is two thousand three hundred and fifty dollars, and the confidence is ninety-eight and a half percent.

Here's the important part. The extraction is not just 'the AI read it.' The line items have to add up to the printed total, within one dollar. If they don't, the invoice does not get accepted — it goes to data review with the discrepancy written down. That's a deterministic check. The model doesn't get to decide that it looks fine.

And this invoice is now in the ledger, with an audit entry that says exactly when it arrived and how it was read."

---

## The executive view — 30 seconds

**[Open Executive Receivables Overview.]**

"This is the bird's-eye view. Every agent writes to one ledger, and this is it. Total outstanding, overdue accounts, settled accounts, and the state of every single invoice.

One thing I want to point out — the RunPod pill says 'Local, not linked.' That's on purpose. We built the hosted GPU worker and the client for it, but we haven't provisioned an endpoint, so the app uses its local engines and tells you so. It doesn't pretend a model is connected."

---

## Agent 2 and 3 — the decision — 1 minute 15

**[Open Agent 2.]**

"Agent 2 is the clock. Every day it checks the due date against today, sorts accounts into overdue, upcoming and paid, and respects quiet hours, so nobody gets chased at two in the morning."

**[Open Agent 3. Click the Billing Dispute chip.]**

"Agent 3 is Laya. She reads the customer's reply and scores it across six possible meanings — payment promise, already paid, dispute, extension request, unclear, or other. And here's the design decision: she only acts if the confidence is above zero point seven five.

This message is a dispute, and she's ninety-four percent confident. So the route is a human finance officer, not an automated reminder. And if I click the ambiguous one — 'hello, noted, ok' — confidence drops to forty-one percent, and the system escalates to a human instead of guessing. That's the entire philosophy in one screen: when in doubt, don't act."

---

## Agent 4 and 5 — the conflict and the draft — 1 minute 15

**[Open Agent 4. Keep the first conversation selected.]**

"This is my favourite screen. The customer says, 'We'll wire the money next Tuesday, the twelfth of November.'

There's a problem. The twelfth of November twenty twenty-six is a Thursday. The customer said Tuesday.

So the system flags the conflict, shows both statements with their sources, pauses the reminder, and asks a human to confirm the date. It does not quietly fix the date for the customer, and it does not schedule a chase against a date it can't trust.

**[Click the Billing Dispute conversation.]**

"Same pipeline, different outcome. A dispute freezes collection and opens a resolution task. A clean promise pauses reminders. One agent, three completely different behaviours, all driven by the facts."

**[Open Agent 5.]**

"Agent 5 writes the follow-up. Tone moves from friendly to formal to urgent as the invoice gets older, and you can choose email, WhatsApp or SMS. But look at the governance rule at the bottom — anything above four thousand dollars needs a human before it goes out. That's not a warning message. That's enforced in the backend."

---

## Agent 6 — reconciliation — 30 seconds

**[Open Agent 6.]**

"Agent 6 matches bank payments to invoices. It looks for the invoice number in the payment reference and checks the amount against the open balance: full match closes the invoice, a smaller amount is applied as a partial payment, a larger amount goes to a human as an exception.

If there's no reference, it tries the sender's name — but only if exactly one invoice fits. If nothing fits, the money sits in a suspense hold instead of being guessed onto a customer.

And the matcher is deterministic. No model writes to this ledger."

**[Point at the three rows: full match, partial, suspense.]**

---

## Agent 7 — the proof — 50 seconds

**[Open Agent 7. Don't click Approve or Reject — those only change the card locally.]**

"Agent 7 runs the whole company in one request. Eight stages, all live.

The stage that matters is six. A four-thousand-eight-hundred-and-fifty-dollar invoice comes through, a follow-up is drafted, and the send is blocked because the balance is over four thousand dollars. That block is an if-statement in the backend. The model can't argue with it.

Then stage seven matches a twenty-five-hundred-dollar payment and the balance drops to two thousand three hundred and fifty. Stage eight re-syncs the ledger, so future reminders can only quote the new number.

Eight out of eight. There's also a date-conflict checkbox — tick it and stage four catches a customer saying Tuesday for a Thursday."

**[Optional: tick the box and run again. Untick afterwards.]**

---

## Close — 30 seconds

"So, to wrap up. Orbyte is not a chatbot that sends emails. It's a receivables workflow with an audit trail you can defend: one ledger, seven agents, a human gate above four thousand dollars, and a 3D campus that makes the whole thing understandable at a glance.

The website is live at orbyte-0dw7.onrender.com, and the code is on GitHub under UMvengers-Orbyte. Thank you."

---

## Honesty note — say this if a judge asks

"Some of the screens — Agents 2, 3, 4, 5 and 6 — are showing prepared datasets so the walkthrough stays quick, and the approval cards on Agent 7 are illustrative. The engines behind them are real, and you can watch those same engines run live in the acceptance test. What's live right now is Agent 1's upload, the executive ledger, and the acceptance test itself."

## Short answers for Q&A

- **"Is the 3D a video?"** "No, it's a live WebGL canvas. You can walk around and click the agents."
- **"Do the agents use AI?"** "Agent 4 and 5 can call a hosted model, but the model's output is treated as an untrusted draft and re-checked against deterministic facts. The gate, the ledger and the date check are plain code."
- **"What if the model is wrong?"** "It can't send anything. The date check, the injection screen and the four-thousand-dollar gate are all deterministic, and the model can't clear a block."
- **"Is the audit trail tamper-proof?"** "It's append-only, and every write carries an idempotency key, the actor, the state change and the amounts. It is not a cryptographic hash chain — that's a real gap and a next step, not something I'll claim today."
- **"Why isn't RunPod connected?"** "The worker and client are built, but we haven't provisioned an endpoint, so the app runs local and says so."
- **"Does the data survive a restart?"** "The demo store reseeds when the server restarts. Uploaded invoices live in the ledger for the current session."
