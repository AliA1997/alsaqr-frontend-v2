# Replace Virtualization and Add Audio Discussion
## Overview
- Replace current virtualization for all the feeds, and use react-virtuso.
- Add audio non-savable audio discussions for communities, and community discussions.
- For commmunity audio discussions/spaces, only community members can join them. Also other community members can't join during the audio discussion.
- For community discussion audio discussions/spaces, only community discussion members can join them. Only community, community discussion members can only join the discussion.

## Implementation Steps
- First install react virtuso
    - For the project install react-virtuso(npm install react-virtuoso)
    - Then install the skills for react-virtuso(npx skills add virtuoso-dev/skills --skill react-virtuoso)
- Then replace all feeds with react virutuso, instead of IntersectionObserver implementation.
```typescript


  async function getRecords() {
    const paramsFromQryString = convertQueryStringToObject(
      window.location.search
    );


    if (
      (paramsFromQryString.currentPage && paramsFromQryString.itemsPerPage)
      && (paramsFromQryString.currentPage !== predicate.get('currentPage')
        || paramsFromQryString.itemsPerPage !== predicate.get('itemsPerPage')
        || paramsFromQryString.searchTerm != predicate.get('searchTerm'))) {

      setPagingParams(new PagingParams(paramsFromQryString.currentPage, paramsFromQryString.itemsPerPage));
      setPredicate('searchTerm', paramsFromQryString.searchTerm);
    }

    if (!lists.length)
      await loadFeedRecords();

  }

  const fetchMoreItems = async (pageNum: number) => {
    setPagingParams(new PagingParams(pageNum, 25))
    await loadFeedRecords();
  };
  const loadFeedRecords = useThrottle(async () => {

    await loadLists();
  }, 5_000);

  useEffect(() => {
    const isLoggedIn = inTestMode() ? auth?.isLoggedIn() : currentSessionUser?.id;

    if (isLoggedIn) {
      getRecords();
      setMounted(true);
    }

    return () => {
      setMounted(false);
    }
  }, [currentSessionUser?.id, auth]);


  const LoadMoreTrigger = () => {
    return (
      <div ref={loaderRef} style={{ height: '20px' }}>
        {loadingInitial && <div>Loading more lists...</div>}
      </div>
    );
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        const currentPage = pagination?.currentPage ?? 1;
        const itemsPerPage = pagination?.itemsPerPage ?? 25;
        const totalItems = pagination?.totalItems ?? 0;

        const nextPage = currentPage + 1;
        const totalItemsOnNextPage = nextPage * itemsPerPage;
        const hasMoreItems = (totalItems > totalItemsOnNextPage);
        if (firstEntry?.isIntersecting && !loadingInitial && hasMoreItems && mounted) {
          fetchMoreItems(pagingParams.currentPage + 1);
        }
      },
      {
        root: containerRef.current,
        rootMargin: '10px',
        threshold: 0.2
      }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, []);

```
### For Twitter Spaces clone
- create a spaceStore that will hold registry for communitySpaces, and communityDiscussionSpaces.
- Join the room, join supabase realtime channel. Who's here, who's speaking, and everyone's role. Souce for what audio to pull.
- Open an audio connection, build on RTCPeerConnection per participant, and keep it alive for whole visit.
- Let speakers talk(publish). Grab the mic, send an offer to backend, and apply the answer it returns. The backend registers the track and announces it to everyone else.
- Let the listeners hear(subscribe). For each speaker, ask the backend for their audio. Here the SFU sends you an offer (the reverse of publishing), so you answer it, then play the incoming stream. Behind an autoplay friendly user gesture(a "Join" tap) attach each stream to a hidden <audio> element.
- Keep it live as people change. When someone starts or stops speaking, subscribe to or tear down that one track - without disturbing others. Handle mute(toggle the track) and host the actions like approving a raised hand.(which promotes a listener to run the publish step).
- Clean up and recover. On leave, unmount or tab close, close the tracks and connection and mark the user as "left" - otherwise you keep paying for audio noboy's hearing. If the connection drops, restart it and re-pull the current speakers.

