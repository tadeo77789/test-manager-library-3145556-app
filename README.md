# test-manager-library-3145556-app

> **Prueba técnica · Ficha ADSO 3145556**
> Entrega: **martes 13 de octubre de 2026, a las 5:00 p. m.** (17:00, hora Colombia).

Este repositorio es el **frontend** de *Manager Library*, en **React**. **Empieza vacío a propósito**: se construye en el fork de cada aprendiz.

## Instrucciones

Cada aprendiz debe **crear el fork** de los seis repositorios del proyecto y **resolver el proyecto
con el spec planteado**.

1. Hacer fork, a su cuenta de GitHub, de cada repositorio de la tabla del final.
2. Leer el spec en [`test-manager-library-3145556-docs`](https://github.com/code-sena/test-manager-library-3145556-docs).
   Se entrega en dos versiones: `spec-python/` y `spec-.net/`.
3. Desarrollar en los forks.

## El reto se desarrolla con React y PHP (Laravel)

El spec está escrito para Python y para .NET, pero el reto **no** se hace en esos lenguajes:

| Capa | Tecnología del reto |
|---|---|
| Frontend | React |
| Backend | PHP con Laravel |

Lo que el spec define sobre el negocio —historias, criterios de aceptación, reglas, contrato de la
API, modelo de datos— se respeta. Lo que define sobre la tecnología se traduce a React y Laravel.

## La prueba no consiste en escribir el código

El propósito principal es ver la **capacidad de desempeño con SDD** (*Spec-Driven Development*,
desarrollo guiado por especificación): cómo se lee, se interpreta y se aplica una especificación
para llevarla a un stack distinto. El código es el medio, no el fin.

## Entrega

Cuenta lo que quede **subido a los forks antes de las 5:00 p. m.** (17:00). Lo que llegue después no se revisa.
No hay prórroga: suban avances parciales con commits pequeños durante la prueba.

## Los seis repositorios

| Repositorio | Qué va ahí |
|---|---|
| [`test-manager-library-3145556-docs`](https://github.com/code-sena/test-manager-library-3145556-docs) | El spec: `spec-python/` y `spec-.net/` |
| [`test-manager-library-3145556-api`](https://github.com/code-sena/test-manager-library-3145556-api) | Backend en PHP (Laravel) |
| [`test-manager-library-3145556-app`](https://github.com/code-sena/test-manager-library-3145556-app) | Frontend en React |
| [`test-manager-library-3145556-page`](https://github.com/code-sena/test-manager-library-3145556-page) | Sitio público estático de presentación |
| [`test-manager-library-3145556-infra`](https://github.com/code-sena/test-manager-library-3145556-infra) | Contenedores, red, volúmenes y motor de base de datos vacío |
| [`test-manager-library-3145556-tool`](https://github.com/code-sena/test-manager-library-3145556-tool) | Utilidades: sembrador de datos de demostración |

---

## Implementation (T-22)

React 18 + Vite (JavaScript) single-page app. The only notable extra dependency is `react-router-dom`.
It talks to the backend exclusively over HTTP, following `api-contract.md`. UI texts are in Spanish (contract, Art. XI); code and docs are in English.

### Screens

| Route | Roles | Content |
|---|---|---|
| `/login` | public | Login; stores token and role, shows the API `message` on error |
| `/books` | all | Catalog: search `q`, category filter, pagination. Admin: create, edit, soft-delete, upload/remove cover (multipart field `file`) |
| `/members`, `/members/:id` | all | List/search/create members; detail with `active_loans` |
| `/lend` | all | Pick a member and 1-3 distinct books, `POST /loans`, business errors shown as returned |
| `/loans`, `/loans/:id` | all | Filters `from`/`to`/`status`/`member_id`; detail with items; return per item |
| `/overdue` | all | Overdue items with `days_late` |
| `/report` | admin | Most borrowed books between two dates |
| `/users/new` | admin | Create a librarian |

The menu depends on the role. A `401` clears the session and redirects to the login; a `403` shows a permission message.

### Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
docker build -t manager-library-app . && docker run -p 5173:5173 manager-library-app
```

### Environment variables

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Read at build time (Docker build arg `VITE_API_URL`) |

### End-to-end walkthrough

1. Start the API (and database) and open `http://localhost:5173`. Log in with the admin from the API's `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
2. Catalog: create a book (admin) and optionally upload a cover. Members: register a member.
3. Lend: choose the member, add 1-3 books, press "Registrar préstamo". The due date (14 days) is shown.
4. Loans: open the loan and press "Devolver" on each line; when all are returned the status becomes "Cerrado".
5. Report (admin): choose a date range to see the most borrowed books.

### Status

| Task | Status | Evidence |
|---|---|---|
| T-22 React frontend | Done (all screens implemented) | `npm run build` succeeds; not yet exercised against a live API in this repo |

### Translation decisions

- The cover endpoint requires the bearer token, so covers are fetched with `fetch` and shown through a blob URL.
- The loan list/detail shows the member name by fetching `GET /members/{id}` (loans only carry `member_id`).

### Dependencies

Versions are pinned exactly in `package.json` and locked in `package-lock.json` (use `npm ci` for reproducible installs; the Dockerfile does).

| Package | Kind | Purpose |
|---|---|---|
| `react`, `react-dom` | runtime | UI |
| `react-router-dom` | runtime | Client-side routing |
| `vite` | dev | Build tool and dev server |
| `@vitejs/plugin-react` | dev | JSX/Fast Refresh support for Vite |

No UI or state-management libraries are used. Docker images are pinned (`node:24-alpine`, `nginx:1.27-alpine`).
