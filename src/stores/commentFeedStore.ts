import { makeAutoObservable, runInAction } from "mobx";
import { CommentForm, PostToDisplay } from "@typings";
import { PagingParams } from "@models/common";
import agent from "@utils/api/agent";
import FeedState from "./base/feedState";

export default class CommentFeedStore {

    feed = new FeedState<PostToDisplay>((cmt) => cmt.postId, { itemsPerPage: 10 });

    loadingComment = false;
    loadingUpsert = false;
    loadedComment: PostToDisplay | undefined;

    constructor() {
        makeAutoObservable(this);
    }

    // -- feed surface, delegated so consumers keep reading commentFeedStore.x --
    get comments() {
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
    setComment = (commentId: string, comment: PostToDisplay) =>
        this.feed.setItemByKey(commentId, comment);
    resetFeedState = this.feed.reset;

    setLoadingComment = (value: boolean) => {
        this.loadingComment = value;
    }
    setLoadedComment = (val: PostToDisplay) => {
        this.loadedComment = val;
    }
    setLoadingUpsert = (value: boolean) => {
        this.loadingUpsert = value;
    }

    loadComments = async (postId: string) =>
        this.feed.load((params) => agent.commentApiClient.getCommentsForPost(params, postId));

    addComment = async (newComment: CommentForm) => {
        this.setLoadingUpsert(true);
        try {
            await agent.commentApiClient.addComment(newComment) ?? {};
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }
}
