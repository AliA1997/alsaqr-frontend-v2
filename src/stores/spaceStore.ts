import { makeAutoObservable, runInAction } from "mobx";
import { RealtimeChannel } from "@supabase/supabase-js";
import agent from "@utils/api/agent";
import { supabase } from "@utils/infrastructure/supabase";
import {
    JoinSpaceResultDto,
    SpaceConnectionState,
    SpaceEndedPayload,
    SpaceHandRaisedPayload,
    SpaceKind,
    SpaceListItem,
    SpaceMuteChangedPayload,
    SpaceParticipant,
    SpaceRole,
    SpaceRoleChangedPayload,
    SpaceToDisplay,
    SpaceTrackAddedPayload,
    SpaceTrackClosedPayload,
    StartSpaceDto,
} from "@models/space";
import { CommunityDiscussionToDisplay } from "@models/community";
import { DEFAULT_VIRTUALIZED_ITEMS_PERPAGE } from "@utils/constants";
import {
    attachHiddenAudio,
    createPeer,
    publishAudio,
    removeAllHiddenAudio,
    removeHiddenAudio,
    subscribeToSpeaker,
    teardownPeer,
} from "@utils/infrastructure/spaceRtc";
import { store } from ".";

// Ephemeral audio spaces. Presence is Supabase, media is Cloudflare — two
// independent truths, never conflated. The backend is authoritative for
// roles; this store only reflects role state and never decides who may speak.
export default class SpaceStore {

    constructor() {
        makeAutoObservable(
            this,
            {
                // WebRTC/channel handles are imperative plumbing, not UI state.
                channel: false,
                publishPeer: false,
                localStream: false,
                subscriberPeers: false,
            },
            { autoBind: true }
        );

        // Tab close must converge on the same teardown as unmount/leave.
        if (typeof window !== "undefined") {
            window.addEventListener("beforeunload", () => {
                if (this.activeSpace) void this.leaveSpace();
            });
        }
    }

    // Every live space discovered for the entity page currently being viewed,
    // keyed by spaceId: a community's own space plus one per live discussion.
    // The backend guarantees at most one live space per community and per
    // discussion (partial unique indexes), so this map is the whole picture.
    spacesRegistry: Map<string, SpaceToDisplay> = new Map<string, SpaceToDisplay>();

    // Parent-discussion titles for labeling, keyed by communityDiscussionId.
    discussionTitleRegistry: Map<string, string> = new Map<string, string>();

    // Active space session state (reflected from backend + presence).
    activeSpace: SpaceToDisplay | undefined = undefined;
    participantRegistry: Map<string, SpaceParticipant> = new Map<string, SpaceParticipant>();
    localRole: SpaceRole = "listener";
    localMuted = true;
    connection: SpaceConnectionState = "idle";
    loadingInitial = false;
    loadingAction = false;

    // Imperative handles (excluded from observation above).
    channel: RealtimeChannel | undefined = undefined;
    publishPeer: RTCPeerConnection | undefined = undefined;
    localStream: MediaStream | undefined = undefined;
    subscriberPeers: Map<string, RTCPeerConnection> = new Map<string, RTCPeerConnection>();

    get localUserId() {
        return store.authStore.currentSessionUser?.id ?? "";
    }

    get participants() {
        return Array.from(this.participantRegistry.values());
    }

    get speakers() {
        return this.participants.filter(p => p.role === "host" || p.role === "speaker");
    }

    get listeners() {
        return this.participants.filter(p => p.role === "listener");
    }

    get raisedHands() {
        return this.participants.filter(p => p.handRaised && p.role === "listener");
    }

    get isLive() {
        return this.connection === "live";
    }

    get isHost() {
        return this.localRole === "host";
    }

    setLoadingInitial = (value: boolean) => { this.loadingInitial = value; };
    setLoadingAction = (value: boolean) => { this.loadingAction = value; };
    setConnection = (value: SpaceConnectionState) => { this.connection = value; };
    setLocalRole = (value: SpaceRole) => { this.localRole = value; };
    setActiveSpace = (value: SpaceToDisplay | undefined) => { this.activeSpace = value; };

