import { makeAutoObservable, runInAction } from "mobx";
import type { CommunityToDisplay, CreateListOrCommunityForm, CreateListOrCommunityFormDto } from "@typings";
import { RelationshipType } from "@enums";
import { Pagination, PagingParams } from "@models/common";
import agent from "@utils/api/agent";
import { DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM } from "@utils/constants";
import { store } from ".";
import type { AcceptOrDenyCommunityInviteConfirmationDto, UpdateCommunityForm, UpdateCommunityFormDto } from "@models/community";

export default class CommunityFeedStore {

    constructor() {
        makeAutoObservable(this);
    }

    loadingInitial = false;
    loadingUpsert = false;
    loadingJoinCommunity = false;
    predicate = new Map();
    setPredicate = (predicate: string, value: string | number | Date | undefined) => {
        debugger;
        if (value) {
            this.predicate.set(predicate, value);
        } else {
            this.predicate.delete(predicate);
        }
    }
    pagination: Pagination | undefined = undefined;
    pagingParams: PagingParams = new PagingParams(1, 25);

    communityRegistry: Map<string, CommunityToDisplay> = new Map<string, CommunityToDisplay>();
    currentStepInCommunityCreation: number | undefined = undefined;
    communityCreationForm: CreateListOrCommunityForm = DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM;
    currentStepInCommunityUpdate: number | undefined = undefined;
    updateCommunityForm: UpdateCommunityForm | undefined = undefined;


    navigatedCommunity: CommunityToDisplay | undefined = undefined;
    setNavigateCommunity = (val: CommunityToDisplay | undefined) => {
        this.navigatedCommunity = val;
    }
    setLoadingJoinCommunity = (val: boolean) => {
        this.loadingJoinCommunity = val;
    }
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
    setSearchQry = (val: string) => this.predicate.set('searchQry', val);


    setCommunity = (communityId: string, community: CommunityToDisplay) => {
        this.communityRegistry.set(communityId, community);
    }
    private updateCommunityRelationship = (communityId: string, newStatus: RelationshipType) => {
        if (this.communityRegistry.has(communityId)) {
            const communityInfo = this.communityRegistry.get(communityId);
            communityInfo!.relationshipType = newStatus;
            this.setCommunity(communityId, communityInfo!);
        }
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

    resetListsState = () => {
        this.predicate.clear();
        this.communityRegistry.clear();
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }

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
            this.setLoadingUpsert(false);
        }

    }

    deleteCommunity = async (communityId: string) => {

        this.setLoadingUpsert(true);
        try {
            await agent.communityApiClient.deleteCommunity(communityId);

            runInAction(() => {
                this.communityRegistry.delete(communityId);
                store.modalStore.closeModal();
            });
        } finally {
            this.setLoadingUpsert(false);
        }

    }

    unjoinPublicCommunity = async (communityId: string) => {

        this.setLoadingJoinCommunity(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;
            const joinCommunityDto = {
                username: authUserSession?.username ?? "",
                email: authUserSession?.email ?? "",
            }
            await agent.communityApiClient.unjoinCommunity(joinCommunityDto, communityId)

            runInAction(() => {
                this.updateCommunityRelationship(communityId, RelationshipType.None);
            });
        } finally {
            this.setLoadingJoinCommunity(false);
        }

    }
    joinPublicCommunity = async (communityId: string) => {

        this.setLoadingJoinCommunity(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;

            const joinCommunityDto = {
                username: authUserSession?.username ?? "",
                email: authUserSession?.email ?? "",
            }
            await agent.communityApiClient.joinCommunity(joinCommunityDto, communityId)

            runInAction(() => {
                this.updateCommunityRelationship(communityId, RelationshipType.Member);
            });
        } finally {
            this.setLoadingJoinCommunity(false);
        }

    }
    requestToJoinPrivateCommunity = async (communityId: string) => {

        this.setLoadingJoinCommunity(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;
            const joinCommunityDto = {
                username: authUserSession?.username ?? "",
                email: authUserSession?.email ?? "",
            }
            await agent.communityApiClient.requestToJoinCommunity(joinCommunityDto, communityId)

            runInAction(() => {
                this.updateCommunityRelationship(communityId, RelationshipType.Requested);
            });
        } finally {
            this.setLoadingJoinCommunity(false);
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

            runInAction(async () => {
                await this.loadCommunities();
            });
        } finally {
            this.setLoadingJoinCommunity(false);
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
            this.setLoadingUpsert(false);
        }

    }

    loadCommunities = async (refresh?: boolean) => {

        this.setLoadingInitial(true);
        if (refresh) {
            this.communityRegistry.clear();
            this.setPagingParams(new PagingParams(1, 25));
        }
        try {
            const { items, pagination } = await agent.communityApiClient.getCommunities(this.axiosParams) ?? [];

            runInAction(() => {
                items.forEach((community: CommunityToDisplay) => {
                    this.setCommunity(community.communityId, community)
                });
            });

            this.setPagination(pagination);
        } finally {
            this.setLoadingInitial(false);
        }

    }

    get communities() {
        return Array.from(this.communityRegistry.values());
    }
}