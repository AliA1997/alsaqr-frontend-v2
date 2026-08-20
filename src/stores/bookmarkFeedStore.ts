import { makeAutoObservable, runInAction } from "mobx";
import { PostToDisplay } from "@typings";
import { PagingParams } from "@models/common";
import agent from "@utils/api/agent";
import { BookmarkParams } from "@models/posts";
import FeedState from "./base/feedState";

export default class BookmarkFeedStore {

    feed = new FeedState<PostToDisplay>((pst) => pst.postId, { itemsPerPage: 10 });

    loadedBookmarkedPost: PostToDisplay | undefined = undefined;

    constructor() {
        makeAutoObservable(this);
    }

    // -- feed surface, delegated so consumers keep reading bookmarkFeedStore.x --
    get bookmarkedPosts() {
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
    setBookmarkedPost = (postId: string, post: PostToDisplay) =>
        this.feed.setItemByKey(postId, post);
    resetBookmarksFeedState = this.feed.reset;

    setLoadedBookmarkedPost = (value: PostToDisplay) => {
        this.loadedBookmarkedPost = value;
    }

    loadBookmarkedPosts = async (sessionUserId: string) =>
        this.feed.load((params) =>
            agent.postApiClient.getBookmarkedPosts(params, sessionUserId)
        );

    bookmarkPost = async (bookmarkParams: BookmarkParams) => {
        this.feed.setLoadingInitial(true);
        try {
            await agent.mutatePostApiClient.bookmarkPost(bookmarkParams) ?? {};
        } finally {
            runInAction(() => this.feed.setLoadingInitial(false));
        }
    }

    loadPost = async (postId: string) => {
        this.feed.setLoadingInitial(true);
        try {
            const post = await agent.postApiClient.getPost(postId) ?? {};

            runInAction(() => {
                this.setLoadedBookmarkedPost(post);
            });
        } finally {
            runInAction(() => this.feed.setLoadingInitial(false));
        }
    }
}
