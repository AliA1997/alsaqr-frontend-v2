# ALSaqr Social Media App

## Tech Stack
- React 18.3.1
- Typescript 5.5.3
- Eslint 9.9.0
- Typescript eslint 8.0.1
- Vite 5.4.1
- Playwright +1.56.1
- Framer Motion 7.6.18
- Mobx +6.13.6
- Formik 2.4.6
- Tailwind CSS 4.1.14
- Gradio Javascript client +2.0.0
- Supabase Client +2.58.0
- React Router +7.2.1
- Axios (api client layer — see Architectural Principles)

## Architectural Principles
- Routing with tan-stack router
- Components separated by features, components, layout, and common folder.
- Environment variables held in .env files
    - .env on prod
    - .env.local on dev
    - api base url read from `VITE_PUBLIC_BASE_API_URL`
- Playwright tests are in tests folder.
- Web workers for loading data on app initialization.
- Check session on initialization of web application (Supabase client owns auth/session; data access does NOT go through the Supabase client — see below).
- Mobx store in stores folder.
- Typescript models, and enums in the models folder.
- typings.d.ts has common use models, excluding enums.
- utils folder holds utility functions that are used in multiple components.
    - utils folder holds api client files that are responsible for communicating with the server.
    - Api clients are **axios object literals** named `xxxApiClient`, each method returning `axios.get(url, { params }).then(axiosResponseBody)`. Query params are passed as `URLSearchParams`. All clients are aggregated into the default `agent` export in `utils/common.ts`.
    - Pagination is server-driven: a response interceptor reads the `pagination` header and wraps the body in `PaginatedResult<T>` (`{ data, pagination }`). Pages use `currentPage` (default 1) and `itemsPerPage` (default 25).

## Code Standards
- DRY
- useMemo, and useCallback react hooks for variable declaration that is not state.
- Use the useState hook for components that load data unique to an entity. Such as a post page that will load a specific post.
- For upserting data, use Formik components.
    - Use mobx store to control the form between steps in a wizard, in use cases when a wizard needs to be used.
- Use tailwind css classes for styling components, prevent using inline styles unless specified.
- camelCase naming convention for all non component variables.
- PascalCase naming convention for React components.
- Entity record models are named `XxxRecord` (e.g. `GroupRecord`, `EventRecord`, `ProductRecord`). Note their `id` is a numeric `number`, unlike the uuid-string ids used by native social entities.

## SDD Workflow

### Specification
- Client side application where users can login using oauth, they can create posts, lists, communities, community discussions, direct message other users, follow other users, save items to list.
- Post can be liked, bookmarked, and reposted by a user.
- User can create a post which is considered a comment, which is considered a reply.
- A user profile contains their recent posts, bookmarked posts, liked posts, reposted posts, and replied posts (comments that were created in response to a post).
- A user profile **also surfaces the user's cross-project memberships and activity**:
    - **Communities** the user is a member of. *(native ALSaqr entity)*
    - **Community discussions** the user is part of (has posted in or joined). *(native ALSaqr entity)*
    - **Groups** the user is a member of. *(ported from the meetup project — `alsaqr-meetup`)*
    - **Events** the user has attended. *(ported from the meetup project — `alsaqr-meetup`; "attended" maps to the existing "my events" feed)*
    - **Products** the user is selling and buying. *(ported from the zook project — `alsaqr-zook`)*
- Items that can be saved to a list is posts, communities, community discussions, and users.
- Users can post on posts, which would be considered a comment.

