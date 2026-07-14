# Deploying Climate Action Hub to Vercel

The repository is configured as one Vercel project:

- The Vite frontend is built from `artifacts/climate-change`.
- `api/index.ts` exposes the Express API as one Vercel Function.
- `vercel.json` routes `/api/*` to Express and all other non-file paths to
  the React single-page app.

Vercel starts the API function only when requests arrive. There is no separate
backend server or backend deployment to create or keep running.

## Local serverless development

After `vercel login`, run:

```sh
pnpm run dev:serverless
```

This starts the Vite frontend and Vercel's local function runtime with one
command. The existing `pnpm dev` command remains available for development
without the Vercel emulator.

## Dashboard deployment

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the repository in Vercel and keep the Root Directory set to the
   repository root.
3. Add a `SESSION_SECRET` environment variable for Production, Preview, and
   Development. Generate a value with:

   ```sh
   openssl rand -base64 32
   ```

4. Deploy. The repository's `vercel.json` supplies the install command, build
   command, output directory, serverless function, and rewrites.

## CLI deployment

```sh
vercel
vercel env add SESSION_SECRET
vercel --prod
```

## Data behavior without a database

The supplied CSV files are packaged with the API function and are read-only
seed data. Authentication for seeded demo users is stored in a signed browser
cookie, so `amara@demo.com` / `demo` works across cold starts.

Registrations, enrollments, completions, donations, and score changes are held
in memory. Vercel can start multiple function instances and recycle them at any
time, so these changes are temporary and may differ between requests. Durable
production writes require a shared persistence service.
