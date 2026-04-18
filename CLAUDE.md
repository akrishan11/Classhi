<!-- GSD:project-start source:PROJECT.md -->
## Project

**Classhi**

Classhi is a Kalshi-style prediction market platform for CS 1660 lectures. Students place play-money bets on what happens in class ("How many times will the professor say 'AWS'?", "Will a student ask what S3 is?", over/unders on class length). The professor (admin) resolves markets when class ends; winners get paid out and the leaderboard updates. It is a CS 1660 Cloud Computing final project targeting a clean AWS architecture using 9 AWS services.

**Core Value:** Students can browse open markets, place bets with play money, and see live price updates — all backed by a fully serverless AWS stack that deploys from a single `sam deploy` command.

### Constraints

- **Tech Stack (locked)**: TypeScript everywhere (frontend + Lambdas), Vite + React 18 + Tailwind CSS, Node.js 20 Lambdas, AWS SAM, pnpm workspace, aws-amplify v6 (auth only), AWS SDK v3 modular
- **No component libraries**: No shadcn, MUI — hand-roll with Tailwind; flat design, no drop shadows
- **Visual design**: Primary green #00A86B, coral #E4572E for NO, background #FAFAF7, Inter font
- **No unit tests**: Not a grading criterion; skip unless explicitly asked
- **AWS region**: To be confirmed with user before execution
- **Timeline**: Final submission April 29, 2026
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Runtime
- **Lambda:** `nodejs20.x`, TypeScript 5.4, ARM64 (Graviton2 — ~20% cheaper per invocation)
- **Bundling:** SAM `BuildMethod: esbuild` with `External: ["@aws-sdk/*"]` — do not bundle the SDK (pre-installed in nodejs20.x). Run `tsc --noEmit` separately in CI for type safety only.
- **DynamoDB client:** `@aws-sdk/lib-dynamodb` with `DynamoDBDocumentClient` — auto-marshals JS types. Never use raw `@aws-sdk/client-dynamodb` for application code.
### Frontend
- Vite 5, React 18, Tailwind CSS 3.4
- aws-amplify 6 (auth only)
- `Amplify.configure({ Auth: { Cognito: { userPoolId, userPoolClientId } } })`
- ID token: `(await fetchAuthSession()).tokens?.idToken?.toString()`
- ⚠️ aws-amplify v6 is a **breaking** API change from v5:
### Package Management
- pnpm 9 workspaces (`pnpm-workspace.yaml`)
- `packages: ["packages/*"]`
- Structure: `packages/frontend/` and `packages/functions/` with per-function subdirectories
- SAM `CodeUri` points to individual function directory; each function has its own `EntryPoints` in SAM `Metadata` block
### CI/CD
- GitHub Actions OIDC — no long-lived AWS keys
- `aws-actions/configure-aws-credentials@v4` with `role-to-assume`
- Trust policy requires `StringLike` on `token.actions.githubusercontent.com:sub` scoped to repo
- Audience: `sts.amazonaws.com`
## SAM Resource Type Cheat Sheet
| Resource | SAM Type | Notes |
|----------|----------|-------|
| Lambda function | `AWS::Serverless::Function` | Use `Metadata.BuildMethod: esbuild` |
| HTTP API (REST routes) | `AWS::Serverless::HttpApi` | Supports native JWT authorizer |
| WebSocket API | `AWS::ApiGatewayV2::Api` | `ProtocolType: WEBSOCKET`; **no SAM shorthand** |
| WebSocket Stage | `AWS::ApiGatewayV2::Stage` | `AutoDeploy: true` |
| WebSocket Route | `AWS::ApiGatewayV2::Route` | One per: `$connect`, `$disconnect`, `$default` |
| WebSocket Integration | `AWS::ApiGatewayV2::Integration` | `IntegrationType: AWS_PROXY` |
| WebSocket Authorizer | `AWS::ApiGatewayV2::Authorizer` | `AuthorizerType: REQUEST`; `IdentitySource: route.request.querystring.token` |
| DynamoDB table (with Streams) | `AWS::DynamoDB::Table` | **Not `SimpleTable`** — use full resource type |
| DynamoDB Streams trigger | `Events.Type: DynamoDB` | `Stream: !GetAtt Table.StreamArn`; `StartingPosition: TRIM_HORIZON` |
| EventBridge Scheduler | `Events.Type: ScheduleV2` | Supports timezone; **not `Schedule`** which is UTC-only |
| EventBridge Rules cron | `Events.Type: Schedule` | UTC only — insufficient for class-time scheduling |
## Critical Pitfalls (Stack Level)
### WebSocket JWT Auth
- Browser `new WebSocket(url)` does NOT support custom headers
- Cognito ID token must be passed as query string: `wss://...?token=<idToken>`
- Lambda REQUEST authorizer reads from `event.queryStringParameters.token`
- Use `aws-jwt-verify` v4 for JWKS verification
- **HTTP API JWT auth** uses native validation — no Lambda authorizer needed
### DynamoDB Streams
- Use `StartingPosition: TRIM_HORIZON` not `LATEST` — LATEST misses events during event source mapping creation
- **Must include** `FunctionResponseTypes: [ReportBatchItemFailures]` — without it, one failed message retries the entire batch, producing duplicate WebSocket pushes
### EventBridge Scheduler
- Use `ScheduleV2` (EventBridge Scheduler) not `Schedule` (EventBridge Rules)
- `ScheduleV2` supports `ScheduleExpressionTimezone`, `StartDate`/`EndDate`, `FlexibleTimeWindow`
- For dynamically created market schedules: invoke `@aws-sdk/client-scheduler` `CreateScheduleCommand` from within create-market Lambda (not in template.yaml)
### DynamoDB Table Type
- `AWS::DynamoDB::Table` required for Streams — `AWS::Serverless::SimpleTable` does not expose `StreamSpecification`
### GitHub Actions OIDC
- IAM rejects trust policies where `token.actions.githubusercontent.com:sub` is absent or purely wildcard
- Must scope to at least an org: `"StringLike": { "token.actions.githubusercontent.com:sub": "repo:ORG/*" }`
## Open Questions
- **AWS region** — not yet confirmed; affects Cognito issuer URL, SAM deploy config, CloudFront behavior
- **Amplify v6 exact config schema** — verify `Auth.Cognito.userPoolClientId` key name against current docs before implementation
- **Dynamic market schedules** — create-market Lambda needs `scheduler:CreateSchedule` IAM permission if using at() expressions per market
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