## Rules
- It initially loads 1000 items, then after end of list, get items by page.
- App secret never touches the browser. Ever SFU interaction goes through the .net proxy. The client only ever hits your own API.
- SFU answers on publish, you sends an offer, SFU returns an answer. Subscribe -> SFU returns an offer, you answer. Do not mix these up.
- Renegotiation ordering is strict: setRemoteDescription -> createAnswer -> setLocalDescription -> send. No reordering, no skipper.
- Backend is authoritative for roles and permissions. The frontend only reflects role state; it never decides who may speak. Client is just flipping its own role , must have no audio effect until the bakend has actually granted a publish.
- Presence is supabase, media is cloudflare - never coflate. Do not treat SFU track as proof of membership. They are two independent truths to reconcile.
- Mute is local + broadcast. track.enabled = false.stops audio immediantly; Also broadcast the mute state for UI. Only unpublish on leave or demotion. - never on a plain mute.
- Never record - no egress, capture, or transcription calls, ever. Ephemerality is guaranteed by omission, not by a flag.
- Every exit path cleans up. Unmount, explicit leave, network death, and tab close must all converage on the same teardown.
- Listeneres are receive-only: No mic access, no send transceiver, until/unless promoted.
- MobX hygeine -> Row components stay observer; avoid recreating the participants array identity each render.

## Acceptance
- 1000 items are loaded to the feed, and it's still performant.
- 1000 items are initially loaded, then update paging params when reaches end of list. Afterwards it gets the next page.
- Host starts a space, a second user joins as listener and hears the  host within 2 seconds.
- A listener raises a hand -> it appears in the host's UI -> on approval the listener can speak and every other participant hears them.
- Adding an nth speaker does not interrupt existing listeners audio(renegotiation correctness under concurrency).
- Mute silences the muted user for everyone within one control tick; unmute resumes without a re-publish.
- Leaving closes tracks and the PC, egress stops - verified by no lingering audio and no active pulls for that user.
- Refresh or transient network loss; the participant rejoins cleanly ICE restart recovers audio without a full page reload. 
- The roster reflects joins, leaves, and role changes in near -real-time across at least two seperate client/devices.
- started_at and ended_at are recorded; no audio artifact exists in any store afterward
- Autoplay gate prevents the "connected by slient" failure on first load.

## Out of Scope
- Edit to how data is retrieved from the feed via the feedStore.
- Direct SFU Http Calls - the backend proxies all of them
- Token minting, auth, and any role/permission decision backend only.
- Recording, transcription, or persistence of audio. 
- The source of truth room/track registry, owned by backend + supabase, the clien tis a consumer.
- TURN provisioning, Cloudflare handles it; the client only sets STUN/IC config.
- Video, screen share, spatial audio.
- SFU scaling, cascading, region routing.
- Discovery feed beyond subscribing to the "live now" list.
- Native mobile clients (this spec web react only).


