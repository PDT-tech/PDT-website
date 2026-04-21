# Investigate Before You Design
## A claude.ai + Claude Code Collaboration Pattern

**Version:** 1.0  
**Created:** 2026-04-21  
**Author:** Kevin Bier + claude.ai  
**Applies to:** Any project using claude.ai for design/planning + Claude Code (CC) for implementation

---

## The Problem This Solves

When redesigning or extending an existing feature, it's easy to spend significant
time in a design conversation reconstructing context that already exists in code.
This wastes tokens, wastes time, and — worse — creates real risk of designing
against an incorrect picture of what's actually built. The result is spec language
that conflicts with as-built behavior, CC prompts that ask for things already done
or that break things already working, and investigations that have to be repeated
at the start of every new session.

The root cause: claude.ai treats the as-built state as known when it is not.
Documentation is always behind the code. The code is the truth.

---

## The Pattern

### Rule Zero

**No design decisions before CC reports the as-built state.**  
**No CC implementation prompts before design decisions are documented.**

These two rules eliminate the entire class of problem.

---

### Step 1 — Recognize the Trigger

Apply this pattern whenever:

- A conversation turns toward redesigning, modifying, or extending an existing feature
- A new feature will touch existing tables, functions, or modules
- The phrase "I thought we already had..." or "isn't that already built?" appears
- claude.ai is about to ask a question that CC could answer by reading a file
- A previously specced but possibly-unimplemented feature is being discussed

When in doubt, investigate. The cost of an unnecessary investigation is low.
The cost of designing against wrong assumptions is high.

---

### Step 2 — Request a Structured Investigation from CC

Send CC this prompt, customized for the feature in question:

```
Before we design anything, I need a full as-built picture of 
[feature name]. Please report:

1. All files involved — HTML, JS, CSS, Edge Functions, SQL migrations
2. Database tables and columns used, including constraints and 
   allowed values on every column
3. Supabase Edge Functions involved — what each one does, what 
   payload it accepts, what emails/actions it triggers and under 
   what conditions
4. Any scheduled jobs (pg_cron or equivalent) — their schedule, 
   what they call, and deployment status (active vs. commented-out 
   placeholder)
5. How data is segmented or filtered in the JS (e.g. event type 
   splits, role checks, date filters)
6. What UI controls currently exist and how they behave
7. What is designed but not yet deployed — placeholders, commented 
   code, TODO comments, migration stubs
8. Any access control policies (RLS, role gates, auth guards) 
   relevant to this feature

Report findings before touching any code. Do not fix anything 
you notice along the way — report it.
```

Adapt the numbered items to the project's stack. The key categories are always:
files, schema, server-side logic, scheduled jobs, client-side logic, UI state,
undeployed work, and access control.

---

### Step 3 — Synthesize the Report

When CC responds, claude.ai's job is to produce a clear written summary of:

- **What exists and works** — the verified as-built baseline
- **What is designed but not deployed** — greenfield from a deployment standpoint
  even if code exists
- **What is genuinely new** — no code, no schema, no spec exists yet
- **What the design discussion needs to resolve** — the open questions, not the
  settled ones

This synthesis is what the design conversation is about. Not reconstructing the
baseline — that's CC's job. Not re-speccing what already works — that wastes
tokens. Only the delta.

---

### Step 4 — Design Against the Verified Baseline

With the synthesis in hand:

- Discuss only what needs to change or be added
- Make explicit decisions about behavior, not just features
- Capture edge cases and open questions before they become bugs
- Confirm the answers to any open questions before closing the design discussion

---

### Step 5 — Document Before Implementing

Before sending CC a single implementation prompt:

| What | Where |
|---|---|
| Settled architectural/design decisions | `decisions.md` (or equivalent) |
| Feature scope and behavioral spec | `requirements.md` (or equivalent) |
| Future work items with restart context | `issues.md` (or equivalent) |

**The restart context rule:** Every deferred work item must include enough
information for a future session to begin coding immediately without
investigation. Include: schema state, as-built function names, what exists
vs. what is greenfield, access control requirements, and any decisions
already made. Write it at the time you defer it — not later.

A well-written issue entry costs five minutes. Reconstructing it in a future
session costs thirty minutes and risks conflicting decisions.

---

### Step 6 — Write the CC Implementation Prompt

Only now does the implementation prompt get written. It should:

- Reference the spec documents rather than restating everything inline
- Specify exactly which files may be touched (and flag any others as requiring
  explicit justification in the commit message)
- State clearly what does NOT change — the backing logic, the schema, the
  functions that already work
- Include a testing checklist for the human to verify after the push
- Require a single atomic commit with a proper commit message

---

## Why This Order Matters

The temptation is to skip straight to design because the feature seems familiar.
That's exactly when the pattern matters most. Familiarity creates false confidence
about what's actually in the code.

The session that produced this pattern spent significant time:
- Asking CC questions mid-design-discussion that could have been front-loaded
- Discovering that a "new" escalation pipeline was actually already partially built
- Discovering that a "new" attendance report had already been built by CC
  opportunistically during the implementation

Front-loading the investigation eliminates all of this. The design conversation
becomes faster, more accurate, and produces better implementation prompts.

---

## Abbreviated Checklist

Before any redesign or extension discussion:

- [ ] Triggered the investigation — sent CC the structured report request
- [ ] Received CC's report and synthesized what exists vs. what is greenfield
- [ ] Design discussion happened against the verified baseline only
- [ ] All decisions documented before implementation prompt was written
- [ ] Deferred work items written with full restart context
- [ ] Implementation prompt specifies files in scope, files out of scope,
      what does not change, and testing checklist
- [ ] Single atomic commit requested

---

## Adapting to Other Stacks

The numbered investigation items in Step 2 are written for a
Supabase + Netlify + vanilla JS stack. Adapt them for your project:

| If your stack uses | Replace with |
|---|---|
| Supabase Edge Functions | Lambda functions, Cloud Functions, API routes |
| pg_cron | Cron jobs, scheduled tasks, workflow triggers |
| RLS policies | Middleware auth, API gateway rules, RBAC policies |
| SQL migrations | ORM migrations, schema files, seed scripts |
| Netlify env vars | Environment config, secrets manager, .env files |

The categories — files, schema, server logic, scheduled jobs, client logic,
UI state, undeployed work, access control — are universal.

---

*This pattern was developed during active feature work on pdtsingers.org,
April 2026. It applies to any project where a planning AI and a coding AI
collaborate across sessions with incomplete shared context.*
