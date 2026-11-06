# MKB AI Studio — approved API Inbox pilot harness
Status: **developer prototype** — not a commercial GPT configuration, customer integration, legal agreement, or production deployment.

This is an executable Node.js 22+ proof of concept for **draft-only** processing of a **fixed synthetic sample**, so we can test the end-to-end API boundary without exposing client data or private commercial configurations.

## Run without cost or network
From the repository root:
```bash
node ventures/mkb-ai-studio/api-pilot/run.cjs
node tests/test-mkb-ai-api-pilot.js
```
The first command defaults to dry-run. Neither command sends a provider request (tests use a mocked network client).

## Optional live test — customer-controlled API account only
Only once the operator has approved the exact synthetic file, the provider's processing terms, cost and selected model:
```bash
export OPENAI_MODEL="your-authorized-model-id"
export OPENAI_API_KEY="set-locally-not-in-source-control"
export AI_STUDIO_APPROVED_DATA=yes
node ventures/mkb-ai-studio/api-pilot/run.cjs --live
```
Never run this on a shared machine; do not paste an API key into ChatGPT, git, issue trackers or an HTML page. **This is not part of a ChatGPT Business subscription**: API usage is separately billed. The public website has no API key and cannot launch live processing.

The sample path is fixed to `synthetic-sample.json`; the CLI intentionally does not accept a user-provided path. The client controls its model selection and access/billing. If the approved model is unavailable or disallowed, the program fails rather than switching to an unapproved model. No API calls have been executed during development.

## Design and control boundaries
- Uses the current **Responses API** `POST /v1/responses`; not the discontinued Assistants API.
- Sends instructions as developer-controlled `instructions` plus a user-content object with the untrusted email and **only approved reference facts**.
- Requests `store: false` (review provider policies and whether any other service-level retention applies).
- No tools, Gmail, Outlook, ERP access or other external integrations are enabled.
- No sending endpoint, webhook, email provider or ledger-write action exists.
- All results are **drafts requiring a human to check source records**.
- The CLI prints the result to the operator's terminal; it does not save data to a database, but terminals and host systems can retain logs. Do not use real customer data without a separate security review.
- A simple approval environment flag is **not** authentication, access control, or proof of lawful processing.
- Response text is never used as an instruction for a next automated action.
- Customer-specific operational prompts, datasets and credentials must be configured separately in a suitable private environment; never in the public repository.

## Test contract
`tests/test-mkb-ai-api-pilot.js` checks:
- Zero network use in dry-run
- Model and source-message validation
- Live calls blocked without explicit data approval and an API key
- `store: false`, no enabled tools and maximum output size setting
- Provider error and incomplete-response handling
- No email sending, even when a valid mocked response is returned

## Not yet provided
Actual live API verification; data protection assessment; real or simulated customer ERP lookups; true inbox ingestion; permissions/authentication; hardened logging and error sanitization; commercial contracts; deployment; full browser acceptance tests. None of these can be replaced by a clever prompt.

Provider technical references: https://platform.openai.com/docs/api-reference/responses and https://platform.openai.com/docs/guides/text .

## Draft claim screening — conservative and advisory

The API adapter now attaches two independent diagnostics to a live **draft-only** response:
1. **Structure quality:** CATEGORY, DRAFT and HUMAN CHECKS sections, with basic content-length checks.
2. **Claim warnings:** literal indicators of asserted payment receipt, refunded payments, completed bank detail changes, guaranteed delivery, or concrete invoice/order references and dates that are absent from the supplied approved reference facts.

A flagged result means **manual verification is necessary**. An unflagged result is **not evidence of correctness**: paraphrases, negation, currencies, dates in other formats, claims implied by context, deceptive text and facts contradicting source materials can escape detection. Literal matches cannot verify source accuracy, nor validate that the supplied approved facts are themselves trustworthy.

The model response is never approved for outbound delivery by the adapter. `approvedForSending` and `verifiedBySystem` remain `false`, even if all checks appear clear. No mailing, bookkeeping or automatic actions exist.

