# TechCraft Merchant Payments Portal

A production-oriented merchant payments portal built with Angular 20+.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Angular 22 (standalone components, built-in control flow) |
| State | Signals + RxJS |
| Forms | Reactive Forms with custom validators |
| Styling | Bootstrap 5.3 + SCSS |
| Testing | Vitest + Angular TestBed |
| HTTP | Angular `HttpClient` with interceptors |
| Routing | Angular Router with lazy-loaded feature modules |

## User Roles

| Role | Permissions |
|---|---|
| `SALES` | Create / edit own merchant applications |
| `REVIEWER` | Review assigned applications, record risk decisions |
| `ADMIN` | View all applications, manage reviewer assignments |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start          # http://localhost:4200

# Run tests (single run)
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build
```

## Mock Users

| Email | Password | Role |
|---|---|---|
| `sales@techcraft.dev` | `password` | SALES |
| `reviewer@techcraft.dev` | `password` | REVIEWER |
| `admin@techcraft.dev` | `password` | ADMIN |

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── auth/           # Auth service, token management
│   │   ├── interceptors/   # HTTP auth interceptor + refresh logic
│   │   ├── guards/         # Route guards (auth, role-based)
│   │   ├── models/         # Shared domain interfaces
│   │   └── permissions/    # Permission service (role → action mapping)
│   ├── features/
│   │   ├── auth/           # Login page (lazy-loaded)
│   │   ├── dashboard/      # Application list with pagination (lazy-loaded)
│   │   ├── application/    # Wizard + detail view (lazy-loaded)
│   │   └── admin/          # Admin management panel (lazy-loaded)
│   ├── shared/
│   │   ├── components/     # Reusable UI (badge, spinner, confirm-dialog)
│   │   ├── directives/     # hasPermission, maskField
│   │   └── pipes/          # MaskPipe, StatusLabelPipe
│   └── layout/             # Shell: sidebar + header
├── mock-api/               # In-memory mock data and service
└── styles/                 # SCSS variables and mixins
```

## Security Notes

### Content Security Policy (CSP)
The application enforces the following CSP directives (configured in `index.html` meta tag and ideally via server headers in production):

- `default-src 'self'` — restricts all resources to same origin by default
- `script-src 'self'` — prevents inline scripts and third-party JS injection
- `style-src 'self' 'unsafe-inline'` — Bootstrap requires inline styles; scope is minimised
- `img-src 'self' data:` — allows base64 data URIs for avatars
- `connect-src 'self'` — restricts XHR/fetch to same origin
- `frame-ancestors 'none'` — prevents clickjacking via iframes
- `form-action 'self'` — restricts form submissions to same origin

### Sensitive Field Handling
- Bank account numbers, routing numbers, and tax IDs are masked by default using a custom `MaskPipe`
- Reveal is controlled by role: `ADMIN` and `REVIEWER` can unmask; `SALES` cannot
- Sensitive data is never logged to the console or stored in `localStorage` in plaintext

## License
MIT — for evaluation purposes only.
