# Railway backend deployment

This backend is prepared for Railway.

## Service
- Root Directory: `/backend`
- Builder: Dockerfile
- Dockerfile: `Dockerfile`
- Start command: `node server.js`
- Healthcheck: `/api/health`

## Backend variables
Set these on the backend service:
- `DB_HOST=${{MySQL.MYSQLHOST}}`
- `DB_PORT=${{MySQL.MYSQLPORT}}`
- `DB_NAME=${{MySQL.MYSQLDATABASE}}`
- `DB_USER=${{MySQL.MYSQLUSER}}`
- `DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}`
- `JWT_SECRET=<long random secret>`
- `JWT_EXPIRES_IN=7d`
- `WHATSAPP_SESSION_PATH=/data/whatsapp-session`
- `WHATSAPP_DELAY_MS=3000`

Railway's MySQL service exposes `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, and `MYSQLDATABASE` for service-to-service connections.

## WhatsApp persistence
Attach a Railway Volume to the backend service and mount it at:

`/data`

The WhatsApp LocalAuth session is then stored at `/data/whatsapp-session` and can survive normal redeploy/restart cycles.

Do not commit a real `.env` file or secrets to GitHub.
