# Security

## 1. Security Objectives

Protect:
- user accounts and save data;
- AI provider credentials;
- authoritative game state;
- backend infrastructure;
- private player text;
- operational systems and logs.

The game must assume that the browser, network requests, player-provided text and AI output are untrusted.

## 2. Trust Boundaries

```text
Browser (untrusted)
   |
   v
API validation/auth boundary
   |
   +--> Game Core (trusted project code)
   +--> PostgreSQL (trusted durable state)
   +--> Redis/queues
   +--> AI Provider (external/untrusted output)
```

Never let data cross a boundary without explicit validation appropriate to that boundary.

## 3. Client Is Untrusted

Never trust client-supplied:
- HP/MP;
- XP/level;
- inventory;
- equipment;
- currency;
- skill points;
- cooldown state;
- quest progress;
- relationship values;
- world flags;
- legal choice lists.

The browser sends intent. The server loads truth.

## 4. Authentication and Authorization

Before public cloud saves:
- use a proven identity/session mechanism;
- require authorization on every owned resource;
- verify `session.userId`/character ownership server-side;
- avoid sequential guessable IDs as security controls;
- use secure cookies where cookie sessions are used;
- configure `HttpOnly`, `Secure` and appropriate `SameSite` policies.

Do not build custom password hashing/authentication protocols when established solutions exist.

## 5. Secrets

Secrets include:
- Gemini/OpenAI API keys;
- database credentials;
- Redis credentials;
- session signing secrets;
- OAuth secrets;
- infrastructure tokens.

Rules:
- never expose them to Vite/browser environment variables;
- never commit `.env` files;
- never log secrets;
- use deployment secret injection;
- rotate compromised credentials immediately;
- keep `.env.example` placeholders non-secret.

## 6. AI Provider Security

All AI calls happen server-side.

Provider SDKs must not be bundled into the browser if they require privileged credentials.

Use timeouts and bounded retries to prevent resource exhaustion.

## 7. Prompt Injection

Player custom actions and AI-generated content can contain instruction-like text.

Mitigations:
- clearly delimit user-controlled data;
- never concatenate user text into the system/developer instruction role as trusted instructions;
- provide the model explicit rules that user text is game-world intent only;
- avoid giving the model access to secrets or internal admin operations;
- validate every structured output independently of prompt compliance.

Prompt engineering is not an authorization mechanism.

## 8. AI Output Is Untrusted

AI output can contain:
- malformed JSON;
- unexpected fields;
- hallucinated entity IDs;
- HTML/script fragments;
- contradictory mechanical claims;
- unsafe URLs.

Required controls:
- runtime schema validation;
- semantic validation;
- output length limits;
- allow-listed enums/tags;
- entity reference validation;
- safe rendering/escaping;
- no raw HTML execution by default.

## 9. XSS

Generated narrative and user-entered custom text must render as text/controlled rich text, not arbitrary HTML.

Avoid `dangerouslySetInnerHTML` for AI content.

If rich Markdown is introduced:
- use a maintained parser;
- disable raw HTML or sanitize with a robust allow-list;
- block JavaScript/data URLs where applicable.

## 10. Request Validation

Use Zod/equivalent schemas for all input.

Validate:
- object shape;
- IDs;
- ranges;
- string lengths;
- enum values;
- arrays/max counts;
- nested action unions.

Reject unknown/unsupported action types.

## 11. Resource Limits

Apply limits to:
- JSON body size;
- custom action length;
- character/world custom prompt length;
- AI output length;
- concurrent turns per session;
- requests per user/IP;
- image generation requests later.

The current broad `10mb` JSON limit should be reduced for normal game APIs once contracts are defined.

## 12. Rate Limiting

At minimum:
- authentication endpoints;
- character/session creation;
- AI-backed turn generation;
- expensive retrieval endpoints;
- anonymous traffic.

Use both per-user and per-session limits for AI turns.

## 13. Idempotency and Replay Protection