    setParticipant = (userId: string, participant: SpaceParticipant) => {
        this.participantRegistry.set(userId, participant);
    };

    // Only live spaces are ever registered — an ended space is not joinable and
    // must never reach the list.
    setSpace = (space: SpaceToDisplay | undefined) => {
        if (space?.isLive) this.spacesRegistry.set(space.spaceId, space);
    };

    resetSpaces = () => {
        this.spacesRegistry.clear();
        this.discussionTitleRegistry.clear();
    };

    // ---- Derived views ----

    // Deterministic order: the community's own space first, then discussion
    // spaces newest first, tie-broken by spaceId so a redraw never reshuffles.
    get spaceListItems(): SpaceListItem[] {
        return Array.from(this.spacesRegistry.values())
            .sort((a, b) => {
                if (a.kind !== b.kind) return a.kind === "community" ? -1 : 1;
                const byRecency = Date.parse(b.startedAt) - Date.parse(a.startedAt);
                return byRecency !== 0 ? byRecency : a.spaceId.localeCompare(b.spaceId);
            })
            .map(space => ({
                space,
                discussionTitle: space.communityDiscussionId
                    ? this.discussionTitleRegistry.get(space.communityDiscussionId)
                    : undefined,
            }));
    }

    // Rendered on top: the space the user is actually in, otherwise the
    // community's own live space.
    get primarySpaceItem(): SpaceListItem | undefined {
        const items = this.spaceListItems;
        const joined = this.activeSpace
            ? items.find(i => i.space.spaceId === this.activeSpace!.spaceId)
            : undefined;
        return joined ?? items.find(i => i.space.kind === "community");
    }

    // Rendered below: every other live space — the ones the user is not in.
    get otherSpaceItems(): SpaceListItem[] {
        const primaryId = this.primarySpaceItem?.space.spaceId;
        return this.spaceListItems.filter(i => i.space.spaceId !== primaryId);
    }

    // ---- "Live now" lookups ----

    // The community page shows every live space under the community: its own,
    // plus one per discussion. The backend has no bulk lookup — audio-spaces.md
    // keeps discovery feeds out of scope — so this fans the per-discussion
    // "live" lookup out over the community's discussions. Those lookups are not
    // membership-gated, so a discussion the user has not joined still surfaces:
    // that is exactly the "spaces you're not part of" list.
    loadCommunitySpaces = async (communityId: string) => {
        this.setLoadingInitial(true);
        try {
            const params = new URLSearchParams();
            params.append("currentPage", "1");
            params.append("itemsPerPage", DEFAULT_VIRTUALIZED_ITEMS_PERPAGE);

            const [communitySpace, discussionResult] = await Promise.all([
                agent.spaceApiClient.getLiveCommunitySpace(communityId),
                agent.communityApiClient.getCommunityDiscussions(params, communityId),
            ]);

            const discussions: CommunityDiscussionToDisplay[] = discussionResult?.items ?? [];

            // One lookup per discussion. A single failure must not blank the
            // whole list, so each is caught on its own.
            const discussionSpaces = await Promise.all(
                discussions.map(discussion =>
                    agent.spaceApiClient
                        .getLiveCommunityDiscussionSpace(communityId, discussion.communityDiscussionId)
                        .catch(() => undefined)
                )
            );

            runInAction(() => {
                // Rebuild wholesale: a space that ended since the last load must
                // disappear, which a merge would leave behind.
                this.resetSpaces();
                discussions.forEach(discussion =>
                    this.discussionTitleRegistry.set(
                        discussion.communityDiscussionId,
                        discussion.communityDiscussionTitle
                    )
                );
                this.setSpace(communitySpace);
                discussionSpaces.forEach((space: SpaceToDisplay | undefined) => this.setSpace(space));
            });
        } catch (error) {
            console.log("ERROR:", error);
        } finally {
            this.setLoadingInitial(false);
        }
    };

    // Single-space lookup for the discussion page, where only that discussion's
    // own space is in scope.
    loadLiveCommunityDiscussionSpace = async (communityId: string, communityDiscussionId: string) => {
        this.setLoadingInitial(true);
        try {
            const space: SpaceToDisplay | undefined =
                await agent.spaceApiClient.getLiveCommunityDiscussionSpace(communityId, communityDiscussionId);
            alert(JSON.stringify(space));
            runInAction(() => {
                this.resetSpaces();
                this.setSpace(space);
            });
        } catch (error) {
            console.log("ERROR:", error);
        } finally {
            this.setLoadingInitial(false);
        }
    };

