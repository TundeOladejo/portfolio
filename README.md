# Case Study Portfolio

A modern case study portfolio platform built with Next.js 16, Tailwind CSS, Supabase, and TypeScript.

- **Public website** — statically generated listing and detail pages for published case studies
- **Admin portal** — authenticated interface to create, edit, and manage case studies with rich media sections

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript strict mode) |
| Styling | Tailwind CSS v4 |
| Database | Supabase PostgreSQL |
| ORM / Migrations | Prisma |
| Auth | Supabase Auth (email/password, SSR cookies) |
| Storage | Supabase Storage |
| Mutations | Next.js Server Actions |

---

## Prerequisites

- Node.js ≥ 20.9.0
- A [Supabase](https://supabase.com) project (free tier works)
- npm

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd portfolio
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```env
# Supabase project URL and anon key (safe to expose to the browser)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Direct database connection string for Prisma migrations
# Found in Supabase Dashboard → Settings → Database → Connection string → URI
# Use the "Direct connection" string (port 5432), NOT the pooler
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

> **Where to find these values:**
> - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Dashboard → Settings → API
> - `DATABASE_URL`: Supabase Dashboard → Settings → Database → Connection string → URI (Direct connection)

### 3. Run database migrations with Prisma

Prisma manages the table schema (`case_studies` and `sections`).

**For development** — push the schema directly without creating migration files:

```bash
npm run db:push
```

**For production** — use versioned migrations:

```bash
npm run db:migrate
```

This creates the `case_studies` and `sections` tables in your Supabase database.

### 4. Apply Row Level Security policies and Storage bucket

Prisma only manages table structure. RLS policies and the media Storage bucket must be applied separately. A setup script handles this automatically.

First, add your service role key to `.env`:

```env
# Supabase Dashboard → Settings → API → service_role (secret key)
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

Then run:

```bash
npm run db:setup
```

This applies `supabase/rls.sql` (RLS policies for both tables) and `supabase/storage.sql` (creates the public `media` bucket with authenticated-only write access).

If you prefer to run them manually:

**Option A — Supabase Dashboard (SQL Editor):**
Copy and run the contents of `supabase/rls.sql`, then `supabase/storage.sql`.

**Option B — psql:**
```bash
psql "$DIRECT_URL" -f supabase/rls.sql
psql "$DIRECT_URL" -f supabase/storage.sql
```

### 5. Create an admin user

The admin portal uses Supabase Auth. Create your admin account:

1. Go to Supabase Dashboard → Authentication → Users
2. Click **Add user** → **Create new user**
3. Enter your email and password
4. The user is created and can immediately sign in at `/admin/login`

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin portal.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database (dev) |
| `npm run db:migrate` | Run Prisma migrations (production) |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:setup` | Apply RLS policies and Storage bucket (requires `SUPABASE_SERVICE_ROLE_KEY`) |

---

## Project Structure

```
├── app/
│   ├── (public)/               # Public-facing pages (ISR)
│   │   ├── page.tsx            # Case study listing
│   │   └── [slug]/page.tsx     # Case study detail
│   └── admin/
│       ├── login/page.tsx      # Sign-in page (no auth guard)
│       └── (protected)/        # Auth-guarded admin pages
│           ├── layout.tsx      # Session guard
│           ├── page.tsx        # Case study list
│           └── case-studies/
│               ├── new/page.tsx
│               └── [id]/page.tsx
├── src/
│   ├── components/             # Shared UI components
│   ├── features/
│   │   ├── auth/               # signIn / signOut actions
│   │   ├── case-studies/       # Types, actions, slug utils, components
│   │   ├── sections/           # Types, actions, components
│   │   └── media/              # Validation, upload actions, MediaUploader
│   └── lib/supabase/           # Server / middleware / browser clients
├── prisma/
│   └── schema.prisma           # Database schema (Prisma manages tables)
├── supabase/
│   ├── rls.sql                 # Row Level Security policies
│   └── storage.sql             # Media bucket + storage policies
└── proxy.ts                    # Next.js route guard (formerly middleware)
```

---

## Database Schema

Managed by Prisma (`prisma/schema.prisma`):

**`case_studies`**
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, auto-generated |
| title | text | Required |
| description | text | Required |
| cover_image_url | text | Required |
| slug | text | Unique, URL-safe |
| status | text | `draft` or `published` |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Updated on each edit |

**`sections`**
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, auto-generated |
| case_study_id | uuid | FK → case_studies, CASCADE delete |
| type | text | `text`, `image`, or `video` |
| content | text | For text sections |
| media_url | text | For image/video sections |
| order | integer | Ascending display order |
| created_at | timestamptz | Auto |

---

## Media Uploads

Media files are uploaded **directly from the browser to Supabase Storage** using signed URLs — they never pass through the Next.js server. This avoids the server action body size limit for the 50 MB file cap.

Flow:
1. Admin selects a file → client validates MIME type and size
2. Server action generates a short-lived signed upload URL
3. Browser uploads directly to Supabase Storage via `PUT`
4. Server action persists the public URL to the section record

---

## Deployment

1. Set all environment variables in your hosting provider (Vercel, etc.)
2. Run `npm run db:migrate` to apply migrations to your production database
3. Apply `supabase/rls.sql` and `supabase/storage.sql` to your production Supabase project
4. Deploy the Next.js app

> **Note:** `DATABASE_URL` is only needed at build/migration time and in server-side code. It is never exposed to the browser.
