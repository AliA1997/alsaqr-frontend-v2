# ALSaqr Social Media App

## Tech Stack
- React 18.3.1
- Typescript 5.5.3
- Eslint 9.9.0
- Typescript eslint 8.0.1
- Vite 5.4.1
- Playwright +1.56.1
- Framer Motion 7.6.18
- Mobx +6.13.6 / mobx-react-lite / mobx-persist-store
- Formik 2.4.6 + Yup 1.6.1
- Tailwind CSS 4.1.14
- Gradio Javascript client +2.0.0
- Supabase Client +2.58.0
- React Router +7.2.1 (`react-router-dom`, `createBrowserRouter`)
- Axios (api client layer — see §5)
- react-virtuoso (feed virtualization), wagmi/viem (web3 login), react-to-pdf / @react-pdf/renderer

---

# How We Build The Frontend

This constitution implements the **Qamar Labs Frontend Implementation Guide** for ALSaqr. The
sixteen sections below are the house rules: where code goes, when to reach for shared state, and
when it is fine to break the pattern on purpose.

Nothing here is set in stone. If a section stops matching how we actually build, that is a signal to
update this file — not to quietly ignore it.

## 1. Domains and routes

We think about the app as a handful of real areas, each owning a set of routes. Related work stays
together, so "where does the messaging page live" has one obvious answer.

Routes are declared in one place: [src/router/index.tsx](src/router/index.tsx), as a
`createBrowserRouter` route table nested under the `<App />` shell.

| Domain | Routes | Feature entry |
| --- | --- | --- |
| Feed / Posts | `/`, `/status/:status_id` | `features/Home.tsx`, `features/Status.tsx` |
| Explore | `/explore` | `features/Explore.tsx` |
| Communities | `/communities`, `/communities/:community_id`, `/communities/:community_id/:community_discussion_id` | `features/Communities.tsx`, `CommunityPage.tsx`, `CommunityDiscussionPage.tsx` |
| Lists | `/lists`, `/lists/:list_id` | `features/Lists.tsx`, `features/ListPage.tsx` |
| Messages | `/messages` | `features/Messages.tsx` |
| Notifications | `/notifications` | `features/Notifications.tsx` |
| Bookmarks | `/bookmarks` | `features/Bookmarks.tsx` |
| Profile | `/users/:name` | `features/User.tsx` → `components/userProfile/MainProfile.tsx` |
| Settings | `/settings` | `features/Settings.tsx` + `features/settings/*` |
| Yumna AI | `/yumna` | `features/YumnaAI.tsx` |
| Legal | `/privacy-policy`, `/terms-and-conditions` | `features/PrivacyPolicy.tsx`, `features/TermsAndConditions.tsx` |

Adding a route means adding it to the table above **and** to the router file. A route with no domain
is a smell — find the domain it belongs to first.

## 2. Where code lives

A **feature** is a whole page or a big chunk of one. A **component** is a smaller piece that lives
inside a feature. Anything used by more than one feature moves to the shared folder.

| Folder | Holds |
| --- | --- |
| `src/features/` | Page-level entries, one per route. Thin — they compose components. |
| `src/components/<domain>/` | Pieces belonging to a single domain (`posts`, `community`, `list`, `message`, `userProfile`, `group`, `event`, `product`, `explore`, `notification`, `spaces`, `users`, `yumna`, `pdf`). |
| `src/components/shared/` | Feed shells reused across domains (`Feed`, `VirtualizedFeed`, `MediaFeed`, `CommentFeed`, …). |
| `src/common/` | The cross-app toolbox — buttons, inputs, modals, tabs, containers, titles, error boundary. See §12. |
| `src/layout/` | The app shell: sidebar, widgets, page container, dark-mode switch, spinner. |
| `src/hooks/` | Reusable hooks. See §4. |
| `src/models/` | Typescript models and **all** enums. See §14. |
| `src/stores/` | MobX stores. See §3. |
| `src/utils/` | Utilities used by more than one component, plus `utils/api` (server access), `utils/constants`, `utils/infrastructure` (supabase, gradio, wagmi, WebRTC), `utils/workerFunctions`. |
| `src/webWorkers/` | Worker entry points. See §8. |
| `tests/` | Playwright specs. See §15. |

