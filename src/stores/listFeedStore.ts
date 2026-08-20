import { makeAutoObservable, runInAction } from "mobx";
import { CreateListOrCommunityForm, CreateListOrCommunityFormDto, ListToDisplay } from "@typings";
import { PagingParams } from "@models/common";
import agent from "@utils/api/agent";
import { ListItemToDisplay } from "@models/list";
import { DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM } from "@utils/constants";
import { store } from ".";
import FeedState from "./base/feedState";

export default class ListFeedStore {

    // Two independent feeds in one store -- the reason FeedState is composed in
    // rather than inherited from.
    feed = new FeedState<ListToDisplay>((list) => list.listId, { itemsPerPage: 25 });
    savedListItemsFeed = new FeedState<ListItemToDisplay>(
        (listItem) => listItem.listItemId,
        { itemsPerPage: 10, clearStrategy: "always" }
    );

    loadingUpsert = false;
    selectedList: ListToDisplay | undefined = undefined;
    listInfoForSavedListItems: any | undefined = undefined;
    listCreationForm: CreateListOrCommunityForm = DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM;
    currentStepInListCreation: number | undefined = undefined;

    constructor() {
        makeAutoObservable(this);
    }

    // -- lists feed surface --
    get lists() {
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
    setList = (listId: string, list: ListToDisplay) => this.feed.setItemByKey(listId, list);
    setSearchQry = (val: string) => this.feed.setPredicate("searchQry", val);
    resetPredicate = () => this.feed.predicate.clear();
    resetPagingParams = () => this.feed.setPage(1, 25);
    /** Named resetListsState historically -- kept as an alias, prefer resetFeedState. */
    resetFeedState = this.feed.reset;
    resetListsState = this.feed.reset;

    // -- saved list items feed surface --
    get savedListItems() {
        return this.savedListItemsFeed.items;
    }
    get loadingListItems() {
        return this.savedListItemsFeed.loadingInitial;
    }
    get savedListItemsPagingParams() {
        return this.savedListItemsFeed.pagingParams;
    }
    get savedListItemsPagination() {
        return this.savedListItemsFeed.pagination;
    }
    get savedListItemsPredicate() {
        return this.savedListItemsFeed.predicate;
    }

    setSavedListItemsPagingParams = (pagingParams: PagingParams) =>
        this.savedListItemsFeed.setPagingParams(pagingParams);
    setSavedListItemsPagination = this.savedListItemsFeed.setPagination;
    setLoadingListItems = this.savedListItemsFeed.setLoadingInitial;
    setSavedListItem = (listItemId: string, listItem: ListItemToDisplay) =>
        this.savedListItemsFeed.setItemByKey(listItemId, listItem);

    setListInfoForSavedListItems = (val: any | undefined) => {
        this.listInfoForSavedListItems = val;
    }
    setSelectedList = (val: ListToDisplay | undefined) => {
        this.selectedList = val;
    }
    setLoadingUpsert = (value: boolean) => {
        this.loadingUpsert = value;
    }
    setCurrentStepInListCreation = (currentStep: number) => {
        this.currentStepInListCreation = currentStep;
    }
    setListCreationForm = (val: CreateListOrCommunityForm) => {
        this.listCreationForm = val;
    }

    loadLists = async (refresh?: boolean) =>
        this.feed.load((params) => agent.listApiClient.getLists(params), { refresh });

    loadSavedListItems = async (listId: string) =>
        this.savedListItemsFeed.load((params) =>
            agent.listApiClient.getSavedListItems(params, listId)
        );

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

            await this.loadLists(true);
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }

    savePostToList = async (postId: string, listId: string) => {
        this.setLoadingUpsert(true);
        try {
            await agent.listApiClient.saveItemToList(postId, "post", listId)
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }

    saveUserToList = async (userToSaveId: string, listId: string) => {
        this.setLoadingUpsert(true);
        try {
            await agent.listApiClient.saveItemToList(userToSaveId, "user", listId)
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }

    deleteList = async (listId: string) => {
        this.setLoadingUpsert(true);
        try {
            await agent.listApiClient.deleteList(listId);

            await this.loadLists(true);
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }

    deleteSavedListItem = async (listId: string, listItemId: string) => {
        this.setLoadingUpsert(true);
        try {
            await agent.listApiClient.deleteSavedListItem(listId, listItemId);

            runInAction(() => this.savedListItemsFeed.removeItem(listItemId));
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }
}