## Reference Code
1) Reference code for the virtualization using react-virtuso, NOTE the totalItems would take place of totalCount, and it would come from pagination. Look at feed code.
```typescript
import { Virtuoso } from 'react-virtuoso'
import { useMemo } from 'react'

export default function App() {
  const users = useMemo(() => {
    return Array.from({ length: 100000 }, (_, index) => ({
      name: `User ${index}`,
      size: Math.floor(Math.random() * 40) + 70,
      description: `Description for user ${index}`,
    }))
  }, [])

  return (
    <Virtuoso
      style={{ height: '100%' }}
      totalCount={users.length}
      itemContent={(index) => {
        const user = users[index]
        return (
          <div
            style={{
              padding: '0.5rem',
              height: `${user.size}px`,
              borderBottom: `1px solid var(--border)`,
            }}
          >
            <p>
              <strong>{user.name}</strong>
            </p>
            <div>{user.description}</div>
          </div>
        )
      }}
    />
  )
}
```
2) Reference Code from postFeedStore to understand data retrieved:
```typescript
import { makeAutoObservable, runInAction } from "mobx";
import { CreateListOrCommunityForm, CreateListOrCommunityFormDto, ListToDisplay } from "@typings";
import { Pagination, PagingParams } from "@models/common";
import agent from "@utils/api/agent";
import { ListItemToDisplay } from "@models/list";
import { DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM } from "@utils/constants";
import { store } from ".";

export default class ListFeedStore {

    constructor() {
        makeAutoObservable(this);
    }


    loadingInitial = false;
    loadingListItems = false;
    predicate = new Map();
    savedListItemsPredicate = new Map();
    setPredicate = (predicate: string, value: string | number | Date | undefined) => {
        if (value) {
            this.predicate.set(predicate, value);
        } else {
            this.predicate.delete(predicate);
        }
    }
    pagingParams: PagingParams = new PagingParams(1, 25);
    pagination: Pagination | undefined = undefined;
    savedListItemsPagingParams: PagingParams = new PagingParams(1, 10);
    savedListItemsPagination: Pagination | undefined = undefined;

    listsRegistry: Map<string, ListToDisplay> = new Map<string, ListToDisplay>();
    selectedList: ListToDisplay | undefined = undefined;
    listInfoForSavedListItems: any | undefined = undefined;
    savedListItemsRegistry: Map<string, ListItemToDisplay> = new Map<string, ListItemToDisplay>();
    loadingUpsert = false;
    listCreationForm: CreateListOrCommunityForm = DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM;
    currentStepInListCreation: number | undefined = undefined;

    setListInfoForSavedListItems = (val: any | undefined) => {
        this.listInfoForSavedListItems = val;
    }
    setSelectedList = (val: ListToDisplay | undefined) => {
        this.selectedList = val;
    }
    setLoadingUpsert = (value: boolean) => {
        this.loadingUpsert = value;
    }
    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }
    setLoadingListItems = (value: boolean) => {
        this.loadingListItems = value;
    }
    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPagination = (pagination: Pagination) => {
        this.pagination = pagination;
    }
    setSavedListItemsPagingParams = (pagingParams: PagingParams) => {
        this.savedListItemsPagingParams = pagingParams;
    }
    setSavedListItemsPagination = (pagination: Pagination) => {
        this.savedListItemsPagination = pagination;
    }
    setSearchQry = (val: string) => this.predicate.set('searchQry', val);
    setCurrentStepInListCreation = (currentStep: number) => {
        this.currentStepInListCreation = currentStep;
    }
    setListCreationForm = (val: CreateListOrCommunityForm) => {
        this.listCreationForm = val;
    }

    setList = (listId: string, list: ListToDisplay) => {
        this.listsRegistry.set(listId, list);
    }
    setSavedListItem = (listItemId: string, listItem: ListItemToDisplay) => {
        this.savedListItemsRegistry.set(listItemId, listItem);
    }

    resetPredicate = () => {
        this.predicate.clear();
    }
    resetPagingParams = () => {
        this.pagingParams = new PagingParams(1, 25);
    }

    resetListsState = () => {
        this.pagingParams = new PagingParams(1, 25);
        this.predicate.clear();
        this.listsRegistry.clear();
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }
    get savedListItemsAxiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.savedListItemsPagingParams.currentPage.toString());
        params.append("itemsPerPage", this.savedListItemsPagingParams.itemsPerPage.toString());
        this.savedListItemsPredicate.forEach((value, key) => params.append(key, value));

        return params;
    }

    addList = async (newList: CreateListOrCommunityForm) => {

        this.setLoadingUpsert(true);
        try {
            const newListDto: CreateListOrCommunityFormDto = {
                name: newList.name,
                avatarOrBannerImage: newList.avatarOrBannerImage,
                tags: newList.tags,
                usersAdded: newList.usersAdded.map(u => u.id),
                postsAdded: newList.postsAdded.map(p => p.postId),
                isPrivate: 'private'
            };
            await agent.listApiClient.addList(newListDto)
            runInAction(() => {
                this.setListCreationForm(DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM);
                this.setCurrentStepInListCreation(0);
            });

            store.modalStore.closeModal();

            await this.loadLists();
        } finally {
            this.setLoadingUpsert(false);
        }

    }

    savePostToList = async (postId: string, listId: string) => {

        this.setLoadingUpsert(true);
        try {
            await agent.listApiClient.saveItemToList(postId, "post", listId)

        } finally {
            this.setLoadingUpsert(false);
        }

    }
    saveUserToList = async (userToSaveId: string, listId: string) => {

        this.setLoadingUpsert(true);
        try {
            await agent.listApiClient.saveItemToList(userToSaveId, "user", listId)

        } finally {
            this.setLoadingUpsert(false);
        }

    }

    loadLists = async () => {
        this.setLoadingInitial(true);
        runInAction(() => {
            this.listsRegistry.clear();
        });

        try {
            const { items, pagination } = await agent.listApiClient.getLists(this.axiosParams);
            runInAction(() => {
                items.forEach((list: ListToDisplay) => {
                    this.setList(list.listId, list)
                });
            });

            this.setPagination(pagination);
        } catch (error) {
            console.log("ERROR:", error);
        } finally {
            this.setLoadingInitial(false);
        }

    }

    deleteList = async (listId: string) => {
        this.setLoadingUpsert(true);
        try {
            await agent.listApiClient.deleteList(listId);

            await this.loadLists();
        } finally {
            this.setLoadingUpsert(false);
        }
    }

    loadSavedListItems = async (listId: string) => {
        this.setLoadingListItems(true);
        runInAction(() => {
            this.savedListItemsRegistry.clear();
        });

        try {

            const { items, pagination } = await agent.listApiClient.getSavedListItems(this.savedListItemsAxiosParams, listId);
            runInAction(() => {
                items.forEach((listItem: ListItemToDisplay) => {
                    this.setSavedListItem(listItem.listItemId, listItem)
                });
            });
            this.setSavedListItemsPagination(pagination);
        } catch(error){
            console.log("Get List Items Error:", error);
        } finally {
            this.setLoadingListItems(false);
        }

    }

    deleteSavedListItem = async (listId: string, listItemId: string) => {
        this.setLoadingUpsert(true);
        try {
            await agent.listApiClient.deleteSavedListItem(listId, listItemId);

        } finally {
            this.setLoadingUpsert(false);
        }
    }

    get lists() {
        return Array.from(this.listsRegistry.values());
    }

    get savedListItems() {
        return Array.from(this.savedListItemsRegistry.values());
    }
}
```
3) ListFeed component to understand how items are loaded on the feed currently:
```typescript
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CommonUpsertBoxTypes,
} from '@models/enums';
import type {
  ListToDisplay,
} from "@typings";
import { convertQueryStringToObject } from "@utils/index";

import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { PagingParams } from "@models/common";
import { NoRecordsTitle, PageTitle } from '@common/Titles';
import { ContentContainerWithRef } from "@common/Containers";
import ListItemComponent from "@components/list/ListItem";
import { SkeletonLoader } from "@common/CustomLoader";
import ListOrCommunityUpsertModal from "@common/ListOrCommunityUpsertModal";
import { OpenUpsertModalButton } from "@common/Buttons";
import { useThrottle } from "@hooks/useThrottle";
import { inTestMode, SEARCH_TERM_KEY_FOR_PREDICATE } from "@utils/constants";
import SearchBar from "@common/SearchBar";

interface Props {
}

const ListFeed = observer(({ }: Props) => {
  const { authStore, modalStore, listFeedStore } = useStore();
  const { auth, currentSessionUser } = authStore;
  const containerRef = useRef(null);
  const loaderRef = useRef(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const {
    setPagingParams,
    pagingParams,
    setPredicate,
    predicate,
    pagination,
    loadingInitial,
    lists,
    loadLists
  } = listFeedStore;
  const authUserId = useMemo(() => inTestMode() ? auth?.getUser()?.id : currentSessionUser?.id, [auth, currentSessionUser]);


  async function getRecords() {
    const paramsFromQryString = convertQueryStringToObject(
      window.location.search
    );


    if (
      (paramsFromQryString.currentPage && paramsFromQryString.itemsPerPage)
      && (paramsFromQryString.currentPage !== predicate.get('currentPage')
        || paramsFromQryString.itemsPerPage !== predicate.get('itemsPerPage')
        || paramsFromQryString.searchTerm != predicate.get('searchTerm'))) {

      setPagingParams(new PagingParams(paramsFromQryString.currentPage, paramsFromQryString.itemsPerPage));
      setPredicate('searchTerm', paramsFromQryString.searchTerm);
    }

    if (!lists.length)
      await loadFeedRecords();

  }

  const fetchMoreItems = async (pageNum: number) => {
    setPagingParams(new PagingParams(pageNum, 25))
    await loadFeedRecords();
  };
  const loadFeedRecords = useThrottle(async () => {

    await loadLists();
  }, 5_000);

  useEffect(() => {
    const isLoggedIn = inTestMode() ? auth?.isLoggedIn() : currentSessionUser?.id;

    if (isLoggedIn) {
      getRecords();
      setMounted(true);
    }

    return () => {
      setMounted(false);
    }
  }, [currentSessionUser?.id, auth]);


  const LoadMoreTrigger = () => {
    return (
      <div ref={loaderRef} style={{ height: '20px' }}>
        {loadingInitial && <div>Loading more lists...</div>}
      </div>
    );
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        const currentPage = pagination?.currentPage ?? 1;
        const itemsPerPage = pagination?.itemsPerPage ?? 25;
        const totalItems = pagination?.totalItems ?? 0;

        const nextPage = currentPage + 1;
        const totalItemsOnNextPage = nextPage * itemsPerPage;
        const hasMoreItems = (totalItems > totalItemsOnNextPage);
        if (firstEntry?.isIntersecting && !loadingInitial && hasMoreItems && mounted) {
          fetchMoreItems(pagingParams.currentPage + 1);
        }
      },
      {
        root: containerRef.current,
        rootMargin: '10px',
        threshold: 0.2
      }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, []);

  const commonUpsertBoxType = useMemo(() => CommonUpsertBoxTypes.List, [])

  const noRecordsTitle = useMemo(() => 'You don\'t have any lists', []);

  return (
    <div className="text-left col-span-7 scrollbar-hide max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <PageTitle>Lists</PageTitle>
      {authUserId && (
        <SearchBar
          fullWidth
          placeholder="Search your lists..."
          value={(predicate.get(SEARCH_TERM_KEY_FOR_PREDICATE) as string) ?? ""}
          onChange={(value) => setPredicate(SEARCH_TERM_KEY_FOR_PREDICATE, value)}
          onSearch={async () => {
            await loadLists();
          }}
          classNames="p-0"
        />
      )}
      <OpenUpsertModalButton
        testId="createlistbutton"
        onClick={() => modalStore.showModal(
          <ListOrCommunityUpsertModal
            loggedInUserId={currentSessionUser?.id!}
            type={commonUpsertBoxType}
          />
        )}
      >
        Create List
      </OpenUpsertModalButton>
      {loadingInitial || !mounted ? (
        <SkeletonLoader count={8} />
      ) : (
        <ContentContainerWithRef
          classNames='flex flex-wrap min-h-100 md:justify-start px-5'
          innerRef={containerRef}
        >
          <>
            {lists && lists.length
              ? lists.map((record: ListToDisplay, recordKey) => (
                <ListItemComponent
                  key={record.listId ?? recordKey}
                  listToDisplay={record}
                />
              ))
              : <NoRecordsTitle>{noRecordsTitle}</NoRecordsTitle>}
            <LoadMoreTrigger />
          </>
        </ContentContainerWithRef>
      )}
    </div>
  );
});


export default ListFeed;
```