**Features do not import from other features.** If two features need the same thing, it belongs in
`common/`, `components/shared/`, `hooks/`, or `utils/`. Otherwise the boundaries blur fast.

Path aliases are configured in `tsconfig.app.json` / `vite.config.ts`: `@features`, `@components`,
`@common`, `@layout`, `@hooks`, `@models`, `@stores`, `@utils`, `@typings`. Use them — no deep
relative chains like `../../../stores`.

## 3. Shared state vs local state

**Local state is the default.** Most of what a component needs matters only to that component.

Reach for a MobX store only when one of these is true:

1. Two unrelated parts of the app must see the same value at the same time (the logged-in user, the
   auth modal, the active dark-mode setting, unread notification counts).
2. The value has to outlive the component that created it (a wizard's in-progress form, a feed you
   scroll away from and return to).
3. It is a **paginated or virtualized feed** — those need `FeedState` (§5), which is store-shaped by
   construction.

Everything else — a page that loads one entity, a tab panel's rows, a toggle, a draft input — stays
in `useState` inside the component that owns it. In particular:

- A **distinct page for one entity** (a post page, a community page, a discussion page, a profile
  header) fetches through the api client into local `useState`. It is one consumer, and nothing
  needs the data after unmount.
- The **profile-collection tabs** (communities, discussions, groups, events, products) are
  single-fetch, single-consumer views owned by `MainProfile`, so they hold their rows in local
  state. They are deliberately *not* store-backed: they are not paginated in the UI, and no other
  screen reads them. If one of them grows infinite scroll, that is the moment it earns a `FeedState`
  store — not before.

Current stores and what each owns:

| Store | Owns |
| --- | --- |
| `authStore` | Session/auth state, current user token. |
| `commonStore` | App-wide concerns: server error, dark mode, user IP info, app-loaded flag. |
| `modalStore` | Which modal is open and its payload. |
| `userStore` | Current user, follow state, profile paging params. |
| `feedStore` | The home post feed. |
| `bookmarkFeedStore`, `commentFeedStore`, `listFeedStore`, `communityFeedStore`, `communityDiscussionFeedStore`, `notificationStore`, `messageStore`, `yumnaFeedStore` | Paginated feeds, each composing `FeedState`. |
| `exploreStore`, `searchStore`, `settingsStore`, `spaceStore` | Explore tabs, search, settings forms, live spaces. |

Stores are registered in [src/stores/index.ts](src/stores/index.ts) — both the `Store` interface and
the `store` object — and read through `useStore()`. Any component reading store state is wrapped in
`observer` from `mobx-react-lite`.

## 4. Reusable hooks

When the same logic shows up in a few places, pull it into `src/hooks/`. **Rule of three**: wait
until you have written it three times. Extracting earlier usually means guessing at the shape.

Existing hooks: `useCheckSession`, `useDebounce`, `useThrottle`, `useGetCountry`, `useGetMounted`.

Hooks are prefixed `use`, live one-per-file, and clean up after themselves (clear timers, abort
in-flight work) in a `useEffect` teardown.

## 5. Talking to the server

**Data access goes through axios api clients — never through the Supabase client.** Supabase owns
auth/session only (`utils/infrastructure/supabase.ts`), and the session is checked on app
initialization via `useCheckSession`.

- Api clients live in [src/utils/api/](src/utils/api/), one file per domain, named `xxxApiClient`.
- Each is a plain **object literal** whose methods return
  `axios.get(url, { params }).then(axiosResponseBody)`. Query params are passed as `URLSearchParams`.
