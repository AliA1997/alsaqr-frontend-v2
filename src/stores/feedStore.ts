import { makeAutoObservable, runInAction } from "mobx";
import { CreatePostForm, PostToDisplay } from "@typings";
import { PagingParams } from "@models/common";
import agent from "@utils/api/agent";
import { BookmarkParams, LikedPostParams, RePostParams } from "@models/posts";
import { DEFAULT_MEDIUM_ITEMS_PERPAGE } from "@utils/constants";
import FeedState from "./base/feedState";

export default class FeedStore {

    feed = new FeedState<PostToDisplay>((pst) => pst.postId, {
        itemsPerPage: +DEFAULT_MEDIUM_ITEMS_PERPAGE,
    });

    loadingUpsert = false;
    loadingPost = false;
    loadingComments = false;
    loadedPost: PostToDisplay | undefined = undefined;

    constructor() {
        makeAutoObservable(this);
    }

    // -- feed surface, delegated so consumers keep reading feedStore.x --
    get posts() {
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
    setPost = (postId: string, post: PostToDisplay) => this.feed.setItemByKey(postId, post);
    setSearchQry = (val: string) => this.feed.setPredicate("searchQry", val);
    resetFeedState = this.feed.reset;

    setLoadingUpsert = (value: boolean) => {
        this.loadingUpsert = value;
    }
    setLoadingPost = (value: boolean) => {
        this.loadingPost = value;
    }
    setLoadingComments = (value: boolean) => {
        this.loadingComments = value;
    }
    setLoadedPost = (value: PostToDisplay) => {
        this.loadedPost = value;
    }

    loadPosts = async () => this.feed.load((params) => agent.postApiClient.getPosts(params));

    addPost = async (newPost: CreatePostForm) => {
        this.feed.setLoadingInitial(true);
        try {
            await agent.postApiClient.addPost(newPost) ?? {};
        } finally {
            runInAction(() => this.feed.setLoadingInitial(false));
        }
    }

    rePost = async (rePostParams: RePostParams) => {
        this.feed.setLoadingInitial(true);
        try {
            await agent.mutatePostApiClient.rePost(rePostParams) ?? {};
        } finally {
            runInAction(() => this.feed.setLoadingInitial(false));
        }
    }

    likedPost = async (likedPostParams: LikedPostParams) => {
        this.feed.setLoadingInitial(true);
        try {
            await agent.mutatePostApiClient.likePost(likedPostParams) ?? {};
        } finally {
            runInAction(() => this.feed.setLoadingInitial(false));
        }
    }

    bookmarkPost = async (bookmarkParams: BookmarkParams) => {
        this.feed.setLoadingInitial(true);
        try {
            await agent.mutatePostApiClient.bookmarkPost(bookmarkParams) ?? {};
        } finally {
            runInAction(() => this.feed.setLoadingInitial(false));
        }
    }

    deleteYourPost = async (postId: string) => {
        this.setLoadingUpsert(true);
        try {
            await agent.mutatePostApiClient.deleteYourPost(postId) ?? {};
        } finally {
            runInAction(() => this.setLoadingUpsert(false));
        }
    }

    loadPost = async (postId: string) => {
        this.setLoadingPost(true);
        try {
            const { post } = await agent.postApiClient.getPost(postId) ?? {};

            runInAction(() => {
                this.setLoadedPost(post);
            });
        } finally {
            runInAction(() => this.setLoadingPost(false));
        }
    }
}
