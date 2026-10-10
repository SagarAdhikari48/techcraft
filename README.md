# TechCraft Merchant Payments Portal

A production-oriented merchant payments portal for managing merchant onboarding, application review, and payment approvals.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Angular 22 — standalone components, built-in `@if`/`@for` control flow |
| State | Signals + `computed()` + RxJS for async reactive flows |
| Forms | Reactive Forms with custom validators and draft auto-save |
| Styling | Bootstrap 5.3 + SCSS with custom variables and mixins |
| Testing | Vitest 5 + Angular TestBed |
| HTTP | `HttpClient` with functional `HttpInterceptorFn` |
| Routing | Angular Router — lazy-loaded features, functional guards |

---

## Getting Started

### Prerequisites

- Node.js 24.15+ or 26+
- npm 10+

### Install and run

```bash
# Install dependencies
npm install

# Start development server (http://localhost:4200)
npm start

# Run all tests (single pass)
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build
```

---

## Demo Accounts

All accounts use the password `password`.

| Email | Role | Access |
|---|---|---|
| `sales@techcraft.dev` | SALES | Create and edit own merchant applications |
| `reviewer@techcraft.dev` | REVIEWER | Review assigned applications, reveal sensitive fields |
| `admin@techcraft.dev` | ADMIN | Full access — all applications, reviewer assignments |

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── auth/              # AuthService (Signals + sessionStorage)
│   │   ├── guards/            # authGuard, roleGuard, guestGuard
│   │   ├── interceptors/      # authInterceptor + AuthRefreshState
│   │   ├── models/            # Domain interfaces and types
│   │   └── permissions/       # PermissionService (role → action map)
│   ├── features/
│   │   ├── auth/              # Login page (lazy-loaded)
│   │   ├── dashboard/         # Application list with pagination and filter
│   │   ├── application/       # Wizard (4 steps) + Detail view
│   │   └── admin/             # Admin panel (ADMIN role only)
│   ├── layout/
│   │   ├── shell/             # App shell — sidebar + header + outlet
│   │   ├── sidebar/           # Role-aware navigation
│   │   └── header/            # Page title, user menu, logout
│   └── shared/
│       ├── components/        # StatusBadge, Stepper
│       ├── directives/        # HasPermissionDirective
│       ├── pipes/             # MaskPipe
│       └── validators/        # taxId, routing, account, phone, url
├── mock-api/                  # In-memory mock data and services
└── styles/                    # SCSS variables and mixins
```

---

## Key Features

### Authentication
- Signal-based `AuthService` with `sessionStorage` token persistence
- Session restored on page reload automatically
- `authGuard`, `guestGuard`, `roleGuard` as functional `CanActivateFn`

### HTTP Interceptor
- Attaches `Authorization: Bearer <token>` to every outgoing request
- On 401: triggers a single token refresh via `POST /auth/refresh`
- Concurrent 401s queue on a `BehaviorSubject` — only one refresh fires
- Refresh failure calls `logout()` and propagates the error

### Application Dashboard
- Server-side pagination, debounced search (350ms), status filter
- Role-filtered results: SALES sees own, REVIEWER sees assigned, ADMIN sees all
- Loading, error and empty states with retry and `aria-live` announcements

### Multi-step Wizard
- 4 steps: Business Info → Contact Info → Banking Details → Review & Submit
- Reactive Forms with field-level validation (custom validators for taxId, routing, account numbers)
- Step validation gates — cannot advance with invalid fields
- Draft auto-save to `localStorage` via RxJS `debounceTime(800ms)`
- Draft restored on re-open; Discard Draft button clears state

### Application Detail
- Sectioned view: business, contact, banking, risk history timeline
- Sensitive fields (taxId, account number, routing number) masked by default using `MaskPipe`
- REVIEWER and ADMIN can reveal individual fields via toggle
- Risk history timeline with colour-coded decisions
- Reviewer controls (Approve / Reject / Hold) hidden from SALES role

### Admin Panel
- Status count cards (total, submitted, under review, approved, rejected, on hold)
- All-applications table with per-row reviewer assignment dropdown
- Client-side search, status and reviewer filters
- `forkJoin` loads applications and reviewers in parallel

### `HasPermissionDirective`
- Structural directive: `*appHasPermission="'action:name'"`
- Optional `appHasPermissionElse` template ref for fallback content
- Backed by `PermissionService.can()` — reactive to role changes

---

## Security

**Content Security Policy** (via `<meta>` in `index.html` — move to HTTP response headers in production):

| Directive | Value | Reason |
|---|---|---|
| `default-src` | `'self'` | Same-origin fallback for all resource types |
| `script-src` | `'self'` | No inline scripts, no `eval()` — AOT compiled |
| `style-src` | `'self' 'unsafe-inline'` | Angular/Bootstrap emit runtime inline styles |
| `img-src` | `'self' data:` | Avatars use base64 data URIs |
| `font-src` | `'self'` | Bootstrap Icons bundled by CLI |
| `connect-src` | `'self'` | No third-party XHR/fetch/WebSocket |
| `frame-ancestors` | `'none'` | Prevents clickjacking |
| `form-action` | `'self'` | Defence-in-depth for form submissions |
| `object-src` | `'none'` | Disables legacy plugin embeds |

**Sensitive data handling:**
- Tokens stored in `sessionStorage` — cleared on tab close
- Sensitive fields masked at render time via `MaskPipe`
- Role-gated reveal requires `sensitive:reveal` permission (REVIEWER + ADMIN only)
- Draft data stored in `localStorage` without raw sensitive values

---

## Testing

```bash
npm test                 # single run
npm run test:watch       # watch mode
npm run test:coverage    # coverage report (lcov + html)
```

| Spec file | Tests |
|---|---|
| `auth.service.spec.ts` | 10 |
| `permission.service.spec.ts` | 26 |
| `auth.interceptor.spec.ts` | 8 |
| `dashboard.component.spec.ts` | 15 |
| `application-wizard.component.spec.ts` | 16 |
| `application-detail.component.spec.ts` | 16 |
| `admin.component.spec.ts` | 16 |
| `application.validators.spec.ts` | 29 |
| `has-permission.directive.spec.ts` | 4 |
| `status-badge.component.spec.ts` | 6 |
| `stepper.component.spec.ts` | 5 |
| `mask.pipe.spec.ts` | 6 |
| `app.spec.ts` | 2 |
| **Total** | **159** |

---

## License

MIT
