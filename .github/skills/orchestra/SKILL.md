---
name: orchestra
description: "Use when: orchestrating FE API implementation, planning sprint execution, enforcing admin-first delivery, generating markdown and JSON handoff summaries, or applying PixelMage workflow gates."
---

# Orchestra Skill

Use this skill to coordinate implementation in this repository with a strict sequence:

1. Discover
2. Contract check
3. Build
4. Verify
5. Handoff

## Project Rules

1. Admin and Staff domains are prioritized before Customer and Tarot.
2. The API matrix in pixelmage_api_tests.md is the contract source of truth.
3. Backend unknowns must not block FE progress when safe defaults exist.
4. Use server-first Next.js patterns and keep client boundaries minimal.
5. Use native fetch wrappers by default.

## Phase Gates

### Gate A: Discover

1. Confirm target domain and relevant API endpoints.
2. Confirm impacted routes, hooks, stores, and components.
3. Confirm existing shared utilities to reuse before adding new abstractions.

### Gate B: Contract Check

1. Read endpoint methods, expected statuses, and edge cases from pixelmage_api_tests.md.
2. Map FE behavior for 400, 401, 403, 404, and 500 outcomes.
3. Lock fallback states for ambiguous backend behavior.

### Gate C: Build

1. Implement adapters and typed request functions first.
2. Implement hooks and page components second.
3. Keep loading, empty, error, and unauthorized states explicit.
4. Avoid adding libraries unless needed by current phase.

### Gate D: Verify

1. Run lint.
2. Run typecheck.
3. Run build.
4. Run tests if test coverage exists for touched scope.
5. Record pre-existing failures separately from introduced issues.

### Gate E: Handoff

Provide two outputs:

1. Markdown summary with:
   1. Implemented scope.
   2. File changes.
   3. Validation results.
   4. Risks and next actions.
2. JSON summary with:
   1. domain
   2. endpointsTouched
   3. filesChanged
   4. checks
   5. blockers
   6. nextSteps

## Output JSON Template

```json
{
  "domain": "accounts",
  "endpointsTouched": ["GET /api/accounts"],
  "filesChanged": ["src/lib/api/accounts.ts"],
  "checks": {
    "lint": "pass|fail|not-run",
    "typecheck": "pass|fail|not-run",
    "build": "pass|fail|not-run",
    "test": "pass|fail|not-run"
  },
  "blockers": [],
  "nextSteps": []
}
```

## Runner Integration

When the environment supports shell scripts, use tool/skills.sh to run quality gates and produce a concise summary log.