    // ---- Lifecycle ----

    startSpace = async (kind: SpaceKind, values: StartSpaceDto, communityId: string, communityDiscussionId?: string) => {
        this.setLoadingAction(true);
        try {
            const space: SpaceToDisplay = kind === "community"
                ? await agent.spaceApiClient.startCommunitySpace(values, communityId)
                : await agent.spaceApiClient.startCommunityDiscussionSpace(values, communityId, communityDiscussionId!);

            runInAction(() => this.setSpace(space));

            await this.joinSpace(space);
        } finally {
            this.setLoadingAction(false);
        }
    };

    // Join must be triggered by a user tap — that gesture is what unlocks
    // autoplay for the hidden <audio> elements.
    //
    // A user may be in exactly one space at a time. Joining a different space
    // tears the current session down first, via the same teardown as an explicit
    // leave, so the SFU stops pulling audio for the space being abandoned.
    // Confirming that switch is the caller's job — by the time this runs the
    // user has already agreed to it.
    joinSpace = async (space: SpaceToDisplay) => {
        // Already in this space, or a join is mid-flight: nothing to do.
        if (this.activeSpace?.spaceId === space.spaceId) return;
        if (this.connection === "connecting") return;

        if (this.activeSpace) await this.leaveSpace();

        this.setConnection("connecting");
        try {
            const result: JoinSpaceResultDto = await agent.spaceApiClient.joinSpace(space.spaceId);

            runInAction(() => {
                this.setActiveSpace(result.space ?? space);
                this.setLocalRole(result.role);
                this.participantRegistry.clear();
                (result.participants ?? []).forEach(p => this.setParticipant(p.userId, p));
            });

            this.joinChannel(space.spaceId);

            // Hosts publish immediately; listeners pull every current speaker.
            if (result.role === "host" || result.role === "speaker") {
                await this.startPublishing(space.spaceId);
            }

            const speakers = (result.speakers ?? []).filter(s => s.userId !== this.localUserId);
            for (const speaker of speakers) {
                if (speaker.sfuSessionId && speaker.trackName)
                    await this.subscribeToTrack(speaker.userId, speaker.sfuSessionId, speaker.trackName);
            }

            this.setConnection("live");
        } catch (error) {
            console.log("ERROR:", error);
            this.setConnection("idle");
            this.teardownMedia();
            throw error;
        }
    };

    leaveSpace = async () => {
        // Re-entrancy guard: nothing to leave (or a leave already ran).
        if (!this.activeSpace && this.connection === "idle") return;

        const spaceId = this.activeSpace?.spaceId;
        // Every exit path converges here: close tracks + PCs, mark "left",
        // otherwise audio keeps being pulled for nobody.
        this.teardownMedia();

        if (this.channel) {
            // removeChannel, not unsubscribe: unsubscribe leaves the channel in
            // the supabase client's registry, so the next join stacks a second
            // channel on the same topic and every presence/broadcast event
            // (space_ended included) arrives twice.
            try { await supabase.removeChannel(this.channel); } catch { /* already gone */ }
            this.channel = undefined;
        }

        runInAction(() => {
            this.setActiveSpace(undefined);
            this.participantRegistry.clear();
            this.setLocalRole("listener");
            this.localMuted = true;
            this.setConnection("idle");
        });

        if (spaceId) {
            try { await agent.spaceApiClient.leaveSpace(spaceId); } catch { /* network death — backend reaps */ }
        }
    };

    endSpace = async () => {
        const spaceId = this.activeSpace?.spaceId;
        if (!spaceId || !this.isHost) return;

        this.setLoadingAction(true);
        try {
            await agent.spaceApiClient.endSpace(spaceId);
            // An ended space is no longer joinable, so it must leave the list —
            // the next load would drop it anyway, but not before a redraw shows
            // a dead space with a live Join button.
            runInAction(() => this.spacesRegistry.delete(spaceId));
            await this.leaveSpace();
        } finally {
            this.setLoadingAction(false);
        }
    };

