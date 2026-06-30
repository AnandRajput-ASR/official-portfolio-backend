# Official Portfolio — Backend API

A production-ready **Node.js / Express REST API** that powers the [Official Portfolio](https://anandrajput.dev) website. All data is stored in a **Supabase PostgreSQL** database with a dedicated `portfolio` schema.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 4.19 |
| Database | PostgreSQL 15+ (Supabase) |
| DB Driver | [postgres](https://github.com/porsager/postgres) (postgresjs) 3.4 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| Linting | ESLint 10 + Prettier 3 |
| Git Hooks | Husky + lint-staged |

---

## Project Structure

```text
official-portfolio-backend/
├── app.js                  # Express app setup (CORS, body parsing, routes, middleware)
├── server.js               # HTTP server boot + graceful shutdown
├── configs/
│   └── database.config.js  # Supabase PostgreSQL connection (postgresjs)
├── controllers/
│   ├── admin.controller.js # Protected admin CRUD operations
│   ├── auth.controller.js  # Login, change password, forgot/reset password
│   ├── blogSocial.controller.js # Public blog social interactions
│   ├── content.controller.js # Public read endpoints + analytics tracking
│   └── messages.controller.js # Contact form + admin message management
├── middleware/
│   ├── auth.js             # JWT verification middleware
│   ├── errorHandler.js     # Global error handler + 404 catcher
│   ├── health.js           # GET /api/health — uptime, memory, DB ping
│   ├── logger.js           # Request logger (method, path, status, duration)
│   ├── rateLimiter.js      # In-memory rate limiter (no external deps)
│   └── visitorIdentity.js  # Signed anonymous visitor cookie middleware
├── repositories/
│   ├── admin.repository.js # Admin write queries (hero, skills, companies, etc.)
│   ├── blogSocial.repository.js # Blog social stats/comments/reactions queries
│   ├── content.repository.js # Content write queries + re-exports shared reads
│   ├── messages.repository.js # Messages CRUD queries
│   ├── resume.repository.js # Resume metadata CRUD (DB-backed)
│   ├── settings.repository.js # Site settings (JSONB) read/write
│   └── shared.repository.js # Shared read queries used by both admin/content
├── routes/
│   ├── admin.routes.js     # /api/admin/* — protected admin endpoints
│   ├── auth.routes.js      # /api/auth/* — login, verify, password mgmt
│   ├── content.routes.js   # /api/content/* — public reads + image upload
│   ├── messages.routes.js  # /api/messages/* — contact form + admin inbox
│   └── resume.routes.js    # /api/resume/* — upload/download/info
├── services/
│   ├── admin.service.js    # Admin business logic
│   ├── auth.service.js     # Authentication logic (DB-backed)
│   ├── blogSocial.service.js # Blog social orchestration layer
│   ├── contact.service.js  # Contact form email notifications
│   ├── content.service.js  # Public content aggregation
│   ├── email.service.js    # Nodemailer transporter
│   ├── messages.service.js # Message orchestration + email alerts
│   └── settings.service.js # Site settings logic
├── scripts/
│   ├── schema.sql          # Complete DDL — 17 tables, indexes, RLS, seed data
│   ├── db-setup.js         # Run schema.sql against Supabase via Node.js
│   ├── db-runner.js        # Quick DB connection test
│   └── migrate-resume-meta.js # One-time migration: meta.json → DB
├── utils/
│   ├── asyncHandler.js     # try/catch wrapper for async route handlers
│   ├── constant.js         # Shared constants
│   └── response.js         # Standardised ok(), created(), fail() helpers
├── validators/
│   ├── blogSocial.validator.js # Blog social comment validation
│   └── contact.validator.js # Contact form input validation
├── data/
│   └── resume/             # PDF file storage (metadata lives in DB)
├── .env.example            # Template for environment variables
├── .gitignore
├── eslint.config.mjs
├── .prettierrc
└── package.json
```

---

## Database Schema

The database uses a dedicated `portfolio` schema with **20 tables**:

| Table | Description |
|---|---|
| `hero` | Name, title, subtitle, bio (single-row) |
| `contact_information` | Email, LinkedIn, GitHub, location (single-row) |
| `skills` | Tech skills with icons, proficiency, tags |
| `companies` | Work experience companies |
| `company_projects` | Projects per company (FK → companies) |
| `personal_projects` | Side projects / open source |
| `experience` | Timeline entries (education, career milestones) |
| `about_stats` | Stat cards (years exp, projects, certs, etc.) |
| `certifications` | Professional certifications with badges |
| `testimonials` | Client/colleague testimonials |
| `pending_testimonials` | Public submissions awaiting approval |
| `blog_posts` | Blog articles with markdown content |
| `blog_post_social_stats` | Per-blog likes/shares counters |
| `blog_post_comments` | Per-blog comment feed |
| `blog_post_reactions` | Per-visitor like state per blog slug |
| `analytics` | Page views, downloads, clicks (single-row) |
| `project_clicks` | Per-project click tracking |
| `site_config` | Site settings as JSONB (nav, hero, footer, etc.) |
| `messages` | Contact form submissions (soft-delete) |
| `admin_users` | Admin credentials (bcrypt hashed) |
| `resume_meta` | Resume file metadata (single-row) |

Full DDL with indexes, triggers, RLS policies, and seed data is in [`scripts/schema.sql`](scripts/schema.sql).

---

## API Endpoints

### Public

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/content/page-content` | Full portfolio content (all sections) |
| `GET` | `/api/content/hero` | Hero section only |
| `GET` | `/api/content/skills` | Skills list |
| `GET` | `/api/content/companies` | Companies + nested projects |
| `GET` | `/api/content/personal-projects` | Side projects |
| `GET` | `/api/content/experience` | Timeline entries |
| `GET` | `/api/content/stats` | About stats |
| `GET` | `/api/content/certifications` | Certifications |
| `GET` | `/api/content/testimonials` | Approved testimonials |
| `GET` | `/api/content/blog` | Published blog posts |
| `GET` | `/api/content/blogs/:slug/social` | Blog social state (counts + viewer like + comments) |
| `POST` | `/api/content/blogs/:slug/like` | Toggle current visitor like state |
| `POST` | `/api/content/blogs/:slug/comments` | Create a blog comment |
| `POST` | `/api/content/blogs/:slug/share` | Increment share count |
| `GET` | `/api/content/settings` | Site configuration |
| `POST` | `/api/content/analytics/track` | Track page view / click events |
| `POST` | `/api/messages` | Submit contact form |
| `GET` | `/api/resume/info` | Resume availability + metadata |
| `GET` | `/api/resume/download` | Download resume PDF |
| `POST` | `/api/admin/testimonials/submit` | Public testimonial submission |
| `GET` | `/api/admin/verify-slug/:slug` | Verify admin secret URL |
| `GET` | `/api/health` | Health check (uptime, memory, DB) |

### Authentication

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login → JWT token |
| `GET` | `/api/auth/verify` | Verify token validity |
| `PUT` | `/api/auth/change-password` | Change password (+ optional username) |
| `POST` | `/api/auth/forgot-password` | Request password reset email |
| `POST` | `/api/auth/reset-password` | Reset password with token |

### Admin (JWT Required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/page-content` | Full content (includes analytics + pending) |
| `PUT` | `/api/admin/heroSection` | Update hero + contact info |
| `PUT/POST/DELETE` | `/api/admin/skills[/:id]` | Skills CRUD |
| `PUT/POST/DELETE` | `/api/admin/companies[/:id]` | Companies CRUD |
| `POST/DELETE` | `/api/admin/companies/:id/projects` | Company projects |
| `PUT/POST/DELETE` | `/api/admin/personal-projects[/:id]` | Personal projects CRUD |
| `PUT/POST/DELETE` | `/api/admin/experience[/:id]` | Experience CRUD |
| `PUT` | `/api/admin/stats` | Sync about stats |
| `PUT/POST/DELETE` | `/api/admin/certifications[/:id]` | Certifications CRUD |
| `GET/PUT/POST/DELETE` | `/api/admin/testimonials[/all/:id]` | Testimonials management |
| `PUT/DELETE` | `/api/admin/testimonials/pending/:id/...` | Approve/reject/delete pending |
| `PUT/POST/PUT/DELETE` | `/api/admin/blog[/:id]` | Blog posts CRUD |
| `GET` | `/api/admin/blog/:slug/comments?status=all\|visible\|hidden\|deleted` | List blog comments for moderation with counts |
| `PATCH` | `/api/admin/blog/:slug/comments/:commentId/moderation` | Moderate comment (`hide`,`unhide`,`delete`,`restore`) |
| `DELETE` | `/api/admin/blog/:slug/comments/:commentId` | Backward-compatible soft delete (maps to moderation `delete`) |
| `DELETE` | `/api/admin/blog/:slug/comments/:commentId/permanent` | Permanent hard delete (superadmin only) |
| `GET/DELETE` | `/api/admin/analytics[/reset]` | Analytics read + reset |
| `PUT` | `/api/admin/settings` | Update site settings |
| `PUT` | `/api/content/reorder/:section` | Reorder any section |
| `POST` | `/api/content/upload-image` | Upload image (base64 → disk) |
| `POST/DELETE` | `/api/resume[/upload]` | Resume upload + delete |
| `GET/PATCH/DELETE` | `/api/messages[/:id/read\|star]` | Admin message management |
| `PATCH` | `/api/messages/mark-all-read` | Mark all messages read |

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **Supabase** project (or any PostgreSQL 15+ instance)
- **Gmail** account with [App Password](https://support.google.com/accounts/answer/185833) (for email alerts)

### 1. Clone & Install

```bash
git clone https://github.com/AnandRajput-ASR/official-portfolio-backend.git
cd official-portfolio-backend
npm install
```

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` / `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres` |
| `JWT_SECRET` | Secret for signing JWT tokens | (any long random string) |
| `ADMIN_SECRET_SLUG` | Secret URL segment for admin login | `secure-portal-ar2026` |
| `VISITOR_TOKEN_SECRET` | Optional HMAC secret for signed anonymous visitor cookie (falls back to `JWT_SECRET`) | `replace-with-a-second-random-secret` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:4200,https://anandrajput.dev` |
| `GMAIL_USER` | Gmail address for sending emails | `you@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail app password (not your login password) | `xxxx-xxxx-xxxx-xxxx` |
| `NOTIFY_EMAIL` | Email address to receive contact notifications | `you@gmail.com` |
| `SMTP_HOST` | SMTP host (defaults to Gmail) | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port (`587` STARTTLS / `465` SSL) | `587` |
| `SMTP_SECURE` | Use SSL from connect (`true` for `465`, `false` for `587`) | `false` |
| `SMTP_CONNECTION_TIMEOUT` | SMTP socket connect timeout (ms) | `30000` |
| `SMTP_GREETING_TIMEOUT` | SMTP greeting timeout (ms) | `30000` |
| `SMTP_SOCKET_TIMEOUT` | SMTP inactivity timeout (ms) | `60000` |
| `SMTP_DISABLE_PORT_FALLBACK` | Disable automatic `587`/`465` failover retry | `false` |
| `RESEND_API_KEY` | Optional Resend API key (HTTPS fallback when SMTP fails) | `re_xxx` |
| `RESEND_FROM` | Verified sender for Resend (or `onboarding@resend.dev`) | `onboarding@resend.dev` |

> **Note:** If your database password contains special characters (`@`, `$`, `^`, `&`), URL-encode them in the connection string.

### 3. Database Setup

Run the full schema against your Supabase project:

```bash
npm run db:setup
```

Or paste [`scripts/schema.sql`](scripts/schema.sql) into the Supabase SQL Editor.

### 4. Start the Server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

You should see:

```text
🚀  Portfolio API  →  http://localhost:3000
    Health         →  http://localhost:3000/api/health
    Environment    →  development
    Email alerts   →  ⚠️  Disabled (add GMAIL_APP_PASSWORD to .env)
    Admin slug     →  ✅ Configured
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Production start |
| `npm run db:setup` | Run full schema DDL against Supabase |
| `npm run db:test` | Test database connection |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint errors |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without modifying |

---

## Security

- **JWT-based authentication** — tokens expire, passwords are bcrypt-hashed
- **Secret admin slug** — admin login page is hidden behind a secret URL
- **Rate limiting** — auth routes (15 req / 15 min), contact form (5 req / 10 min)
- **Rate limiting** — auth routes (15 req / 15 min), contact form (10 req / 60 min), blog comments (20 req / 60 min)
- **CORS** — origin whitelist via `ALLOWED_ORIGINS`
- **Input validation** — contact form fields sanitised and validated
- **Signed anonymous visitor ID** — stable same-site `HttpOnly` cookie for deduplicated blog likes
- **Soft deletes** — messages aren't permanently deleted
- **No raw SQL injection** — all queries use parameterised postgresjs tagged templates
- **Error handler** — global error middleware; stack traces hidden in production

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| **postgresjs** over Prisma/Knex | Zero-dependency, fast, native tagged template queries |
| **File-based PDF storage** | Resumes are binary blobs — disk is simpler than BLOB columns; metadata is in the DB |
| **Single-row tables** (hero, analytics, settings) | `single_row_lock = true` + `UNIQUE` constraint guarantees one row |
| **`asyncHandler` wrapper** | Eliminates try/catch boilerplate in every controller |
| **Shared repository pattern** | Read queries reused by both public content and admin services |
| **In-memory rate limiter** | No Redis dependency for a single-instance deployment |

---

## Changelog

### v1.8.0 — Blog Social Interactions API

| Area | Change | Details |
|---|---|---|
| API | Added social endpoints under `/api/content/blogs/:slug` | Added `GET /social`, `POST /like`, `POST /comments`, `POST /share` and each mutation returns full updated social payload |
| Persistence | Added per-post social storage tables | Introduced `blog_post_social_stats`, `blog_post_comments`, `blog_post_reactions` with indexes, FK constraints, and update triggers |
| Visitor identity | Added stable anonymous visitor mechanism | Implemented signed same-site `HttpOnly` cookie token to dedupe likes per visitor across revisits |
| Validation | Added blog comment validator | Enforces trimmed input, optional name max 48, required message max 600, rejects empty message, sanitizes content |
| Abuse protection | Added comment endpoint limiter | Added route-level limiter for comment submissions to reduce spam bursts |

### Implementation details

- Routes: blog social endpoints are available on `/api/content/blogs/:slug/*` and use `slug` as the per-post key.
- Response contract: every social endpoint responds with:

```json
{
    "slug": "string",
    "likes": 0,
    "shares": 0,
    "viewerLiked": false,
    "comments": [
        {
            "id": "string",
            "name": "string",
            "message": "string",
            "createdAt": "2026-06-30T10:20:30.000Z"
        }
    ]
}
```

- Ordering: comments are returned newest-first (`created_at DESC, id DESC`) for deterministic rendering.
- Count safety: likes/shares are clamped to non-negative values in SQL and response mapping.
- Slug handling: unknown or inactive slugs return `404`.
- Cache behavior: `GET /api/content/blogs/:slug/social` is `Cache-Control: no-store` because it is viewer-specific.

### Blog social usage guide

#### 1. Fetch social state

```bash
curl -i http://localhost:3000/api/content/blogs/my-article/social
```

Notes:
- First call sets a signed `portfolio_vid` cookie.
- Subsequent calls should send the same cookie to preserve visitor like state.

#### 2. Toggle like

```bash
curl -i -X POST http://localhost:3000/api/content/blogs/my-article/like
```

Behavior:
- First call from a visitor likes and increments `likes` by 1.
- Next call from same visitor unlikes and decrements `likes` by 1 (never below 0).

#### 3. Add comment

```bash
curl -i -X POST http://localhost:3000/api/content/blogs/my-article/comments \
    -H "Content-Type: application/json" \
    -d '{"name":"Anand","message":"Great write-up on Angular signals."}'
```

Validation rules:
- `name`: optional, trimmed, max 48 chars (falls back to `Anonymous` when empty/missing)
- `message`: required, trimmed, max 600 chars
- Empty message returns `400`

#### 4. Track share

```bash
curl -i -X POST http://localhost:3000/api/content/blogs/my-article/share
```

Behavior:
- Always increments `shares` by 1 and returns updated full social state.

### Migration workflow

Run the blog social migration after pulling backend changes:

```bash
npm run db:setup
```

Or run `database/migrations/wave2_002_blog_social.sql` directly in Supabase SQL Editor.

---

### v1.9.0 — Blog Comment Moderation Lifecycle

| Area | Change | Details |
|---|---|---|
| Data model | Added moderation fields to blog comments | Added `moderation_status`, `moderation_reason`, `moderated_by`, `moderated_at`, `hidden_at`, `deleted_at` |
| Moderation flow | Added hide/delete lifecycle with recovery | Supports `visible -> hidden -> visible` and `visible/hidden -> deleted -> visible` via a single moderation action API |
| Safety | Switched moderation delete to soft delete | Admin `DELETE /api/admin/blog/:slug/comments/:commentId` now performs soft delete for backward compatibility |
| Auditability | Added moderation audit table | Every moderation action writes an audit row with action, from/to status, actor, reason, and timestamp |
| Public behavior | Enforced visibility-only public comments | Public social responses only include comments where `moderation_status='visible'` |

### Moderation state model

| Status | Public visibility | Recoverable | Meaning |
|---|---|---|---|
| `visible` | Yes | N/A | Default state shown publicly |
| `hidden` | No | Yes (`unhide`) | Temporarily suppressed from public |
| `deleted` | No | Yes (`restore`) | Soft-deleted state for moderation safety |

### Allowed transitions

| Action | From | To |
|---|---|---|
| `hide` | `visible` | `hidden` |
| `unhide` | `hidden` | `visible` |
| `delete` | `visible` or `hidden` | `deleted` |
| `restore` | `deleted` | `visible` |

Invalid transitions return `409 Conflict`.

### Admin moderation API

#### List comments by status

`GET /api/admin/blog/:slug/comments?status=all|visible|hidden|deleted`

Response shape:

```json
{
    "success": true,
    "data": {
        "comments": [
            {
                "id": "string",
                "slug": "string",
                "authorName": "string",
                "content": "string",
                "createdAt": "2026-06-30T12:00:00.000Z",
                "moderationStatus": "visible",
                "moderationReason": null,
                "moderatedBy": null,
                "moderatedAt": null,
                "hiddenAt": null,
                "deletedAt": null
            }
        ],
        "counts": {
            "all": 10,
            "visible": 8,
            "hidden": 1,
            "deleted": 1
        }
    }
}
```

#### Moderate comment

`PATCH /api/admin/blog/:slug/comments/:commentId/moderation`

Body:

```json
{
    "action": "hide",
    "reason": "Optional moderation note (max 300 chars)"
}
```

#### Backward-compatible soft delete

`DELETE /api/admin/blog/:slug/comments/:commentId`

Behavior:
- Uses the same moderation engine as `action=delete`
- Does not physically remove the row

#### Optional permanent delete

`DELETE /api/admin/blog/:slug/comments/:commentId/permanent`

Behavior:
- Hard deletes the comment row
- Strictly requires `superadmin` role

### Moderation workflow examples

```bash
# Hide
curl -X PATCH http://localhost:3000/api/admin/blog/my-article/comments/COMMENT_ID/moderation \
    -H "Authorization: Bearer <ADMIN_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"action":"hide","reason":"Off-topic thread"}'

# Unhide
curl -X PATCH http://localhost:3000/api/admin/blog/my-article/comments/COMMENT_ID/moderation \
    -H "Authorization: Bearer <ADMIN_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"action":"unhide"}'

# Soft delete
curl -X PATCH http://localhost:3000/api/admin/blog/my-article/comments/COMMENT_ID/moderation \
    -H "Authorization: Bearer <ADMIN_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"action":"delete","reason":"Spam links"}'

# Restore
curl -X PATCH http://localhost:3000/api/admin/blog/my-article/comments/COMMENT_ID/moderation \
    -H "Authorization: Bearer <ADMIN_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"action":"restore","reason":"False positive"}'
```

### Migration

Apply moderation schema changes using:

```bash
npm run db:setup
```

Or run `database/migrations/wave2_003_blog_comment_moderation.sql` directly in Supabase SQL Editor.

---

## License

MIT — see [LICENSE](LICENSE).
