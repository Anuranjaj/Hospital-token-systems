# MediToken Hospital Token Booking System

MediToken lets patients browse doctors, book a hospital token, and check the live queue. Staff can log in to manage doctors, departments, tokens, and hospital information.

## Technology

- Frontend: Next.js, React, TypeScript, and Tailwind CSS
- Backend: Django, Django REST Framework, and Simple JWT
- Local database: SQLite

The frontend and backend are separate applications. The frontend sends API requests to the Django backend using `NEXT_PUBLIC_API_URL`.

## Local development

Use Python 3.12 or newer and Node.js/npm.

### 1. Set up and start Django

From the project root, create and activate a virtual environment, then install the backend dependencies:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

If PowerShell blocks virtual-environment activation, see Microsoft's documentation for [PowerShell execution policies](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_execution_policies). You can also run `.venv\Scripts\python.exe` directly instead of activating it.

Start the backend:

```powershell
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is available at `http://localhost:8000/api`. The local Django settings use SQLite and development defaults. For custom values, set the backend environment variables in the current terminal before running Django. For example:

```powershell
$env:DJANGO_DEBUG = "True"
$env:DJANGO_ALLOWED_HOSTS = "localhost,127.0.0.1"
$env:DJANGO_CORS_ALLOWED_ORIGINS = "http://localhost:3000"
```

`backend/.env.example` lists the backend configuration variables. Django does not automatically load `.env` files in this project; set variables in the process environment or in your hosting provider's environment settings. Do not commit a real `.env` file.

### 2. Set up and start Next.js

In a second terminal, from the project root:

```powershell
Copy-Item frontend\.env.example frontend\.env.local
cd frontend
npm install
npm run dev
```

The frontend is available at `http://localhost:3000`. `frontend/.env.local` should contain:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Next.js loads `.env.local` automatically. Restart the development server after changing environment values.

## Environment configuration

### Frontend

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL for API requests. It is public browser configuration, not a secret. Use the local API URL above for development and the deployed Django API URL in the Vercel environment settings. |

### Backend

| Variable | Purpose |
| --- | --- |
| `DJANGO_SECRET_KEY` | Django signing key. Required when `DJANGO_DEBUG=False`; keep it private and generate a new value for deployment. |
| `DJANGO_DEBUG` | Enables development behavior when true. Set to `False` in production. |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated hostnames Django may serve, without URL schemes. Required in production; wildcards are rejected. |
| `DJANGO_CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins allowed to call the API, including scheme but no path. Required in production; wildcards are rejected. Configure only the actual frontend origins. |

`backend/.env.example` contains placeholders and local-development examples only. The backend reads these values from its process environment; it does not parse `.env` files.

## GitHub safety

The root `.gitignore` excludes environment files, local SQLite databases, Python caches and virtual environments, Node dependencies, Next.js build output, and local uploaded media. The `.env.example` templates are intentionally not ignored. The existing `backend/db.sqlite3`, if present, is local data: it is ignored, not deleted.

Before publishing, inspect `git status` and verify that no real secrets or personal data are staged. Never put backend secrets in `NEXT_PUBLIC_` variables.

## Deployment outline

- Deploy the Next.js frontend to Vercel and set `NEXT_PUBLIC_API_URL` to the actual deployed backend API URL.
- Deploy Django separately and configure `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS`, and `DJANGO_CORS_ALLOWED_ORIGINS` in the backend host's environment settings.
- This project currently configures SQLite at a local file path. SQLite is suitable for local development, but production database hosting, persistence, backups, and database configuration have not been implemented or verified. Choose and configure a production database before deploying Django; no database migration is performed as part of this setup.
- Use HTTPS for both deployed applications and allow only the real frontend origin in production CORS settings.
- `python manage.py check --deploy` currently warns that HSTS, HTTPS redirection, and secure session/CSRF cookie settings are not configured. Review and configure these for the actual backend host or reverse proxy before production; HSTS should only be enabled once HTTPS is correctly enforced.

## Checks

Run from the project root:

```powershell
npm --prefix frontend run lint
npm --prefix frontend run build
Set-Location backend
python manage.py check
python manage.py test
```

## Uploading to GitHub

The local root Git repository includes the frontend's existing commit history. No GitHub remote has been added and nothing has been pushed. After creating an empty repository on GitHub, from the project root review files before staging. Replace the placeholder below with your own repository URL:

```powershell
git status --short
git add .
git status --short
git commit -m "Prepare MediToken for local development"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Do not continue to `git add` or `git push` if `git status` lists secrets, local databases, personal data, `.env` files, or other files you do not intend to publish.