    // ---- Media ----

    private startPublishing = async (spaceId: string) => {
        // No audio effect until the backend has actually granted the publish.
        const { pc, stream, sessionId, trackName } = await publishAudio(spaceId);
        this.publishPeer = pc;
        this.localStream = stream;

        runInAction(() => { this.localMuted = false; });

        const me = this.participantRegistry.get(this.localUserId);
        if (me) this.setParticipant(this.localUserId, { ...me, muted: false, sfuSessionId: sessionId, trackName });

        this.broadcast("track_added", {
            userId: this.localUserId,
            sfuSessionId: sessionId,
            trackName,
        } as SpaceTrackAddedPayload);
    };

    private stopPublishing = () => {
        teardownPeer(this.publishPeer, this.localStream);
        this.publishPeer = undefined;
        this.localStream = undefined;

        this.broadcast("track_closed", { userId: this.localUserId } as SpaceTrackClosedPayload);
    };

    private subscribeToTrack = async (userId: string, sfuSessionId: string, trackName: string) => {
        const spaceId = this.activeSpace?.spaceId;
        if (!spaceId || this.subscriberPeers.has(userId)) return;

        // One RTCPeerConnection per remote speaker, kept alive for the whole
        // visit; adding the nth speaker never touches existing connections.
        const pc = createPeer();
        this.subscriberPeers.set(userId, pc);
        try {
            await subscribeToSpeaker(spaceId, pc, sfuSessionId, trackName, (stream) =>
                attachHiddenAudio(userId, stream)
            );
        } catch (error) {
            console.log("ERROR:", error);
            this.subscriberPeers.delete(userId);
            teardownPeer(pc);
        }
    };

    private unsubscribeFromTrack = (userId: string) => {
        const pc = this.subscriberPeers.get(userId);
        if (pc) {
            teardownPeer(pc);
            this.subscriberPeers.delete(userId);
        }
        removeHiddenAudio(userId);
    };

    private teardownMedia = () => {
        teardownPeer(this.publishPeer, this.localStream);
        this.publishPeer = undefined;
        this.localStream = undefined;

        this.subscriberPeers.forEach(pc => teardownPeer(pc));
        this.subscriberPeers.clear();
        removeAllHiddenAudio();
    };

    // Mute is local + broadcast: track.enabled=false stops audio immediately;
    // we only unpublish on leave or demotion — never on a plain mute.
    toggleMute = () => {
        const muted = !this.localMuted;
        this.localStream?.getAudioTracks().forEach(t => (t.enabled = !muted));
        this.localMuted = muted;

        const me = this.participantRegistry.get(this.localUserId);
        if (me) this.setParticipant(this.localUserId, { ...me, muted });

        this.broadcast("mute_changed", { userId: this.localUserId, muted } as SpaceMuteChangedPayload);
    };

    // ---- Roles ----

    raiseHand = async (raised: boolean) => {
        const spaceId = this.activeSpace?.spaceId;
        if (!spaceId) return;

        await agent.spaceApiClient.raiseHand(spaceId, raised);

        const me = this.participantRegistry.get(this.localUserId);
        if (me) this.setParticipant(this.localUserId, { ...me, handRaised: raised });

        this.broadcast("hand_raised", { userId: this.localUserId, raised } as SpaceHandRaisedPayload);
    };

    approveSpeaker = async (userId: string) => {
        const spaceId = this.activeSpace?.spaceId;
        if (!spaceId || !this.isHost) return;

        // Backend grants the role and broadcasts role_changed; the promoted
        // client runs the publish step when it receives it.
        await agent.spaceApiClient.approveSpeaker(spaceId, userId);
    };

    demoteSpeaker = async (userId: string) => {
        const spaceId = this.activeSpace?.spaceId;
        if (!spaceId || !this.isHost) return;

        await agent.spaceApiClient.demoteSpeaker(spaceId, userId);
    };

    // ---- Supabase realtime wiring (presence is Supabase, media is Cloudflare) ----

    private broadcast = (event: string, payload: any) => {
        void this.channel?.send({ type: "broadcast", event, payload });
    };

