# Workflow: Roast Cafe App

## Objective
Maintain and evolve the Roast Cafe PWA — a gamified coffee logging app that rewards users for choosing local, independent coffee shops.

## Architecture
- **App**: `app/` — Next.js 16, TypeScript, Tailwind CSS 4, Prisma 7, NextAuth v5
- **Database**: PostgreSQL (Railway) accessed via `@prisma/adapter-pg`
- **AI**: Anthropic Claude Haiku for coffee facts, receipt verification, and trivia generation
- **Auth**: NextAuth v5 magic link (Resend email provider)
- **Deployment**: Railway (two services: Next.js + PostgreSQL)

## Key Files
| File | Purpose |
|------|---------|
| `app/prisma/schema.prisma` | All database models |
| `app/prisma.config.ts` | Prisma 7 datasource config (URL goes here, not schema) |
| `app/src/lib/xp.ts` | Points calculation, streak logic, shield management |
| `app/src/lib/achievements.ts` | Achievement check function + metadata |
| `app/src/lib/prompts.ts` | All Claude API prompt templates |
| `app/src/lib/auth.ts` | NextAuth configuration |
| `app/src/app/api/logs/route.ts` | Core log creation endpoint |

## Environment Variables Required
```
DATABASE_URL         # PostgreSQL connection string (Railway provides this)
NEXTAUTH_SECRET      # Generate: openssl rand -base64 32
NEXTAUTH_URL         # e.g. https://your-app.railway.app
ANTHROPIC_API_KEY    # From console.anthropic.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME  # For receipt uploads
CLOUDINARY_UPLOAD_PRESET           # Unsigned upload preset name
RESEND_API_KEY       # From resend.com (email magic links)
EMAIL_FROM           # e.g. noreply@yourdomain.com
```

## Local Development Setup
```bash
cd app
npm install
# Set DATABASE_URL in .env to your local PostgreSQL
npx prisma migrate dev    # Run migrations
npm run dev               # Start dev server at localhost:3000
```

## Railway Deployment
1. Create a new Railway project
2. Add a PostgreSQL service — Railway auto-sets DATABASE_URL
3. Add the GitHub repo as a new service, root directory: `app/`
4. Set all environment variables in Railway dashboard
5. Deploy — Railway auto-runs `prisma migrate deploy && npm start`

## Seeding Lesson Content
After deploying, run the WAT tool to generate lesson content:
```bash
# Set DATABASE_URL and ANTHROPIC_API_KEY in root .env first
pip install anthropic psycopg2-binary python-dotenv
python tools/generate_lessons.py
```
This calls Claude Haiku to generate 6 modules × 3 lessons × 5 questions = 90 questions total.
Cost: ~$0.50 one-time.

## Prisma 7 Notes (IMPORTANT)
- Prisma 7 no longer uses `url` in `datasource` block of schema.prisma
- Database URL is configured in `prisma.config.ts` and passed to `PrismaClient({ adapter })`
- Always use `@prisma/adapter-pg` with `PrismaPg({ connectionString })`
- Run `npx prisma generate` after any schema changes

## Tailwind CSS 4 Notes
- Uses `@import "tailwindcss"` instead of `@tailwind` directives
- Theme customization uses `@theme` block in CSS
- No `tailwind.config.js` needed — config is in CSS

## Adding New Features
1. Update `prisma/schema.prisma` with new models
2. Run `npx prisma migrate dev --name your_migration_name`
3. Add API route in `src/app/api/`
4. Build UI component in `src/components/`
5. Add page in `src/app/(app)/`
6. Update this workflow with any new constraints discovered

## Known Constraints
- next-pwa v5 doesn't support ESM config (use next.config.ts without PWA for now; add next.config.js separately if needed)
- Framer Motion v12 uses `motion` package name but `framer-motion` still works
- React 19 + next-auth beta may have edge cases with session handling