- Every client is aggregated into the default `agent` export in
  [src/utils/api/agent.ts](src/utils/api/agent.ts). That module also owns `axios.defaults.baseURL`
  (from `VITE_PUBLIC_BASE_API_URL`), the JWT request interceptor, and the response interceptor.
- **Pagination is server-driven.** The response interceptor reads the `pagination` header and wraps
  the body in `PaginatedResult<T>` (`{ data, pagination }`). Pages use `currentPage` (default 1) and
  `itemsPerPage` (default 25).

### Paginated feeds: compose `FeedState`

[src/stores/base/feedState.ts](src/stores/base/feedState.ts) owns the predicate map, `pagingParams`,
`pagination`, the keyed item registry, `axiosParams`, the loading flag, and error routing to
`commonStore.setServerError`. Every paginated feed store composes it. A store that re-implements any
of that is a bug, not a style choice.

`FeedState` is held as a **field, never extended** — `makeAutoObservable` refuses to run on a class
with a superclass or subclass, and composition lets one store own several feeds (see
`listFeedStore`'s lists + saved items, `messageStore`'s messages + threads). Expose it through
delegating getters so consumers read `store.myGroups` rather than `store.feed.items`.

Options: `itemsPerPage`, `staticParams` (appended to every request, e.g. notifications' `all=true`),
and `clearStrategy` — `"firstPage"` (default: clear on page 1, append after — what a virtualized
feed wants), `"always"` (single-page feeds), or `"never"`.

`feed.load` **never rejects**: failures land on `feed.error` and `commonStore.error` instead of
becoming an unhandled rejection that renders as a silently empty feed.

### Loading and empty states

One treatment across the app, so no two screens disagree:

- Loading → `SkeletonLoader` from [src/common/CustomLoader.tsx](src/common/CustomLoader.tsx).
- Empty → `NoRecordsTitle` from [src/common/Titles.tsx](src/common/Titles.tsx), with a sentence that
  names what is missing ("Not a member of any group yet").
- Failed → see §6.

Do not hand-roll a spinner or an "it's empty" paragraph inside a feature.

## 6. When things go wrong

Not every error should take down the page. Three layers, and every failure picks one:

1. **Render crashes** → the React error boundary in
   [src/common/ErrorBoundary.tsx](src/common/ErrorBoundary.tsx). Router-thrown errors use its
   `RouteErrorElement`, wired as the route table's `errorElement` — react-router's own unstyled
   fallback otherwise wins over any React boundary above it.
2. **Server errors the user must see** → `commonStore.setServerError(...)`, surfaced through the
   shared alert layer. `FeedState.load` routes here automatically.
3. **Errors we only want to know about** → logged in the axios response interceptor in `agent.ts`,
   which switches on status (400/401/403/404/500) and does not surface UI noise for them.

A `catch` that swallows an error without doing one of those three is not acceptable.

## 7. Forms and validation

Forms are everywhere, so there is one way to build them.

- **Formik** for every upsert, with **Yup** schemas for validation.
- Field-level UI comes from `common/`: `Inputs`, `Select`, `MultiSelect`, `RadioBoxes`,
  `CheckboxCard`, `Buttons`. Do not re-style a raw `<input>` in a feature.
- Client-side and server-side validation messages render in the same place, the same way.
- **Wizards** keep step-to-step form state in a MobX store (rule 2 of §3) — the value must outlive
  each step's component. A single-step form does not need a store.

## 8. Breaking the rules on purpose

Sometimes following a guideline exactly makes the code worse. That is fine. The rule is: **step
outside deliberately, and leave a comment saying why**, so the next person is not left guessing.

Currently documented exceptions:

- **Virtualization** — long feeds render through
  [src/components/shared/VirtualizedFeed.tsx](src/components/shared/VirtualizedFeed.tsx)
  (react-virtuoso), which owns its own scroll/height handling and needs `clearStrategy: "firstPage"`.
- **Web workers** — data prefetched on app initialization runs in `src/webWorkers/` against
  `utils/workerFunctions/`. Worker bundles must not import `@stores/index`: `agent.ts` reads the JWT
  straight from `Auth` for exactly this reason (importing the store graph pulled in `modalStore`,
  whose module scope constructs a Worker, so every worker spawned another worker, forever).
- **Realtime** — live spaces use WebRTC via `utils/infrastructure/spaceRtc.ts` rather than the axios
  clients.
- **AI** — Yumna talks to a Gradio client (`utils/infrastructure/gradio.ts`), streaming rather than
  request/response.
- **Web3** — wagmi/viem login sits beside the Supabase session rather than inside it.
- **PDF** — `components/pdf/*` renders with `@react-pdf/renderer`, which does not accept Tailwind
  classes; inline style objects there are expected (§11).

## 9. Permissions

Two separate checks, handled separately:

1. **Route-level** — whole pages a signed-out user cannot use are listed in
   `ROUTES_USER_CANT_ACCESS` ([src/utils/constants/index.ts](src/utils/constants/index.ts)). On those
   routes the login modal is non-dismissable; everywhere else it can be closed.
2. **Element-level** — a single button or section hidden on a page the user is otherwise allowed to
   see (follow/unfollow, edit-profile, moderator actions). These branch on the viewer's relationship
   to the entity (`RelationshipType`), not on the route.

Do not fold one into the other — "can you be here" and "can you do this here" answer different
questions.

## 10. Keeping things fast

- `useMemo` / `useCallback` for derived values and handlers that are not state — this is the default
  in this codebase, and it keeps `observer` components from re-subscribing every render.
- `React.memo` on a component only when a re-render has actually been **measured** as a problem.
  Memoizing everything adds complexity without a real gain.
- Long lists virtualize (§8) rather than rendering thousands of nodes.
- Startup data prefetches in web workers so the main thread stays responsive.
- Lazy-load heavy routes where it measurably helps, not as a habit.

## 11. Styling and theming

- **Tailwind classes only.** No inline `style` objects, with three documented exceptions: values
  computed at runtime (a measured height, a dynamic background image URL), third-party render
  targets that do not accept classes (`@react-pdf/renderer`), and animation values driven by Framer
  Motion.
- Every surface gets both light and `dark:` variants. Dark mode is a store-backed toggle
  (`commonStore` + `layout/DarkSwitch.tsx`), not a media query.
- Brand accent is `#55a8c2`; dark surfaces are `#0e1517` / `#1d2a2e`. Reuse those rather than
  introducing new near-identical hexes.
- Spacing, radius, and type scale come from Tailwind's scale — no magic pixel values.

## 12. Our shared toolbox

Before building something from scratch, look in [src/common/](src/common/): `Accordion`, `Alerts`,
`AuthModals`, `Buttons`, `CheckboxCard`, `Containers`, `CustomLoader`, `EmojiPopover`,
`ErrorBoundary`, `IconButtons`, `Image`, `Inputs`, `Links`, `Modal`, `MoreSection`, `MultiSelect`,
`RadioBoxes`, `SearchBar`, `Select`, `Tabs`, `Titles`, plus the shared form and modal shells.

If you find yourself copying a component out of `common/` to tweak it, add a prop instead.

## 13. Little helpers

Formatting and conditional-render helpers too small to be components live in
[src/utils/index.ts](src/utils/index.ts) and `utils/constants/`. Written once, reused everywhere — a
date formatter or a truncation rule should not exist in three files.

## 14. Naming and shared types

- **PascalCase** for React components and their files; **camelCase** for everything else.
- Entity record models ported from sibling projects are `XxxRecord` (`GroupRecord`, `EventRecord`,
  `ProductRecord`). Their `id` is a numeric `number`, unlike the uuid strings used by native ALSaqr
  social entities.
- **All enums live in [src/models/enums.ts](src/models/enums.ts)** — including tab keys. A tab key
  defined as a loose string constant next to the component that uses it is a bug: `ProfileTab`,
  `ExploreTabs`, `SettingsTabs`, `NotificationTabs`, `SidebarTabs`, and `FilterKeys` are the single
  source of truth.
- Other models live one-per-domain in `src/models/`; `typings.d.ts` holds commonly used shared types
  (excluding enums).
- Environment variables live in `.env` (prod) / `.env.local` (dev); the api base url is
  `VITE_PUBLIC_BASE_API_URL`.
- **DRY** — before adding a helper, model, or component, check whether it already exists.

## 15. Testing

- Playwright specs live in [tests/](tests/), named `<domain>.spec.ts`, alongside shared helpers in
  `tests/reusableFunctions.ts`.
- Coverage bar is ~90%. **Run the suite before merging any change** — do not merge below the bar.
- Elements under test carry a `data-testid`, lowercase and unspaced (`groupstab`, `productcard`,
  `errorboundary`). Prefer `getByTestId` over brittle text or CSS selectors.
- Store-layer behaviour is driven through the `window.__alsaqrTest` bridge in `stores/index.ts`
  (DEV-only), so store specs need neither a session nor a live backend.
- Every new user-visible surface gets three assertions: it renders, its populated state, its empty
  state.

## 16. Making it usable for everyone

- Interactive elements are reachable and operable by keyboard. A `div` with an `onClick` needs a
  `role`, a `tabIndex`, and an `Enter`/`Space` handler — or it should be a `<button>`.
- Composite widgets carry their ARIA contract: tabs use `role="tablist"` / `role="tab"` /
  `role="tabpanel"` with `aria-selected` and `aria-controls`, and arrow keys move between tabs.
- Images have `alt`; decorative SVGs have `aria-hidden="true"`.
- Live regions (errors, alerts) use `role="alert"` / `aria-live`.
- Text meets contrast in **both** themes — check the `dark:` variant, not just the light one.

---

# SDD Workflow

## Specification

- Client side application where users can login using oauth, they can create posts, lists,
  communities, community discussions, direct message other users, follow other users, save items to
  list.
- Post can be liked, bookmarked, and reposted by a user.
- User can create a post which is considered a comment, which is considered a reply.
- A user profile contains their recent posts, bookmarked posts, liked posts, reposted posts, and
  replied posts (comments that were created in response to a post).
- A user profile **also surfaces the user's cross-project memberships and activity**:
    - **Communities** the user is a member of. *(native ALSaqr entity)*
    - **Community discussions** the user is part of (has posted in or joined). *(native ALSaqr entity)*
    - **Groups** the user is a member of. *(ported from the meetup project — `alsaqr-meetup`)*
    - **Events** the user has attended. *(ported from the meetup project — `alsaqr-meetup`)*
    - **Products** the user is selling and buying. *(ported from the zook project — `alsaqr-zook`)*
- Items that can be saved to a list is posts, communities, community discussions, and users.
- Users can post on posts, which would be considered a comment.

> **Provenance & data model.** Groups and events originate in `alsaqr-meetup`
> (https://github.com/AliA1997/alsaqr-meetup); products originate in `alsaqr-zook`
> (https://github.com/AliA1997/alsaqr-zook). Both sibling projects share this exact architecture
> (same stores/utils/models/features layout, same axios + MobX conventions). Reuse their models, api
> clients, and cards when porting; do not redesign them. There is no separate "attended events"
> endpoint — reuse the existing my-events feed. Products split into **selling** and **buying**.

## Technical Planning

- Choose local vs shared state with §3, not by habit.
- Distinct entity pages (post, profile, community, community discussion) load through
  `agent.xxxApiClient` into local `useState`.
- Paginated and virtualized feeds compose `FeedState` in a MobX store (§5).
- The **profile-collection tabs** are single-fetch views owned by
  [src/components/userProfile/MainProfile.tsx](src/components/userProfile/MainProfile.tsx). They read
  the profile-scoped endpoints on `userApiClient` and hold rows in local state:

| Tab | `userApiClient` method | Endpoint |
| --- | --- | --- |
| Communities | `getUserProfileCommunities` | `/api/Profile/{username}/communities` |
| Discussions | `getUserProfileCommunityDiscussions` | `/api/Profile/{username}/communityDiscussions` |
| Groups | `getUserProfileGroups` | `/api/Profile/{username}/groups` |
| Events | `getUserProfileEvents` | `/api/Profile/{username}/events` |
| Products (selling) | `getUserProfileSellingProducts` | `/api/Profile/{username}/products` |
| Products (buying) | `getUserProfileBuyingProducts` | `/api/Profile/{username}/products/buying` |

> The selling endpoint predates the buying one and is unsuffixed; buying was added as
> `/products/buying`. If the backend settles on a symmetric `/products/selling` pair, change both
> here and in `userApiClient` together.

- The app-wide (non-profile-scoped) ported feeds keep their source-project clients:
  `groupsApiClient.getMyGroups` → `/api/Groups/my`, `eventsApiClient.getMyEvents` → `/api/Events/my`,
  `productApiClient.getSellingProducts` / `getBuyingProducts` →
  `/api/UserProducts/selling` and `/api/UserProducts/buying`.

## Task Breakdown

- Most of the project is complete. Do not scaffold new features from scratch; follow the user prompt
  for maintenance, fixes, or enhancements only, respecting the conventions above.
- Adding a profile-collection tab means: (1) the `XxxRecord` model in `models/`, (2) the api client
  method on the matching `xxxApiClient`, registered in `agent`, (3) a `ProfileTab` enum value,
  (4) a `UserXxxFeed` component in `components/userProfile/`, (5) the tab entry in `MainProfile`,
  (6) Playwright coverage.

## Implementation — reference patterns

**Models** — copied verbatim from the source projects (`models/group.ts`, `models/event.ts`,
`models/product.ts`).

```typescript
// models/group.ts  (from alsaqr-meetup)
export interface GroupRecord {
  id: number;
  slug: string;
  name: string;
  description: string;
  images: any[];
  cityId: number;
  city: string;
  country: string;
  topics: any[];
  attendees: any[];
  longitude: number;
  latitude: number;
  distanceKm: number;
}

// models/event.ts  (from alsaqr-meetup)
export interface EventRecord {
  id: number;
  slug: string;
  name: string;
  description: string;
  images: any[];
  groupId: number;
  groupName: string;
  citiesHosted: any[];
  distanceKm: number;
}

// models/product.ts  (from alsaqr-zook)
export interface ProductRecord {
  id: number;
  userId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  slug: string;
  attributes: { [key: string]: any };
  tags: string[];
  productCategoryId: number;
  category: string;
  latitude: number;
  longitude: number;
}
```

**Enum** (`models/enums.ts`) — tab keys are enum values, never inline strings (§14).

```typescript
export enum ProfileTab {
  Recent = 'recent',
  Reposts = 'reposts',
  Bookmarks = 'bookmarks',
  Replies = 'replied-posts',
  Likes = 'liked-posts',
  Media = 'media',
  // ported collections
  Communities = 'communities',
  Discussions = 'discussions',
  Groups = 'groups',                    // alsaqr-meetup
  Events = 'events',                    // alsaqr-meetup
  ProductsSelling = 'products-selling', // alsaqr-zook
  ProductsBuying = 'products-buying',   // alsaqr-zook
}
```

**API client** — axios object literal in `src/utils/api/`, registered in the `agent` aggregator.

```typescript
// utils/api/groupsApiClient.ts  (from alsaqr-meetup)
import axios from "axios";
import { axiosResponseBody } from "./agent";

export const groupsApiClient = {
    getMyGroups: (params: URLSearchParams | undefined) =>
        axios.get(`/api/Groups/my`, { params }).then(axiosResponseBody),
};

// utils/api/agent.ts — every client is aggregated here
const agent = {
  // ...existing clients
  groupsApiClient,
  eventsApiClient,
  productApiClient,
};
export default agent;
```

**Feed store** (paginated feeds only) — compose `FeedState`, do not hand-roll the mechanics.

```typescript
import { makeAutoObservable } from "mobx";
import { PagingParams } from "@models/common";
import { GroupRecord } from "@models/group";
import agent from "@utils/api/agent";
import FeedState from "./base/feedState";
import { store } from ".";

export default class MyGroupsFeedStore {
  feed = new FeedState<GroupRecord, number>((group) => group.id, { itemsPerPage: 25 });

  constructor() {
    makeAutoObservable(this);
  }

  get myGroups() { return this.feed.items; }
  get loadingInitial() { return this.feed.loadingInitial; }
  get pagination() { return this.feed.pagination; }
  get pagingParams() { return this.feed.pagingParams; }
  get predicate() { return this.feed.predicate; }

  setPagingParams = (pagingParams: PagingParams) => this.feed.setPagingParams(pagingParams);
  setPredicate = this.feed.setPredicate;
  setMyGroup = (groupId: number, group: GroupRecord) => this.feed.setItemByKey(groupId, group);
  resetFeedState = this.feed.reset;

  loadMyGroups = async (refresh?: boolean) => {
    // Feed-specific params go on the predicate; FeedState folds them into axiosParams.
    this.feed.setPredicate("latitude", store.commonStore.userIpInfo?.latitude ?? "27.7671");
    this.feed.setPredicate("longitude", store.commonStore.userIpInfo?.longitude ?? "82.6384");

    return this.feed.load((params) => agent.groupsApiClient.getMyGroups(params), { refresh });
  };
}
```

Register it in [src/stores/index.ts](src/stores/index.ts) — both the `Store` interface and the
`store` object.

**Profile collection component** (`components/userProfile/UserGroupsFeed.tsx`) — a presentational
feed that takes its rows as a prop, uses the shared container and empty-state, and carries a
`testId`.

```tsx
import { useRef } from "react";
import type { GroupRecord } from "@models/group";
import { ContentContainerWithRef } from "@common/Containers";
import { NoRecordsTitle } from "@common/Titles";
import GroupCard from "@components/group/GroupCard";

interface Props {
  groups: GroupRecord[];
}

// Displays the meetup groups the user is a member of.
function UserGroupsFeed({ groups }: Props) {
  const containerRef = useRef(null);

  return (
    <ContentContainerWithRef
      classNames="text-left grid w-full max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
      innerRef={containerRef}
      testId="usergroupsfeed"
    >
      {groups && groups.length ? (
        groups.map((group) => <GroupCard key={group.id} group={group} showDistance />)
      ) : (
        <NoRecordsTitle>Not a member of any group yet.</NoRecordsTitle>
      )}
    </ContentContainerWithRef>
  );
}

export default UserGroupsFeed;
```

**Wiring into the profile** — `MainProfile` owns the rows in `useState`, passes them to the shared
`Tabs` component keyed by `ProfileTab`, and fetches the tab's data in `loadOnTabSwitch`. The Events
and Products tabs are the same shape. Keep one shared loading/empty treatment to stay DRY (§5).

## Validation

- Validated via the Playwright suite (~90% coverage) in [tests/](tests/). Run it before merging.
- Profile tabs (communities, discussions, groups, events, products-selling, products-buying) each
  have coverage: tab renders, populated state, empty state. Do not merge below the coverage bar.
- Run `pnpm build` (`tsc -b && vite build`) and `pnpm lint` before merging. Use **pnpm**, not npm.