> **Provenance & data model.** Groups and events originate in `alsaqr-meetup` (https://github.com/AliA1997/alsaqr-meetup); products originate in `alsaqr-zook` (https://github.com/AliA1997/alsaqr-zook). Both sibling projects share this exact architecture (same stores/utils/models/features layout, same axios + MobX feed-store conventions). Reuse their models, api clients, and feed stores when porting; do not redesign them. There is no separate "attended events" endpoint — reuse the existing `getMyEvents` feed. There is no single "my products" endpoint — products split into **selling** (`/api/UserProducts/selling`) and **buying** (`/api/UserProducts/buying`).

### Technical Planning
- When loading data use store when you need the data to be set.
- In cases when a distinct page needs to be loaded such as a post page, profile info, community page, community discussion page, etc, use the api client data access object from the api client files.
- **The profile-collection views (communities, discussions, groups, events, products) are paginated feeds, so they use the STORE pattern, not useState.** Each collection gets a dedicated MobX feed store modeled on `alsaqr-meetup`'s `MyGroupsFeedStore` / `MyEventsFeedStore`: a `predicate` Map for filters/search, `pagingParams` + `pagination`, a `Map<number, XxxRecord>` registry, an `axiosParams` getter, and a `loadXxx` action that calls the matching `agent.xxxApiClient` method inside `runInAction`.
- Each feed store reads from an axios api client method that already exists in the source projects:
    - groups → `agent.groupsApiClient.getMyGroups(params)` → `/api/Groups/my`
    - events → `agent.eventsApiClient.getMyEvents(params)` → `/api/Events/my`
    - products → `agent.productApiClient.getSellingProducts(params)` → `/api/UserProducts/selling`, and `getBuyingProducts(params)` → `/api/UserProducts/buying`
    - communities / discussions → existing native ALSaqr profile api client methods

### Task Breakdown
- Most of the project is complete. Do not scaffold new features from scratch; follow the user prompt for maintenance, fixes or enhancements only, respecting the conventions above.
- **APPROVED net-new work (scoped exception):** add the profile-collection views described in the Specification — communities, community discussions, groups (from `alsaqr-meetup`), events (from `alsaqr-meetup`), and products (selling + buying, from `alsaqr-zook`). This is the only sanctioned new feature; everything outside it remains maintenance-only.
- Port, don't reinvent. For each ported collection: (1) copy the `XxxRecord` model into `models/`, (2) copy the api client method(s) into the matching `xxxApiClient` and register the client in the `agent` aggregator (`utils/common.ts`), (3) copy/adapt the `MyXxxFeedStore` and register it in `stores/index.ts` (both the `Store` interface and the `store` object), (4) add a `ProfileTab` enum value, (5) add the tab component, (6) wire the tab into the existing profile route, (7) add Playwright coverage.

### Implementation
- All features described in the original Specification are implemented and integrated.
- The profile-collection views follow the reference patterns below, copied from the sibling projects.

#### Reference patterns — Profile collection views

**Models** — copy verbatim from the source projects (`models/group.ts`, `models/event.ts`, `models/product.ts`).
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

**Enum** (`models/enums.ts`) — extend, don't replace, the existing profile tabs.
```typescript
export enum ProfileTab {
  Posts = 'posts',
  Bookmarks = 'bookmarks',
  Likes = 'likes',
  Reposts = 'reposts',
  Replies = 'replies',
  // ported collections
  Communities = 'communities',
  Discussions = 'discussions',
  Groups = 'groups',         // alsaqr-meetup
  Events = 'events',         // alsaqr-meetup
  ProductsSelling = 'products-selling', // alsaqr-zook
  ProductsBuying = 'products-buying',   // alsaqr-zook
}
```

**API client** — axios object literal. These methods already exist in the source projects; register the client in the `agent` aggregator.
```typescript
// utils/groupsApiClient.ts  (from alsaqr-meetup)
import axios from "axios";
import { axiosResponseBody } from "./common";

export const groupsApiClient = {
  getMyGroups: (params: URLSearchParams | undefined) =>
    axios.get(`/api/Groups/my`, { params }).then(axiosResponseBody),
};

// utils/eventsApiClient.ts  (from alsaqr-meetup)
export const eventsApiClient = {
  getMyEvents: (params: URLSearchParams | undefined) =>
    axios.get(`/api/Events/my`, { params }).then(axiosResponseBody),
};

// utils/productApiClient.ts  (from alsaqr-zook)
export const productApiClient = {
  getSellingProducts: (params: URLSearchParams | undefined) =>
    axios.get(`/api/UserProducts/selling`, { params }).then(axiosResponseBody),
  getBuyingProducts: (params: URLSearchParams | undefined) =>
    axios.get(`/api/UserProducts/buying`, { params }).then(axiosResponseBody),
};

// utils/common.ts — add the new clients to the aggregated agent
const agent = {
  // ...existing clients
  groupsApiClient,
  eventsApiClient,
  productApiClient,
};
export default agent;
```

**Feed store** (`stores/myGroupsFeedStore.ts`) — modeled on the real `MyGroupsFeedStore`. Events/products stores are structurally identical; swap the record type and the `agent.xxxApiClient` call.
```typescript
import { makeAutoObservable, runInAction } from "mobx";
import { Pagination, PagingParams } from "@models/common";
import { GroupRecord } from "@models/group";
import agent from "@utils/common";
import { store } from ".";

export default class MyGroupsFeedStore {
  loadingInitial = false;
  predicate = new Map();
  pagingParams: PagingParams = new PagingParams(1, 25);
  pagination: Pagination | undefined = undefined;
  myGroupRegistry: Map<number, GroupRecord> = new Map<number, GroupRecord>();

  constructor() {
    makeAutoObservable(this);
  }

  setLoadingInitial = (value: boolean) => { this.loadingInitial = value; };
  setPagination = (value: Pagination | undefined) => { this.pagination = value; };
  setMyGroup = (groupId: number, group: GroupRecord) => { this.myGroupRegistry.set(groupId, group); };
  resetFeedState = () => { this.predicate.clear(); this.myGroupRegistry.clear(); };

  get myGroups() {
    return Array.from(this.myGroupRegistry.values());
  }

  get axiosParams() {
    const params = new URLSearchParams();
    params.append("currentPage", this.pagingParams.currentPage.toString());
    params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
    params.append("latitude", store.commonStore.userIpInfo?.latitude?.toString() ?? "27.7671");
    params.append("longitude", store.commonStore.userIpInfo?.longitude?.toString() ?? "82.6384");
    this.predicate.forEach((value, key) => params.append(key, value));
    return params;
  }

  loadMyGroups = async () => {
    this.setLoadingInitial(true);
    try {
      const { items, pagination } = await agent.groupsApiClient.getMyGroups(this.axiosParams);
      runInAction(() => {
        items.forEach((group: GroupRecord) => this.setMyGroup(group.id, group));
        this.setPagination(pagination);
      });
    } finally {
      this.setLoadingInitial(false);
    }
  };
}
```

**Store registration** (`stores/index.ts`) — add to both the `Store` interface and the `store` object.
```typescript
import MyGroupsFeedStore from './myGroupsFeedStore';
// interface Store { ... myGroupsFeedStore: MyGroupsFeedStore; ... }
// export const store: Store = { ... myGroupsFeedStore: new MyGroupsFeedStore(), ... }
```

**Tab component** (`features/profile/components/ProfileGroupsTab.tsx`) — feed data lives in the store, so the component is an `observer` reading from `useStore()`; `useEffect` triggers the load, Tailwind for styling.
```tsx
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';

export const ProfileGroupsTab = observer(function ProfileGroupsTab() {
  const { myGroupsFeedStore } = useStore();
  const { myGroups, loadingInitial, loadMyGroups, resetFeedState } = myGroupsFeedStore;

  useEffect(() => {
    void loadMyGroups();
    return () => resetFeedState();
  }, [loadMyGroups, resetFeedState]);

  if (loadingInitial) {
    return <div className="p-4 text-sm text-gray-400">Loading groups…</div>;
  }
  if (myGroups.length === 0) {
    return <div className="p-4 text-sm text-gray-400">Not a member of any group yet.</div>;
  }

  return (
    <ul className="divide-y divide-gray-800">
      {myGroups.map((group) => (
        <li key={group.id} className="flex items-center gap-3 p-4">
          <span className="font-medium">{group.name}</span>
          <span className="ml-auto text-sm text-gray-400">
            {group.city}, {group.country}
          </span>
        </li>
      ))}
    </ul>
  );
});
```
The Events tab and the two Products tabs (selling / buying) are the same component shape against `myEventsFeedStore` / the products feed store(s). Keep one shared loading/empty treatment to stay DRY.

**Wiring into the profile route** — switch on the active `ProfileTab` value from the tan-stack router search params and render the matching observer tab component.

### Validation
- Validated via the playwright test suite (~90% coverage) located in the tests folder. Run the suite before merging any change.
- New profile tabs (communities, discussions, groups, events, products-selling, products-buying) must each have Playwright coverage: tab renders, populated state, and empty state. Do not merge below the existing coverage bar.