Additional synthetic tests: `node tests/test-mkb-ai-claims.js`, also configured in the existing GitHub Actions workflow. The test files are public; real client facts and private implementation templates must never be placed here.

## Exact source-record comparison (synthetic)

`source-evidence.cjs` compares structured, manually supplied assertions against separately supplied, labeled records for `invoice`, `order`, and `credit` fields. It reports `matched`, `contradicted`, `missing`, `conflict`, `unknown`, `future-only`, or `stale`. The default freshness window is **seven calendar days** (configurable `maxAgeDays`, 0–365) for this prototype.

The browser demonstration at `docs/ai-studio/broncontrole.html` presents seven fictitious examples and shares exactly the same rules as the Node module. The separate tests check that the source files remain identical.

**Critical distinction:** a matching value is not real-world validation. These records are not fetched from authenticated ERP systems, are not independently signed, and may contain errors or be updated after the check. Seven days is a prototype warning threshold, not a claim that financial records can safely remain unchecked that long. A qualified operator must verify the latest authorized source before customer communication.

This comparison is independent of the free-form response risk scanner. It requires structured assertions and records to be supplied deliberately; it cannot magically infer or validate every claim made in natural-language AI output. Both checks remain advisory and **never authorize sending**.

## Integrated offline review walkthrough

Run `node ventures/mkb-ai-studio/api-pilot/review-demo.cjs` from the repository root. This runs two fixed **fictional** records through four observable states:

- a draft that passes the structural/claim checks and matches a supplied record, still pending human review;
- the same draft marked **reviewed-draft** after a synthetic reviewer explicitly confirms source verification (not permission to send);
- an asserted paid status contradicted by a synthetic unpaid ledger record, triggering a warning;
- the contradicted case manually escalated.

The `review-pipeline.cjs` module combines the existing draft format lint, conservative high-risk phrase detection and structured evidence comparison. It **does not** extract structured claims from AI text: assertions must be supplied independently. It does not authenticate the source, communicate with accounts, keep logs, grant access or authorize any outbound action. Review decisions are in-memory only, with no authentication or audit trail; don't use them as production controls.

The GitHub Actions configuration includes `node tests/test-mkb-ai-review-pipeline.js`, covering conflicting, missing and stale evidence, forced escalations and review-state transitions.

## Evaluation guidance
Record separate checks for answer format, references, uncertainty, approvals and factual correctness. A passing format check is not evidence that a draft is accurate or safe. Do not deploy based solely on automated checks.

## Batch pilot and net time measurement
Run `node ventures/mkb-ai-studio/api-pilot/batch-demo.cjs` to review three synthetic cases together. The batch report contains scenario assumptions only, not realized savings. The `measure.cjs` module compares previous task time to new processing PLUS human review PLUS correction time, and counts quality exceptions. These observations are supplied by an operator and are not independently verified. Neither tool sends mail or authorizes deployment.

## End-to-end AI-to-review batch (new)

Run `node ventures/mkb-ai-studio/api-pilot/model-batch-demo.cjs` to see two fictional emails processed through a **mock provider**, then through claim warnings, source-record comparison and human-review status assignment. The demo performs **zero** provider requests or outgoing actions. `node tests/test-mkb-ai-model-batch.js` tests the same connection with fake Responses API payloads.

The reusable `model-batch.cjs` processes at most ten explicitly supplied cases. **Dry-run is the default**, skips calls and deliberately returns `not-executed` rather than inventing AI outputs. Its live mode requires explicit approval, an operator-specified model and API credentials; it stops the batch on the first API/validation error and never includes confidential error details in summaries. All outputs remain internal drafts, never approved for sending.

**Limitations:** the structured assertions are currently prepared separately from generated text; their completeness and semantic correspondence to the AI answer have *not* been proven. A clean source comparison cannot prove that every factual statement in a free-form draft was checked. Human confirmation in the in-memory review pipeline does not amount to a production approval or verified audit trail. There is no live customer connection, authentication, service-level monitoring or guaranteed idempotency. Before a paid deployment, add a genuine private tenant, scoped permissions, reliable claim extraction, auditability, source ownership and a representative acceptance test. No real OpenAI API request was made in this development round.