    private joinChannel = (spaceId: string) => {
        const currentUser = store.authStore.currentSessionUser;

        // One channel per topic, always. A leftover channel from an earlier join
        // would double every presence/broadcast event we receive.
        if (this.channel) {
            void supabase.removeChannel(this.channel);
            this.channel = undefined;
        }

        const channel = supabase.channel(`space:${spaceId}`, {
            config: { presence: { key: this.localUserId } },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState<SpaceParticipant>();
                runInAction(() => {
                    const seen = new Set<string>();
                    Object.values(state).forEach(metas => {
                        const meta = metas[0];
                        if (!meta?.userId) return;
                        seen.add(meta.userId);
                        const existing = this.participantRegistry.get(meta.userId);
                        this.setParticipant(meta.userId, { ...existing, ...meta });
                    });
                    // Roster reflects leaves in near-real-time.
                    Array.from(this.participantRegistry.keys())
                        .filter(userId => !seen.has(userId))
                        .forEach(userId => {
                            this.participantRegistry.delete(userId);
                            this.unsubscribeFromTrack(userId);
                        });
                });
            })
            .on("broadcast", { event: "track_added" }, ({ payload }) => {
                const p = payload as SpaceTrackAddedPayload;
                if (p.userId === this.localUserId) return;
                const existing = this.participantRegistry.get(p.userId);
                if (existing) this.setParticipant(p.userId, { ...existing, sfuSessionId: p.sfuSessionId, trackName: p.trackName });
                // A new speaker published → pull just their track.
                void this.subscribeToTrack(p.userId, p.sfuSessionId, p.trackName);
            })
            .on("broadcast", { event: "track_closed" }, ({ payload }) => {
                const p = payload as SpaceTrackClosedPayload;
                if (p.userId === this.localUserId) return;
                this.unsubscribeFromTrack(p.userId);
            })
            .on("broadcast", { event: "role_changed" }, ({ payload }) => {
                void this.onRoleChanged(payload as SpaceRoleChangedPayload);
            })
            .on("broadcast", { event: "mute_changed" }, ({ payload }) => {
                const p = payload as SpaceMuteChangedPayload;
                const existing = this.participantRegistry.get(p.userId);
                if (existing) this.setParticipant(p.userId, { ...existing, muted: p.muted });
            })
            .on("broadcast", { event: "hand_raised" }, ({ payload }) => {
                const p = payload as SpaceHandRaisedPayload;
                const existing = this.participantRegistry.get(p.userId);
                if (existing) this.setParticipant(p.userId, { ...existing, handRaised: p.raised });
            })
            .on("broadcast", { event: "space_ended" }, ({ payload }) => {
                // The host ended it under us: drop it from the list as well as
                // tearing down, or it lingers as a joinable row.
                const endedId = (payload as SpaceEndedPayload)?.spaceId ?? spaceId;
                runInAction(() => this.spacesRegistry.delete(endedId));
                void this.leaveSpace();
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({
                        userId: this.localUserId,
                        username: currentUser?.username ?? "",
                        avatar: currentUser?.avatar ?? "",
                        role: this.localRole,
                        muted: this.localMuted,
                        handRaised: false,
                    } as SpaceParticipant);
                } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                    // Transient network loss: restart and re-pull current speakers.
                    runInAction(() => this.setConnection("reconnecting"));
                }
            });

        this.channel = channel;
    };

    private onRoleChanged = async (payload: SpaceRoleChangedPayload) => {
        const existing = this.participantRegistry.get(payload.userId);
        if (existing) this.setParticipant(payload.userId, { ...existing, role: payload.role, handRaised: false });

        if (payload.userId !== this.localUserId) return;

        const previousRole = this.localRole;
        this.setLocalRole(payload.role);

        const spaceId = this.activeSpace?.spaceId;
        if (!spaceId) return;

        // Promotion runs the publish step; demotion unpublishes (the only
        // non-leave case that does).
        if (payload.role === "speaker" && previousRole === "listener") {
            await this.startPublishing(spaceId);
        } else if (payload.role === "listener" && previousRole !== "listener") {
            this.stopPublishing();
            runInAction(() => { this.localMuted = true; });
        }
    };
}
