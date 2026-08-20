import { makeAutoObservable } from "mobx";
import { NotificationToDisplay } from "@typings";
import { PagingParams } from "@models/common";
import agent from "@utils/api/agent";
import FeedState from "./base/feedState";

export default class NotificationStore {

    feed = new FeedState<NotificationToDisplay>((not) => not.notificationId, {
        itemsPerPage: 10,
        staticParams: { all: "true" },
    });

    constructor() {
        makeAutoObservable(this);
    }

    // -- feed surface, delegated so consumers keep reading notificationStore.x --
    get notifications() {
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
    setNotification = (notificationId: string, notification: NotificationToDisplay) =>
        this.feed.setItemByKey(notificationId, notification);
    setSearchQry = (val: string) => this.feed.setPredicate("searchQry", val);
    resetFeedState = this.feed.reset;

    loadNotifications = async (userId: string) =>
        this.feed.load((params) => agent.notificationApiClient.getNotifications(userId, params));
}
