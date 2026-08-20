import { makeAutoObservable, runInAction } from "mobx";
import type { CommunityToDisplay, CreateListOrCommunityForm, CreateListOrCommunityFormDto } from "@typings";
import { RelationshipType } from "@enums";
import { PagingParams } from "@models/common";
import agent from "@utils/api/agent";
import { DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM } from "@utils/constants";
import { store } from ".";
import type { AcceptOrDenyCommunityInviteConfirmationDto, UpdateCommunityForm, UpdateCommunityFormDto } from "@models/community";
import FeedState from "./base/feedState";

export default class CommunityFeedStore {

    feed = new FeedState<CommunityToDisplay>((community) => community.communityId, {
        itemsPerPage: 25,
    });

    loadingUpsert = false;
    loadingJoinCommunity = false;

    currentStepInCommunityCreation: number | undefined = undefined;
    communityCreationForm: CreateListOrCommunityForm = DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM;
    currentStepInCommunityUpdate: number | undefined = undefined;
    updateCommunityForm: UpdateCommunityForm | undefined = undefined;
    navigatedCommunity: CommunityToDisplay | undefined = undefined;

    constructor() {
        makeAutoObservable(this);
    }

    // -- feed surface, delegated so consumers keep reading communityFeedStore.x --
    get communities() {
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
    setCommunity = (communityId: string, community: CommunityToDisplay) =>
        this.feed.setItemByKey(communityId, community);
    setSearchQry = (val: string) => this.feed.setPredicate("searchQry", val);
    /** Named resetListsState historically -- kept as an alias, prefer resetFeedState. */
    resetFeedState = this.feed.reset;
    resetListsState = this.feed.reset;

    setNavigateCommunity = (val: CommunityToDisplay | undefined) => {
        this.navigatedCommunity = val;
    }
    setLoadingJoinCommunity = (val: boolean) => {
        this.loadingJoinCommunity = val;
    }
    setLoadingUpsert = (val: boolean) => {
        this.loadingUpsert = val;
    }
    setCurrentStepInCommunityCreation = (currentStep: number) => {
        this.currentStepInCommunityCreation = currentStep;
    }
    setCommunityCreationForm = (val: CreateListOrCommunityForm) => {
        this.communityCreationForm = val;
    }
    setCurrentStepInCommunityUpdate = (currentStep: number) => {
        this.currentStepInCommunityUpdate = currentStep;
    }
    setUpdateCommunityForm = (val: UpdateCommunityForm | undefined) => {
        this.updateCommunityForm = val;
    }

    private updateCommunityRelationship = (communityId: string, newStatus: RelationshipType) => {
        const communityInfo = this.feed.getItem(communityId);
        if (communityInfo) {
            communityInfo.relationshipType = newStatus;
            this.setCommunity(communityId, communityInfo);
        }
    }

    loadCommunities = async (refresh?: boolean) =>
        this.feed.load((params) => agent.communityApiClient.getCommunities(params), { refresh });

    updateCommunity = async (values: UpdateCommunityForm, communityId: string) => {
        this.setLoadingUpsert(true);
        try {
            const updatedCommunityDto: UpdateCommunityFormDto = values;
            await agent.communityApiClient.updateCommunity(updatedCommunityDto, communityId);

            runInAction(() => {
                store.modalStore.closeModal();
                this.setCurrentStepInCommunityUpdate(0);
                this.setUpdateCommunityForm(undefined);
            });
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }

    deleteCommunity = async (communityId: string) => {
        this.setLoadingUpsert(true);
        try {
            await agent.communityApiClient.deleteCommunity(communityId);

            runInAction(() => {
                this.feed.removeItem(communityId);
                store.modalStore.closeModal();
            });
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }

    unjoinPublicCommunity = async (communityId: string) => {
        this.setLoadingJoinCommunity(true);
        try {
            await agent.communityApiClient.unjoinCommunity(this.joinCommunityDto(), communityId)

            runInAction(() => {
                this.updateCommunityRelationship(communityId, RelationshipType.None);
            });
        } finally {
            runInAction(() => this.setLoadingJoinCommunity(false));
        }
    }

    joinPublicCommunity = async (communityId: string) => {
        this.setLoadingJoinCommunity(true);
        try {
            await agent.communityApiClient.joinCommunity(this.joinCommunityDto(), communityId)

            runInAction(() => {
                this.updateCommunityRelationship(communityId, RelationshipType.Member);
            });
        } finally {
            runInAction(() => this.setLoadingJoinCommunity(false));
        }
    }

    requestToJoinPrivateCommunity = async (communityId: string) => {
        this.setLoadingJoinCommunity(true);
        try {
            await agent.communityApiClient.requestToJoinCommunity(this.joinCommunityDto(), communityId)

            runInAction(() => {
                this.updateCommunityRelationship(communityId, RelationshipType.Requested);
            });
        } finally {
            runInAction(() => this.setLoadingJoinCommunity(false));
        }
    }

    acceptRequestToJoinPrivateCommunity = async (
        communityId: string,
        invitedUserId: string,
        acceptToDenyRequest: AcceptOrDenyCommunityInviteConfirmationDto) => {

        this.setLoadingJoinCommunity(true);
        try {
            acceptToDenyRequest.invitedUserId = invitedUserId;
            await agent.communityApiClient.acceptOrDenyToJoinRequestToCommunity(acceptToDenyRequest, communityId)

            await this.loadCommunities(true);
        } finally {
            runInAction(() => this.setLoadingJoinCommunity(false));
        }
    }

    addCommunity = async (newCommunity: CreateListOrCommunityForm) => {
        this.setLoadingUpsert(true);
        try {
            const newCommunityDto: CreateListOrCommunityFormDto = {
                ...newCommunity,
                usersAdded: newCommunity.usersAdded.map(u => u.id),
                postsAdded: newCommunity.postsAdded.map(p => p.postId)
            };
            await agent.communityApiClient.addCommunity(newCommunityDto)

            runInAction(() => {
                this.setCurrentStepInCommunityCreation(0);
                this.setCommunityCreationForm(DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM);
            });

            store.modalStore.closeModal();
            await this.loadCommunities(true);
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }

    private joinCommunityDto = () => {
        const authUserSession = store.authStore.currentSessionUser;

        return {
            username: authUserSession?.username ?? "",
            email: authUserSession?.email ?? "",
            web3Address: authUserSession?.web3Address ?? "",
        };
    }
}
