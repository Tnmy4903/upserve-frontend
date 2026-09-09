# 🚀 Upserve Frontend

> **Production-oriented React frontend for the Upserve software agency management platform.**

Upserve is a role-aware web application for managing the agency workflow from lead intake through requirements, quotations, project execution, collaboration, deliverables, invoicing, payment, and completion.

---

## ✨ Highlights

- React and TypeScript single-page application
- Vite development and production build tooling
- JWT-backed authentication with protected routes
- Super Admin, Sub Admin, and Client role-aware navigation
- Leads, optional client requirements, quotations, and accepted-quotation project flow
- Project lifecycle, configurable three-stage payment schedule, and derived progress
- Deliverables, timeline events, discussions, and project files
- Invoice generation, sending, payment confirmation, cancellation, reconciliation, and PDF download
- Notifications, activity logs, profile/password management, and administrative content tools
- Public Home, Blog, Portfolio, and Contact pages
- Responsive layouts with loading, error, empty, validation, and success states

---

# 🛠 Tech Stack

| Category | Technology |
|-----------|------------|
| UI | React |
| Language | TypeScript |
| Build Tool | Vite |
| Routing | React Router |
| Styling | CSS design system |
| API | Fetch-based authenticated client |
| Backend | Upserve FastAPI API |
| Package Manager | npm |

---

# 🏗 Architecture

```text
React Application
        │
        ▼
Feature Modules
        │
        ▼
Feature API Services and Types
        │
        ▼
Shared Authenticated API Client
        │
        ▼
Upserve FastAPI Backend
```

The frontend uses feature-owned pages, components, services, and types. Shared authentication, layouts, navigation, and styling remain in their respective application-level modules.

---

# 📂 Project Structure

```text
frontend/
├── src/
│   ├── app/             # Application composition and route registration
│   ├── components/      # Shared UI components
│   ├── context/         # Authentication and session context
│   ├── features/        # Feature-owned pages, components, services, and types
│   ├── layouts/         # Public and authenticated layouts
│   ├── pages/           # Shared and public pages
│   ├── routes/          # Protected-route behavior
│   ├── services/        # Shared API and authentication services
│   ├── styles/          # Design system and responsive styles
│   ├── types/           # Shared TypeScript types
│   └── main.tsx         # Application entry point
├── .env                # Local environment configuration
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

The `.env` file is local-only and ignored by Git. Generated output, dependencies, and TypeScript build metadata are also ignored.

---

# 🚀 Core Modules

## 🔐 Authentication and Users

- Login and current-user session handling
- Protected routes and role checks
- Profile updates and password changes
- Session invalidation handling through the backend

The backend remains the final authority for authentication, account state, authorization, and ownership. Frontend role checks only control the user experience.

## 📊 CRM and Requirements

- Lead listing, creation, detail, assignment, history, and lifecycle actions
- Requirement creation and relationship-aware detail views
- Approval and request-changes workflow
- Optional supporting-file upload on client requirement creation (PDF, images, documents, spreadsheets, presentations, text/CSV, and ZIP; 10 MB limit)
- Attachment metadata and authorized download action on requirement detail and lead requirement panels
- Super Admin review/approval access while Sub Admin visibility remains assignment-scoped

## 💼 Quotations

- Lead-based and existing-client quotation creation
- Service items and server-calculated totals
- Draft, sent, accepted, rejected, and revision-requested flows
- Detailed quotation PDF download from the quotation detail/dashboard flow
- Rejected quotation history with a new quotation path for Admin when needed
- Project creation/recovery after quotation acceptance

## 📁 Projects and Deliverables

Project lifecycle:

```text
pending → in_progress → testing → deployment → delivered → completed
```

Projects include role-scoped visibility, status and budget actions, backend-derived deliverable progress, configurable payment schedules, and invoice context.

Deliverables support:

```text
pending → in_progress → blocked → in_progress → completed
```

Cancelled deliverables and terminal states are displayed according to backend rules.

## 💬 Timeline and Discussions

- Project timeline events
- Project discussions and replies
- Role-aware project visibility
- Loading, empty, error, and mutation feedback states

## 📦 Files and Media

- Project file upload and listing
- Clients can upload project files from the project Files section; client uploads are automatically shared with the project team
- Client-visible/internal file status
- Authorized file and invoice PDF downloads
- Requirement supporting-file upload and download with safe type/size validation
- Public content media display and administrative media management

## 📄 Invoices and Payments

Invoice stages:

```text
Advance → Milestone → Final
```

Stage percentages are configurable per project and must total 100%. Projects without a stored schedule retain the legacy-compatible 40/30/30 default. Invoice amounts and payment prerequisites are controlled by the backend.

The frontend supports invoice generation entry points, stage display, sending, exact payment confirmation, cancellation, stale-send reconciliation where authorized, and PDF download.

## 🔔 Notifications and Activity

- Current-user notification inbox
- Unread and mark-read actions
- Notification deletion and clear-all actions
- Super Admin activity-log views and entity history

## 🌐 Public Website and Content

- Public Home page
- Blog and portfolio browsing
- Contact submission
- Super Admin content and portfolio management

---

# 🔐 Role and Access Summary

| Capability | Super Admin | Sub Admin | Client |
|------------|:-----------:|:---------:|:------:|
| Access dashboard | ✅ | ✅ | ✅ |
| Manage users | ✅ | ❌ | ❌ |
| Manage CRM data | ✅ | Assigned/authorized scope | ❌ |
| Create/manage quotations | ✅ | ❌ | View and decide where permitted |
| Approve requirements | ✅ | According to authorization | View/request changes where permitted |
| Access projects | ✅ | Assigned/authorized scope | Own projects only |
| Change project status/budget | ✅ | ✅ | ❌ |
| Configure payment schedule | ✅ | ✅ | ❌ |
| Manage deliverables | ✅ | ✅ | View authorized deliverables |
| Send/confirm/cancel invoices | ✅ | ❌ | ❌ |
| Download authorized invoices/files | ✅ | ✅ | Own authorized files |
| Download authorized quotation PDFs | ✅ | ❌ | Own quotations |
| View activity logs | ✅ | ❌ | ❌ |
| Manage public content | ✅ | ❌ | ❌ |

Frontend visibility is not a security boundary. The backend enforces role, ownership, assignment, and project relationship authorization.

---

# 📊 Main Business Workflow

```text
Lead creation and assignment
          │
          ▼
