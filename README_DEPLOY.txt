CAREPOINT - HOSPITAL PATIENT REGISTRATION SYSTEM
Vercel frontend + Vercel serverless API + Supabase PostgreSQL

IMPORTANT
- Vercel does not run this project's old Java backend. This Vercel version uses Node.js serverless functions under /api and keeps the same HTML/CSS/JavaScript interface.
- The Supabase service-role key is a secret. Add it only in Vercel Environment Variables. Never put it in app.js, index.html, or any file committed to GitHub.
- This is an educational demo, not a production-ready hospital system. It has no login/role-based access controls. Do not store real patient or medical data.

STEP 1 - CREATE SUPABASE DATABASE
1. Create a project at https://supabase.com/.
2. Open SQL Editor -> New query.
3. Open this project's supabase_schema.sql, copy all of it, paste into SQL Editor and click Run.
4. Open Project Settings -> API (or Connect settings). Copy the Project URL.
5. Copy the service_role key from API keys. Depending on the Supabase UI, it may be labelled secret/service_role. Treat it like a password.

STEP 2 - UPLOAD TO GITHUB
1. Extract this ZIP.
2. Upload the CONTENTS of this folder to the ROOT of a GitHub repository. index.html, app.js, style.css, package.json, vercel.json, and api/ must be at the repository root.

STEP 3 - DEPLOY ON VERCEL
1. Go to https://vercel.com/ -> Add New -> Project and import the GitHub repository.
2. Framework Preset: Other. Build command: leave blank. Output directory: leave blank/default. Install command: npm install (or default).
3. Before or after first deploy, open Project -> Settings -> Environment Variables and add BOTH variables:
   SUPABASE_URL = https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = paste the Supabase service-role/secret key
4. Enable them for Production (and Preview if needed), Save, then Redeploy.

STEP 4 - TEST
1. Open the Vercel deployment URL.
2. Register a fictional test patient.
3. Refresh the page and check the record still appears.
4. In Supabase -> Table Editor -> patients, confirm the row exists.

API
GET    /api/patients?q=search-term
POST   /api/patients
PUT    /api/patients/:id
DELETE /api/patients/:id

TROUBLESHOOTING
- “Server configuration missing”: check both Vercel variables and redeploy.
- “Database request failed”: ensure supabase_schema.sql ran successfully, URL is the Project URL, and the key is the service_role/secret key (not anon/publishable).
- If changing environment variables, redeploy after saving.
- Do not share your service-role key or database password in screenshots/chats.
