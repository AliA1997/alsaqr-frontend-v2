# AlSaqr

> A full-featured social media platform — feeds, communities, real-time messaging, and AI assistance — built with a modern React + TypeScript stack.

<!-- Add a screenshot or GIF here — it's the single highest-impact thing you can do for this README.
     ![AlSaqr screenshot](docs/screenshot.png) -->

## Live Demo

| Portal | Description | Link |
| --- | --- | --- |
| **Main App** | The core AlSaqr social platform | [alsaqr.app](https://alsaqr.app/) |
| **Zook** | Short-form streaming & reels experience | [zook.alsaqr.app](https://zook.alsaqr.app/) |
| **Meetup** | Community events & meetups | [meetup.alsaqr.app](https://meetup.alsaqr.app/) |

## Tech Stack

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS 4
**State:** MobX + mobx-persist-store
**Routing:** React Router 7
**Forms & Validation:** Formik · Yup
**Animation:** Framer Motion
**Backend & Auth:** Supabase · Axios REST clients
**AI:** Gradio client (NSFW assistant)
**Testing:** Playwright (component & e2e)
**Performance:** Web Workers (off-thread PDF generation) · react-virtualized (windowed feeds)

## Features

- **Social feed** — create, like, repost, bookmark, and comment on posts, with virtualized rendering for smooth scrolling on large feeds.
- **Communities & discussions** — create communities, manage members, run threaded discussions, and handle invite requests with admin/non-admin views.
- **Direct messaging** — real-time conversations with message history.
- **Lists** — curate and save lists of users and entities.
- **Notifications** — tabbed, categorized activity feed.
- **Explore & search** — discover users, communities, and content.
- **Profiles & settings** — personalize accounts, manage personal info, and account deletion flows.
- **PDF export** — generate post PDFs off the main thread via Web Workers.
- **Theming** — light/dark mode with persisted preferences.
- **Authentication** — Supabase-backed auth with session handling.

## Architecture Highlights

- **Neo4j → PostgreSQL migration.** The platform was migrated from a graph database to PostgreSQL (via Supabase), trading graph-native traversal for relational consistency, simpler operational tooling, and a managed auth/storage layer.
- **Off-thread heavy work.** PDF generation runs in dedicated Web Workers so the UI thread stays responsive.
- **Performant feeds.** `react-virtualized` windows long lists to keep render cost flat regardless of feed size.
- **Reactive state.** MobX stores (per domain: posts, communities, lists, notifications, user, settings) with persistence keep UI in sync with minimal boilerplate.

## Getting Started

```bash
# 1. Clone
git clone <repo-url>
cd alsaqr-frontend-v2

# 2. Install
npm install

# 3. Configure environment
# Create a .env file with your Supabase + API credentials (see .env.example)

# 4. Run the dev server
npm run dev
```

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Roadmap

- Integrate the **YumnaAI** assistant across the app
- Streaming and short-form ("reels") functionality
- Expanded search and discovery

---

*Version 2.x — actively developed.*
