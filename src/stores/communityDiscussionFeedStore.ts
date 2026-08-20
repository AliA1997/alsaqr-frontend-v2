import { makeAutoObservable, runInAction } from "mobx";
import type { CreateListOrCommunityForm, CreateListOrCommunityFormDto } from "@typings";
import { PagingParams } from "@models/common";
import agent from "@utils/api/agent";
import type { AcceptOrDenyCommunityInviteConfirmationDto, CommunityDiscussionToDisplay, UpdateCommunityDiscussionForm } from "@models/community";
import { RelationshipType } from "@enums";
import { DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM } from "@utils/constants";
import { store } from ".";
import FeedState from "./base/feedState";

export default class CommunityDiscussionFeedStore {

    // "firstPage" rather than the old clear-on-every-load: CommunityDiscussionFeed
    // pages through fetchMoreItems, and clearing unconditionally meant page 2
    // wiped page 1, so the virtualized feed only ever showed the newest page.
    feed = new FeedState<CommunityDiscussionToDisplay>(
        (discussion) => discussion.communityDiscussionId,
        { itemsPerPage: 25 }
    );

    loadingJoinCommunityDiscussion = false;
    loadingUpsert = false;

    currentStepInCommunityDiscussionCreation: number | undefined = undefined;
    communityDiscussionCreationForm: CreateListOrCommunityForm = DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM;
    currentStepInCommunityDiscussionUpdate: number | undefined = undefined;
    updateCommunityDiscussionForm: UpdateCommunityDiscussionForm | undefined = undefined;

    constructor() {
        makeAutoObservable(this);
    }

    // -- feed surface, delegated so consumers keep reading the store directly --
    get communityDiscussions() {
        return this.feed.items;
    }
    get loadingInitial() {
        return this.feed.loadingInitial;
    }
    get pagingParams() {
        return this.feed.pagingParams;
    }
    get pagination() {
        return this.feed.pagination;
    }
    get predicate() {
        return this.feed.predicate;
    }

    setPagingParams = (pagingParams: PagingParams) => this.feed.setPagingParams(pagingParams);
    setPagination = this.feed.setPagination;
    setPredicate = this.feed.setPredicate;
    setLoadingInitial = this.feed.setLoadingInitial;
    setCommunityDiscussion = (
        communityDiscussionId: string,
        communityDiscussion: CommunityDiscussionToDisplay
    ) => this.feed.setItemByKey(communityDiscussionId, communityDiscussion);
    setSearchQry = (val: string) => this.feed.setPredicate("searchQry", val);
    /** Named resetListsState historically -- kept as an alias, prefer resetFeedState. */
    resetFeedState = this.feed.reset;
    resetListsState = this.feed.reset;

    setLoadingUpsert = (val: boolean) => {
        this.loadingUpsert = val;
    }
    setLoadingJoinCommunityDiscussion = (val: boolean) => {
        this.loadingJoinCommunityDiscussion = val;
    }
    setCurrentStepInCommunityDiscussionCreation = (val: number) => {
        this.currentStepInCommunityDiscussionCreation = val;
    }
    setCommunityDiscussionCreationForm = (val: CreateListOrCommunityForm) => {
        this.communityDiscussionCreationForm = val;
    }
    setCurrentStepInCommunityDiscussionUpdate = (val: number) => {
        this.currentStepInCommunityDiscussionUpdate = val;
    }
    setUpdateCommunityDiscussionForm = (val: UpdateCommunityDiscussionForm | undefined) => {
        this.updateCommunityDiscussionForm = val;
    }

    updateCommunityDiscussionRelationship = (
        communityDiscussionId: string,
        newStatus: RelationshipType
    ) => {
        const discussionInfo = this.feed.getItem(communityDiscussionId);
        if (discussionInfo) {
            this.setCommunityDiscussion(communityDiscussionId, {
                ...discussionInfo,
                relationshipType: newStatus,
            });
        }
    }

    loadCommunityDiscussions = async (communityId: string, refresh?: boolean) =>
        this.feed.load(
            (params) => agent.communityApiClient.getCommunityDiscussions(params, communityId),
            { refresh }
        );

