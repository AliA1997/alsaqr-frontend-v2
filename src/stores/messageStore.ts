import { makeAutoObservable, runInAction } from "mobx";
import { MessageFormDto, MessageHistoryToDisplay, MessageToDisplay, ProfileUser } from "@typings";
import { PagingParams } from "@models/common";
import agent from "@utils/api/agent";
import FeedState from "./base/feedState";

export default class MessageStore {

    // Two feeds: the open thread's messages, and the thread list. They used to
    // share one `pagination` field, so loading the thread list overwrote the
    // message pagination.
    feed = new FeedState<MessageToDisplay>((message) => message.messageId, {
        itemsPerPage: 10,
        clearStrategy: "always",
    });
    historyFeed = new FeedState<MessageHistoryToDisplay>((thread) => thread.receiverId, {
        itemsPerPage: 25,
        clearStrategy: "always",
    });

    loadingUpsert = false;
    currentProfileToMessage: ProfileUser | undefined = undefined;
    selectedDirectMessageHistoryItem: MessageHistoryToDisplay | undefined;

    constructor() {
        makeAutoObservable(this);
    }

    // -- direct messages feed surface --
    get directMessages() {
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
    setDirectMessage = (message: MessageToDisplay) => this.feed.setItem(message);
    resetFeedState = () => this.feed.predicate.clear();

    // -- message history (thread list) feed surface --
    get directMessageHistory() {
        return this.historyFeed.items;
    }
    get loadingHistory() {
        return this.historyFeed.loadingInitial;
    }
    get historyPagingParams() {
        return this.historyFeed.pagingParams;
    }
    get historyPagination() {
        return this.historyFeed.pagination;
    }

    setHistoryPagingParams = (pagingParams: PagingParams) =>
        this.historyFeed.setPagingParams(pagingParams);
    setHistoryPagination = this.historyFeed.setPagination;
    setLoadingHistory = this.historyFeed.setLoadingInitial;
    setDirectMessageHistory = (messageHistory: MessageHistoryToDisplay) =>
        this.historyFeed.setItem(messageHistory);

    setSelectedDirectMessageHistoryItem = (val: MessageHistoryToDisplay | undefined) => {
        this.feed.clearItems();
        this.selectedDirectMessageHistoryItem = val;
    }
    setCurrentProfileToMessage = (val: ProfileUser | undefined) => {
        this.currentProfileToMessage = val;
    }
    setLoadingUpsert = (val: boolean) => {
        this.loadingUpsert = val;
    }

    loadDirectMessages = async (senderId: string, receiverId: string) => {
        this.feed.setPredicate('senderId', senderId);
        this.feed.setPredicate('receiverId', receiverId);

        return this.feed.load((params) => agent.messageApiClient.loadDirectMessages(params));
    }

    loadDirectMessageHistory = async () =>
        this.historyFeed.load((params) =>
            agent.messageApiClient.loadDirectMessageThreads(params)
        );

    sendDirectMessage = async (messageForm: MessageFormDto) => {
        this.setLoadingUpsert(true);
        try {
            await agent.messageApiClient.sendDirectMessage(messageForm);
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }
}