Every expensive/state-changing turn should use an idempotency key.

Persist enough information to ensure:
- retries do not duplicate rewards;
- a repeated request returns the original result;
- a reused key with a different payload is rejected.

## 14. Concurrency Attacks / Race Conditions

Two parallel requests must not both spend the same item, fate point or currency.

Use:
- session version checks;
- DB transactions;
- row-level locks or conditional updates;
- unique constraints.

## 15. Database Security

- use least-privilege DB credentials;
- do not expose PostgreSQL publicly unless required;
- use migrations rather than ad-hoc production schema editing;
- parameterize queries through Prisma/driver APIs;
- back up encrypted infrastructure storage;
- secure production connections with TLS where applicable.

## 16. Redis Security

Redis should normally be private to the application network.

Do not expose Redis directly to the public internet.

Do not store the only copy of durable game state in Redis.

## 17. CORS

Production CORS must use explicit allowed origins.

Do not use unrestricted `*` with credentialed requests.

## 18. CSRF

If authentication uses cookies, mutating requests require an appropriate CSRF strategy based on the chosen session architecture and SameSite policy.

## 19. SSRF / Remote Media

If future features allow AI/user-supplied image URLs:
- do not blindly fetch arbitrary URLs server-side;
- allow-list providers or proxy through a secure media service;
- block private/internal network ranges;
- limit response size/type/timeouts.

## 20. File Uploads

If avatars/mods/user content are introduced:
- enforce size limits;
- validate actual content type;
- rename with server-generated IDs;
- store outside executable application paths;
- scan or isolate risky formats;
- never trust original filename extensions.

## 21. Logging and Privacy

Do not log:
- API keys;
- authorization headers;
- session cookies;
- password reset tokens;
- full secrets;
- unnecessary full AI prompts containing personal content.

Prefer structured metadata and redacted excerpts for debugging.

## 22. Error Handling

Public errors must not include:
- stack traces;
- filesystem paths;
- SQL strings;
- provider credentials;
- internal prompt/system instructions.

Use stable project-owned error codes.

## 23. Dependency Security

- pin/lock dependency versions;
- run dependency vulnerability scanning in CI where practical;
- update critical security issues promptly;
- avoid abandoned packages for authentication/sanitization/crypto.

## 24. Container Security

Production containers should:
- use minimal base images;
- run as non-root;
- not contain `.env` secrets baked into layers;
- use multi-stage builds;
- expose only required ports;
- include health checks/readiness.

## 25. Abuse and Cost Security

AI APIs create a financial abuse surface.

Controls:
- authentication or strict anonymous quotas;
- per-user daily limits;
- concurrent generation limit;
- maximum token/output settings;
- cost monitoring;
- provider circuit breaker;
- admin kill switch for AI generation.

## 26. Game Integrity / Cheating

This is a single-player-oriented game, so anti-cheat need not become invasive. However server integrity matters for:
- achievements;
- shared run summaries;
- leaderboards later;
- cost control;
- consistent saves.

Server authority should be sufficient for the normal threat model.

## 27. Security Review Checklist

Before merging a new public endpoint:
- [ ] input schema exists;
- [ ] authentication requirement is explicit;
- [ ] ownership authorization is checked;
- [ ] state comes from server, not client claims;
- [ ] request size is bounded;
- [ ] rate limit need considered;
- [ ] DB writes are concurrency-safe;
- [ ] output does not leak secrets/private fields;
- [ ] errors are sanitized;
- [ ] AI/user text is treated as untrusted;
- [ ] tests cover abuse-relevant cases.

## 28. Pre-Launch Security Gate

Before public production launch:
- threat model review;
- authentication/authorization tests;
- secret scan;
- dependency scan;
- CSP/security headers;
- CORS/CSRF review;
- API rate-limit verification;
- backup and restore test;
- production logging redaction review;
- AI cost limits enabled;
- basic penetration/security test of critical flows.