### Audio - Spaces Implementation
1) Reference Code for PeerConnection factory:
```typescript
export function createPeer(): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
    bundlePolicy: "max-bundle",
  });
}
```

2) Mobx store skeleton:
```typescript
import { makeAutoObservable } from "mobx";

type Role = "host" | "speaker";

interface CommunityParticipant {
  userId: string;
  displayName: string;
  role: Role;
  muted: boolean;
  sfuSessionId?: string;
  trackName?: string;
}

export class CommunitySpaceStore {
  communityId: string;
  spaceId!: string;
  localRole: Role = "listener";
  participantRegistry = new Map<string, CommunityParticipant>();
  handRaises = new Set<string>();
  connection: "idle" | "connecting" | "live" | "reconnecting" = "idle";

  private pc?: RTCPeerConnection;
  private localStream?: MediaStream;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get speakers() {
    return [...this.participants.values()].filter(
      p => p.role === "host" || p.role === "speaker"
    );
  }

  setMuted(v: boolean) {
    this.localStream?.getAudioTracks().forEach(t => (t.enabled = !v));
    // also broadcast mute state over Supabase for other clients' UI
  }
}
```

3) Publish(speaker)
```typescript
async function publish(store: SpaceStore, spaceId: string) {
  const pc = createPeer();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const tx = pc.addTransceiver(stream.getAudioTracks()[0], {
    direction: "sendonly",
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const { answer } = await api.post(`/spaces/${spaceId}/publish`, {
    sdp: offer.sdp,
    mid: tx.mid,
  });

  await pc.setRemoteDescription(answer); // SFU answers on publish
  return { pc, stream };
}
```

