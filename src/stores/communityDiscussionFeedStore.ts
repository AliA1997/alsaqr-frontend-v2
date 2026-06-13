import { makeAutoObservable, runInAction } from "mobx";
import type { CreateListOrCommunityForm, CreateListOrCommunityFormDto } from "@typings";
import { Pagination, PagingParams } from "@models/common";
import agent from "@utils/api/agent";
import type { AcceptOrDenyCommunityInviteConfirmationDto, CommunityDiscussionToDisplay, UpdateCommunityDiscussionForm } from "@models/community";
import { RelationshipType } from "@enums";
import { DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM } from "@utils/constants";
import { store } from ".";

export default class CommunityDiscussionFeedStore {

    constructor() {
        makeAutoObservable(this);
    }

    loadingJoinCommunityDiscussion = false;
    loadingInitial = false;
    loadingUpsert = false;
    predicate = new Map();
    setPredicate = (predicate: string, value: string | number | Date | undefined) => {
        if (value) {
            this.predicate.set(predicate, value);
        } else {
            this.predicate.delete(predicate);
        }
    }
    pagination: Pagination | undefined = undefined;
    pagingParams: PagingParams = new PagingParams(1, 25);

    communityDiscussionsRegistry: Map<string, CommunityDiscussionToDisplay> = new Map<string, CommunityDiscussionToDisplay>();
    currentStepInCommunityDiscussionCreation: number | undefined = undefined;
    communityDiscussionCreationForm: CreateListOrCommunityForm = DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM;
    currentStepInCommunityDiscussionUpdate: number | undefined = undefined;
    updateCommunityDiscussionForm: UpdateCommunityDiscussionForm | undefined = undefined;

    setLoadingInitial = (val: boolean) => {
        this.loadingInitial = val;
    }
    setLoadingUpsert = (val: boolean) => {
        this.loadingUpsert = val;
    }
    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPagination = (pagination: Pagination) => {
        this.pagination = pagination;
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
    setSearchQry = (val: string) => this.predicate.set('searchQry', val);


    setCommunityDiscussion = (communityDiscussionId: string, communityDiscussion: CommunityDiscussionToDisplay) => {
        this.communityDiscussionsRegistry.set(communityDiscussionId, communityDiscussion);
    }
    updateCommunityDiscussionRelationship = (communityDiscussionId: string, newStatus: RelationshipType) => {
        if (this.communityDiscussionsRegistry.has(communityDiscussionId)) {
            const communityDiscussionInfo = this.communityDiscussionsRegistry.get(communityDiscussionId);
            this.setCommunityDiscussion(communityDiscussionId, { ...communityDiscussionInfo!, relationshipType: newStatus });
        }
    }
    resetListsState = () => {
        this.predicate.clear();
        this.communityDiscussionsRegistry.clear();
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }
    setLoadingJoinCommunityDiscussion = (val: boolean) => {
        this.loadingJoinCommunityDiscussion = val;
    }


    unjoinPublicCommunityDiscussion = async (communityId: string, communityDiscussionId: string) => {

        this.setLoadingJoinCommunityDiscussion(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;
            const joinCommunityDiscussionDto = {
                username: authUserSession?.username ?? "",
                email: authUserSession?.email ?? "",
            }
            await agent.communityApiClient.unjoinCommunityDiscussion(joinCommunityDiscussionDto, communityId, communityDiscussionId)

            runInAction(() => {
                this.updateCommunityDiscussionRelationship(communityDiscussionId, RelationshipType.None);
            });
        } finally {
            this.setLoadingJoinCommunityDiscussion(false);
        }

    }
    joinPublicCommunityDiscussion = async (communityId: string, communityDiscussionId: string) => {

        this.setLoadingJoinCommunityDiscussion(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;
            const joinCommunityDto = {
                username: authUserSession?.username ?? "",
                email: authUserSession?.email ?? "",
            }
            await agent.communityApiClient.joinCommunityDiscussion(joinCommunityDto, communityId, communityDiscussionId)

            runInAction(() => {
                this.updateCommunityDiscussionRelationship(communityDiscussionId, RelationshipType.Member);
            });
        } finally {
            this.setLoadingJoinCommunityDiscussion(false);
        }

    }
    requestToJoinPrivateCommunityDiscussion = async (communityId: string, communityDiscussionId: string) => {

        this.setLoadingJoinCommunityDiscussion(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;
            const joinCommunityDto = {
                username: authUserSession?.username ?? "",
                email: authUserSession?.email ?? "",
            }
            await agent.communityApiClient.requestToJoinCommunityDiscussion(joinCommunityDto, communityId, communityDiscussionId)

            runInAction(() => {
                this.updateCommunityDiscussionRelationship(communityDiscussionId, RelationshipType.Requested);
            });
        } finally {
            this.setLoadingJoinCommunityDiscussion(false);
        }

    }
    acceptRequestToJoinPrivateCommunityDiscussion = async (
        communityId: string,
        communityDiscussionId: string,
        acceptToDenyRequest: AcceptOrDenyCommunityInviteConfirmationDto) => {

        this.setLoadingJoinCommunityDiscussion(true);
        try {
            await agent.communityApiClient.acceptOrDenyToJoinRequestToCommunityDiscussion(acceptToDenyRequest, communityId, communityDiscussionId)

            runInAction(async () => {
                await this.loadCommunityDiscussions(communityId);
            });
        } finally {
            this.setLoadingJoinCommunityDiscussion(false);
        }

    }


    addCommunityDiscussion = async (newCommunityDiscussion: CreateListOrCommunityForm, communityId: string) => {

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
            await this.loadCommunityDiscussions(communityId);

        } finally {
            this.setLoadingUpsert(false);
        }

    }

    updateCommunityDiscussion = async (values: UpdateCommunityDiscussionForm, communityId: string, communityDiscussionId: string) => {

        this.setLoadingUpsert(true);
        try {
            await agent.communityApiClient.updateCommunityDiscussion(values, communityId, communityDiscussionId);

            runInAction(() => {
                store.modalStore.closeModal();
                this.setCurrentStepInCommunityDiscussionUpdate(0);
                this.setUpdateCommunityDiscussionForm(undefined);
            });
        } finally {
            this.setLoadingUpsert(false);
        }

    }

    deleteCommunityDiscussion = async (communityId: string, communityDiscussionId: string) => {

        this.setLoadingUpsert(true);
        try {
            await agent.communityApiClient.deleteCommunityDiscussion(communityId, communityDiscussionId);

            runInAction(() => {
                this.communityDiscussionsRegistry.delete(communityDiscussionId);
                store.modalStore.closeModal();
            });
        } finally {
            this.setLoadingUpsert(false);
        }

    }

    private clearCommunityDiscussions() {
        this.communityDiscussionsRegistry.clear();
    }

    loadCommunityDiscussions = async (communityId: string) => {

        this.setLoadingInitial(true);
        this.clearCommunityDiscussions();
        try {
            const { items, pagination } = await agent.communityApiClient.getCommunityDiscussions(this.axiosParams, communityId) ?? [];

            runInAction(() => {
                items.forEach((communityDiscussion: CommunityDiscussionToDisplay) => {
                    this.setCommunityDiscussion(communityDiscussion.communityDiscussionId, communityDiscussion)
                });
            });

            this.setPagination(pagination);
        } finally {
            this.setLoadingInitial(false);
        }

    }

    get communityDiscussions() {
        return Array.from(this.communityDiscussionsRegistry.values());
    }
}