    unjoinPublicCommunityDiscussion = async (communityId: string, communityDiscussionId: string) => {
        this.setLoadingJoinCommunityDiscussion(true);
        try {
            await agent.communityApiClient.unjoinCommunityDiscussion(
                this.joinDiscussionDto(), communityId, communityDiscussionId
            )

            runInAction(() => {
                this.updateCommunityDiscussionRelationship(communityDiscussionId, RelationshipType.None);
            });
        } finally {
            runInAction(() => this.setLoadingJoinCommunityDiscussion(false));
        }
    }

    joinPublicCommunityDiscussion = async (communityId: string, communityDiscussionId: string) => {
        this.setLoadingJoinCommunityDiscussion(true);
        try {
            await agent.communityApiClient.joinCommunityDiscussion(
                this.joinDiscussionDto(), communityId, communityDiscussionId
            )

            runInAction(() => {
                this.updateCommunityDiscussionRelationship(communityDiscussionId, RelationshipType.Member);
            });
        } finally {
            runInAction(() => this.setLoadingJoinCommunityDiscussion(false));
        }
    }

    requestToJoinPrivateCommunityDiscussion = async (communityId: string, communityDiscussionId: string) => {
        this.setLoadingJoinCommunityDiscussion(true);
        try {
            await agent.communityApiClient.requestToJoinCommunityDiscussion(
                this.joinDiscussionDto(), communityId, communityDiscussionId
            )

            runInAction(() => {
                this.updateCommunityDiscussionRelationship(communityDiscussionId, RelationshipType.Requested);
            });
        } finally {
            runInAction(() => this.setLoadingJoinCommunityDiscussion(false));
        }
    }

    acceptRequestToJoinPrivateCommunityDiscussion = async (
        communityId: string,
        communityDiscussionId: string,
        acceptToDenyRequest: AcceptOrDenyCommunityInviteConfirmationDto) => {

        this.setLoadingJoinCommunityDiscussion(true);
        try {
            await agent.communityApiClient.acceptOrDenyToJoinRequestToCommunityDiscussion(
                acceptToDenyRequest, communityId, communityDiscussionId
            )

            await this.loadCommunityDiscussions(communityId, true);
        } finally {
            runInAction(() => this.setLoadingJoinCommunityDiscussion(false));
        }
    }

    addCommunityDiscussion = async (
        newCommunityDiscussion: CreateListOrCommunityForm,
        communityId: string
    ) => {
        this.setLoadingUpsert(true);
        try {
            const newCommunityDiscussionDto: CreateListOrCommunityFormDto = {
                ...newCommunityDiscussion,
                postsAdded: [],
                usersAdded: newCommunityDiscussion.usersAdded.map(u => u.id)
            };

            await agent.communityApiClient.addCommunityDiscussion(newCommunityDiscussionDto, communityId);
            runInAction(() => {
                this.setCommunityDiscussionCreationForm(DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM);
                this.setCurrentStepInCommunityDiscussionCreation(0);
            });

            store.modalStore.closeModal();
            await this.loadCommunityDiscussions(communityId, true);
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }

    updateCommunityDiscussion = async (
        values: UpdateCommunityDiscussionForm,
        communityId: string,
        communityDiscussionId: string
    ) => {
        this.setLoadingUpsert(true);
        try {
            await agent.communityApiClient.updateCommunityDiscussion(values, communityId, communityDiscussionId);

            runInAction(() => {
                store.modalStore.closeModal();
                this.setCurrentStepInCommunityDiscussionUpdate(0);
                this.setUpdateCommunityDiscussionForm(undefined);
            });
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }

    deleteCommunityDiscussion = async (communityId: string, communityDiscussionId: string) => {
        this.setLoadingUpsert(true);
        try {
            await agent.communityApiClient.deleteCommunityDiscussion(communityId, communityDiscussionId);

            runInAction(() => {
                this.feed.removeItem(communityDiscussionId);
                store.modalStore.closeModal();
            });
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }

    private joinDiscussionDto = () => {
        const authUserSession = store.authStore.currentSessionUser;

        return {
            username: authUserSession?.username ?? "",
            email: authUserSession?.email ?? "",
            web3Address: authUserSession?.web3Address ?? "",
        };
    }
}