4) Subscriber(listener) note the answer step
```typescript
async function subscribe(
  spaceId: string,
  pc: RTCPeerConnection,
  pubSessionId: string,
  trackName: string
) {
  pc.ontrack = (e) => attachHiddenAudio(e.streams[0]);

  const { sessionId, offer } = await api.post(`/spaces/${spaceId}/subscribe`, {
    pubSessionId,
    trackName,
  });

  await pc.setRemoteDescription(offer); // SFU OFFERS on subscribe
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  await api.post(`/spaces/${spaceId}/renegotiate`, {
    sessionId,
    sdp: answer.sdp,
  });
}
```

5) Presence wiring (Supabase realtime)
```typescript
function joinChannel(store: SpaceStore, spaceId: string) {
  const channel = supabase.channel(`space:${spaceId}`, {
    config: { presence: { key: store.localUserId } },
  });

  channel
    .on("broadcast", { event: "track_added" }, ({ payload }) => {
      // a new speaker published → subscribe to their track
      store.onNewSpeakerTrack(payload.userId, payload.sfuSessionId, payload.trackName);
    })
    .on("broadcast", { event: "track_closed" }, ({ payload }) => {
      store.onSpeakerLeft(payload.userId);
    })
    .on("broadcast", { event: "role_changed" }, ({ payload }) => {
      store.onRoleChanged(payload.userId, payload.role);
    })
    .subscribe();

  return channel;
}
```

6) Autoplay gate + hidden audio
```typescript
function attachHiddenAudio(stream: MediaStream) {
  const el = document.createElement("audio");
  el.srcObject = stream;
  el.autoplay = true;
  (el as any).playsInline = true;
  el.style.display = "none";
  document.body.appendChild(el);
  el.play().catch(() => {/* needs a prior user gesture — gate join behind a tap */});
}
```

7) Teardown (must run on every exit path)
```typescript
function teardown(pc?: RTCPeerConnection, stream?: MediaStream) {
  stream?.getTracks().forEach(t => t.stop());
  pc?.getSenders().forEach(s => s.track?.stop());
  pc?.close();
  // update Supabase presence → "left"; backend closes SFU tracks/session
}

// wire to: component unmount, explicit leave, and:
window.addEventListener("beforeunload", () => teardown(pc, stream));
```