Requirement creation and approval
          │
          ▼
Quotation creation and sending
          │
          ▼
Client acceptance
          │
          ▼
Project creation and initialization
          │
          ▼
Deliverables, timeline, discussions, and files
          │
          ▼
Project delivered
          │
          ▼
Advance → Milestone → Final invoices
          │
          ▼
Payment confirmed
          │
          ▼
Project completed
```

Projects originate from accepted quotations. The frontend displays backend-derived status, progress, financial values, and payment eligibility.

---

# ⚙ Environment Variables

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Use the deployed backend URL for production builds. Vite embeds this value into the browser bundle, so it is a public API location and must not contain secrets.

Do not commit `.env`, tokens, passwords, API keys, JWT secrets, database credentials, or Mailgun credentials.

---

# 🚀 Running Locally

```bash
npm install
npm run dev
```

The Vite development server normally runs at `http://localhost:5173`.

---

# 🧪 Verification and Production Build

```bash
npm ci
npm run verify
npm run typecheck
npm run build
npm run preview
```

`npm run verify` is the preferred release command. It runs the typecheck, formatting check, lightweight quality tests, and production build. See [`RELEASE-CHECKLIST.md`](./RELEASE-CHECKLIST.md) for smoke tests, rollback steps, and operator notes.

Production builds require `VITE_API_BASE_URL`. The deployed web server must provide SPA history fallback so direct navigation to application routes works correctly.

---

# 🛡 Error Handling and Security

- Shared authenticated API client for backend requests
- Protected routes for authenticated application pages
- Role-aware navigation and action visibility
- Readable loading, validation, error, empty, and success states
- Backend-authoritative authorization and ownership checks
- No backend credentials or signing secrets in frontend source
- No raw internal backend errors intentionally displayed by the UI

The frontend does not replace backend authentication or authorization. It provides user experience controls while the API remains the security boundary.

---

# ⚠️ Current Limitations

- Payment confirmation is an administrative backend action; no payment gateway is included.
- Real-time WebSocket or push-notification functionality is not included.
- Production hosting, HTTPS/TLS, SPA fallback, and backend deployment are configured outside this package.
- Browser, multi-role, and production smoke testing remain runtime verification activities.

---

**Upserve** — role-aware software agency workflow management frontend.
